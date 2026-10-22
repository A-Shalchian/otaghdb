import type { ComponentType } from "react";
import Blueprint from "./variants/blueprint";
import RawHtml from "./variants/brutalist";
import CatalogCard from "./variants/catalog";
import JustAsk from "./variants/chat";
import FieldGuide from "./variants/fieldguide";
import Knolling from "./variants/knolling";
import LabelMaker from "./variants/labelmaker";
import MuseumLabels from "./variants/museum";
import MorningPaper from "./variants/newspaper";
import PersianTile from "./variants/persian";
import PixelRoom from "./variants/pixel";
import Receipt from "./variants/receipt";
import Spreadsheet from "./variants/spreadsheet";
import SwissPoster from "./variants/swiss";
import TerminalQuery from "./variants/terminal";
import CutoutZine from "./variants/zine";

export type LandingVariant = { slug: string; name: string; Component: ComponentType };

export const landingVariants: LandingVariant[] = [
  { slug: "knolling", name: "Knolling", Component: Knolling },
  { slug: "catalog", name: "Catalog card", Component: CatalogCard },
  { slug: "pixel", name: "Pixel room", Component: PixelRoom },
  { slug: "persian", name: "Persian tile", Component: PersianTile },
  { slug: "terminal", name: "Terminal query", Component: TerminalQuery },
  { slug: "blueprint", name: "Blueprint", Component: Blueprint },
  { slug: "receipt", name: "Receipt", Component: Receipt },
  { slug: "museum", name: "Museum labels", Component: MuseumLabels },
  { slug: "zine", name: "Cutout zine", Component: CutoutZine },
  { slug: "swiss", name: "Swiss poster", Component: SwissPoster },
  { slug: "brutalist", name: "Raw HTML", Component: RawHtml },
  { slug: "labelmaker", name: "Label maker", Component: LabelMaker },
  { slug: "spreadsheet", name: "Spreadsheet", Component: Spreadsheet },
  { slug: "chat", name: "Just ask", Component: JustAsk },
  { slug: "newspaper", name: "Morning paper", Component: MorningPaper },
  { slug: "fieldguide", name: "Field guide", Component: FieldGuide },
];
