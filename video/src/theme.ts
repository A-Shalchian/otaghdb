import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { loadFont as loadSilkscreen } from "@remotion/google-fonts/Silkscreen";

export const sans = loadGeist("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] }).fontFamily;
export const mono = loadGeistMono("normal", { weights: ["400", "500"], subsets: ["latin"] }).fontFamily;
export const pixel = loadSilkscreen("normal", { weights: ["400", "700"], subsets: ["latin"] }).fontFamily;

export const C = {
  paper: "#f4f2ec",
  card: "#fbfaf6",
  ink: "#1c1b18",
  soft: "#6f6b62",
  line: "#dcd8ce",
  accent: "#2f6b4f",
  accentSoft: "#dfe9e2",
  wall: "#8b6b4f",
  wallEdge: "#5f4936",
  floorA: "#dac8a3",
  floorB: "#cdb58c",
};

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
