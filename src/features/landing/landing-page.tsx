import { landingFontVariables } from "./fonts";
import JustAsk from "./just-ask";

export function LandingPage() {
  return (
    <div className={`${landingFontVariables} flex flex-1 flex-col`}>
      <JustAsk />
    </div>
  );
}
