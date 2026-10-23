import { loadFont as loadBricolage } from "@remotion/google-fonts/BricolageGrotesque";
import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";

export const sans = loadGeist("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] }).fontFamily;
export const mono = loadGeistMono("normal", { weights: ["400", "500"], subsets: ["latin"] }).fontFamily;
export const wordmark = loadBricolage("normal", { weights: ["800"], subsets: ["latin"] }).fontFamily;

export const C = {
  paper: "#f4f2ec",
  card: "#fbfaf6",
  ink: "#1c1b18",
  soft: "#6f6b62",
  line: "#dcd8ce",
  accent: "#3d4f8f",
  accentSoft: "#e1e7ef",
  wordmarkInk: "#18212c",
};

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
