import { Bricolage_Grotesque } from "next/font/google";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage-src",
  subsets: ["latin"],
  axes: ["wdth", "opsz"],
});

export const landingFontVariables = bricolage.variable;
