import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro import KPipeline

VIDEO = Path(__file__).resolve().parent.parent
OUT = VIDEO / "public" / "audio"
RATE = 24000
VOICE = sys.argv[1] if len(sys.argv) > 1 else "af_heart"
ONLY = set(sys.argv[2:])


def trim(audio: np.ndarray, threshold: float = 0.01) -> np.ndarray:
    loud = np.flatnonzero(np.abs(audio) > threshold)
    if loud.size == 0:
        return audio
    pad = int(0.04 * RATE)
    return audio[max(0, loud[0] - pad) : loud[-1] + pad]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    lines = json.loads((VIDEO / "src" / "narration.json").read_text(encoding="utf-8"))
    pipeline = KPipeline(lang_code="a", repo_id="hexgrad/Kokoro-82M")
    saved = VIDEO / "src" / "voice-durations.json"
    durations = json.loads(saved.read_text(encoding="utf-8")) if ONLY and saved.exists() else {}
    for line in lines:
        if ONLY and line["id"] not in ONLY:
            continue
        chunks = [np.asarray(result.audio) for result in pipeline(line["text"], voice=VOICE, speed=1.0)]
        audio = trim(np.concatenate(chunks))
        sf.write(OUT / f"voice-{line['id']}.wav", audio, RATE)
        durations[line["id"]] = round(len(audio) / RATE, 3)
        print(f"{line['id']}: {durations[line['id']]}s")
    saved.write_text(json.dumps(durations, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
