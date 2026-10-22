import {
  Architects_Daughter,
  Archivo,
  Bricolage_Grotesque,
  Caveat,
  Fraunces,
  IBM_Plex_Mono,
  Instrument_Serif,
  Silkscreen,
  Special_Elite,
  UnifrakturMaguntia,
  Vazirmatn,
  VT323,
} from "next/font/google";

const instrument = Instrument_Serif({
  variable: "--font-instrument-src",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  preload: false,
});

const fraunces = Fraunces({
  variable: "--font-fraunces-src",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  preload: false,
});

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

const vazirmatn = Vazirmatn({
  variable: "--font-vazir-src",
  subsets: ["arabic", "latin"],
  preload: false,
});

const archivo = Archivo({
  variable: "--font-archivo-src",
  subsets: ["latin"],
  axes: ["wdth"],
  preload: false,
});

const fraktur = UnifrakturMaguntia({
  variable: "--font-fraktur-src",
  weight: "400",
  subsets: ["latin"],
  preload: false,
});

const typewriter = Special_Elite({
  variable: "--font-typewriter-src",
  weight: "400",
  subsets: ["latin"],
  preload: false,
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage-src",
  subsets: ["latin"],
  axes: ["wdth", "opsz"],
  preload: false,
});

const caveat = Caveat({
  variable: "--font-caveat-src",
  subsets: ["latin"],
  preload: false,
});

const architect = Architects_Daughter({
  variable: "--font-architect-src",
  weight: "400",
  subsets: ["latin"],
  preload: false,
});

export const landingFontVariables = [
  instrument,
  fraunces,
  plex,
  silkscreen,
  vt323,
  vazirmatn,
  archivo,
  fraktur,
  typewriter,
  bricolage,
  caveat,
  architect,
]
  .map((font) => font.variable)
  .join(" ");
