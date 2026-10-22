import { Archivo, Bricolage_Grotesque, IBM_Plex_Mono, Silkscreen, VT323 } from "next/font/google";

const plex = IBM_Plex_Mono({
  variable: "--font-plex-src",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  preload: false,
});

const silkscreen = Silkscreen({
  variable: "--font-silkscreen-src",
  weight: ["400", "700"],
  subsets: ["latin"],
  preload: false,
});

const vt323 = VT323({
  variable: "--font-vt323-src",
  weight: "400",
  subsets: ["latin"],
  preload: false,
});

const archivo = Archivo({
  variable: "--font-archivo-src",
  subsets: ["latin"],
  axes: ["wdth"],
  preload: false,
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage-src",
  subsets: ["latin"],
  axes: ["wdth", "opsz"],
  preload: false,
});

export const landingFontVariables = [plex, silkscreen, vt323, archivo, bricolage]
  .map((font) => font.variable)
  .join(" ");
