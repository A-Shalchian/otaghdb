import base64
import io
import json
import os
import threading
from contextlib import asynccontextmanager

import numpy as np
import onnxruntime as ort
import torch
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from PIL import Image, ImageOps
from pydantic import BaseModel
from rembg import remove
from rembg.sessions import sessions_class
from transformers import AutoModel, AutoProcessor, Sam2Model, Sam2Processor

REMBG_MODEL = os.environ.get("REMBG_MODEL", "u2net")
SAM_MODEL = os.environ.get("SAM_MODEL", "facebook/sam2.1-hiera-small")
SIGLIP_MODEL = os.environ.get("SIGLIP_MODEL", "google/siglip2-base-patch16-224")

torch.set_grad_enabled(False)

models: dict = {}

# FastAPI runs sync endpoints in a thread pool. The models are CPU-bound, so
# running two at once only makes both slower.
lock = threading.Lock()


def rembg_session(name: str):
    # onnxruntime's memory pool keeps every buffer it ever allocated, which
    # grew the process by about 0.8 GB with u2net. Without it, cutouts are
    # just as fast.
    options = ort.SessionOptions()
    options.enable_cpu_mem_arena = False
    session_class = next(c for c in sessions_class if c.name() == name)
    return session_class(name, options)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    models["rembg"] = rembg_session(REMBG_MODEL)
    models["sam"] = Sam2Model.from_pretrained(SAM_MODEL).eval()
    models["sam_processor"] = Sam2Processor.from_pretrained(SAM_MODEL)
    models["siglip"] = AutoModel.from_pretrained(SIGLIP_MODEL).eval()
    models["siglip_processor"] = AutoProcessor.from_pretrained(SIGLIP_MODEL)
    yield
    models.clear()


app = FastAPI(title="OtaghDB vision", lifespan=lifespan)


def read_image(upload: UploadFile) -> Image.Image:
    try:
        image = Image.open(io.BytesIO(upload.file.read()))
        return ImageOps.exif_transpose(image).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="not an image")


def on_white(image: Image.Image) -> Image.Image:
    if image.mode != "RGBA":
        return image.convert("RGB")
    background = Image.new("RGB", image.size, (255, 255, 255))
    background.paste(image, mask=image.getchannel("A"))
    return background


def crop_to_alpha(image: Image.Image) -> Image.Image:
    box = image.getchannel("A").point(lambda a: 255 if a > 16 else 0).getbbox()
    return image.crop(box) if box else image


def png_bytes(image: Image.Image) -> bytes:
    buffer = io.BytesIO()
    image.save(buffer, format="PNG", optimize=True)
    return buffer.getvalue()


def cut_with_mask(image: Image.Image, mask: np.ndarray) -> tuple[Image.Image, list[int]]:
    rgba = image.convert("RGBA")
    rgba.putalpha(Image.fromarray(mask.astype(np.uint8) * 255))
    box = rgba.getchannel("A").getbbox() or (0, 0, image.width, image.height)
    return rgba.crop(box), list(box)


def parse_json_list(raw: str | None, name: str) -> list | None:
    if not raw:
        return None
    try:
        value = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail=f"{name} must be JSON")
    if not isinstance(value, list) or not value:
        raise HTTPException(status_code=400, detail=f"{name} must be a non-empty list")
    return value


def unit_vector(features) -> list[float]:
    tensor = features.pooler_output if hasattr(features, "pooler_output") else features
    tensor = torch.nn.functional.normalize(tensor, dim=-1)
    return tensor[0].tolist()


@app.get("/health")
def health():
    return {
        "ok": bool(models),
        "rembg": REMBG_MODEL,
        "sam": SAM_MODEL,
        "siglip": SIGLIP_MODEL,
    }


@app.post("/cutout")
def cutout(photo: UploadFile = File(...)):
    image = read_image(photo)
    with lock:
        result = remove(image, session=models["rembg"])
    return Response(png_bytes(crop_to_alpha(result)), media_type="image/png")


@app.post("/segment")
def segment(
    photo: UploadFile = File(...),
    points: str | None = Form(None),
    boxes: str | None = Form(None),
):
    """points: [[x, y], ...] in pixels, all on one object.
    boxes: [[x1, y1, x2, y2], ...] in pixels, one object per box."""
    point_list = parse_json_list(points, "points")
    box_list = parse_json_list(boxes, "boxes")
    if (point_list is None) == (box_list is None):
        raise HTTPException(status_code=400, detail="send either points or boxes")

    image = read_image(photo)
    processor = models["sam_processor"]
    if point_list is not None:
        inputs = processor(
            images=image,
            input_points=[[point_list]],
            input_labels=[[[1] * len(point_list)]],
            return_tensors="pt",
        )
        multimask = True
    else:
        inputs = processor(images=image, input_boxes=[box_list], return_tensors="pt")
        multimask = False

    with lock:
        outputs = models["sam"](**inputs, multimask_output=multimask)
    masks = processor.post_process_masks(outputs.pred_masks, inputs["original_sizes"])[0]
    scores = outputs.iou_scores[0]

    objects = []
    for index in range(masks.shape[0]):
        best = int(scores[index].argmax())
        cut, box = cut_with_mask(image, masks[index, best].numpy())
        objects.append(
            {
                "png": base64.b64encode(png_bytes(cut)).decode("ascii"),
                "box": box,
                "score": round(float(scores[index, best]), 4),
            }
        )
    return {"objects": objects}


@app.post("/embed/image")
def embed_image(image: UploadFile = File(...)):
    picture = on_white(Image.open(io.BytesIO(image.file.read())))
    inputs = models["siglip_processor"](images=[picture], return_tensors="pt")
    with lock:
        features = models["siglip"].get_image_features(**inputs)
    return {"vector": unit_vector(features)}


class TextQuery(BaseModel):
    text: str


@app.post("/embed/text")
def embed_text(query: TextQuery):
    # SigLIP 2 was trained on lowercase text padded to 64 tokens.
    inputs = models["siglip_processor"](
        text=[query.text.lower()],
        padding="max_length",
        max_length=64,
        truncation=True,
        return_tensors="pt",
    )
    with lock:
        features = models["siglip"].get_text_features(**inputs)
    return {"vector": unit_vector(features)}
