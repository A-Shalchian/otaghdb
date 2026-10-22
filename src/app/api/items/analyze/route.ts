import { stageSinglePhoto } from "@/features/items/analysis";
import { photoFromUpload } from "@/lib/images";
import { errorMessage } from "@/lib/services";

export async function POST(request: Request) {
  try {
    const photo = await photoFromUpload((await request.formData()).get("photo"));
    if (!photo) return Response.json({ error: "Choose a photo first." }, { status: 400 });
    return Response.json(await stageSinglePhoto(photo));
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}
