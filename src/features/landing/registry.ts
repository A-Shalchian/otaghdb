import type { ComponentType } from "react";
import JustAsk from "./variants/chat";
import Knolling from "./variants/knolling";
import PixelRoom from "./variants/pixel";

export type LandingVariant = { slug: string; name: string; Component: ComponentType };

export const landingVariants: LandingVariant[] = [
  { slug: "knolling", name: "Knolling", Component: Knolling },
  { slug: "pixel", name: "Pixel room", Component: PixelRoom },
  { slug: "chat", name: "Just ask", Component: JustAsk },
];
