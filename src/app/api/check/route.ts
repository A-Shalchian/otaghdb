import { stageSinglePhoto, stagedSubject } from "@/features/items/analysis";
import { matchPhoto } from "@/features/search/search";
import { photoFromUpload, stagedUrl } from "@/lib/images";
import { errorMessage } from "@/lib/services";

export async function POST(request: Request) {
  try {
    const photo = await photoFromUpload((await request.formData()).get("photo"));
    if (!photo) return Response.json({ error: "Choose a photo first." }, { status: 400 });
    const staged = await stageSinglePhoto(photo);
    const subject = await stagedSubject(staged.token);
    if (!subject) throw new Error("Could not read that photo.");
    return Response.json({
      cutoutUrl: staged.hasCutout ? stagedUrl(staged.token, "cutout.png") : null,
      matches: await matchPhoto(subject),
    });
  } catch (error) {
    return Response.json({ cutoutUrl: null, matches: [], error: errorMessage(error) });
  }
}
