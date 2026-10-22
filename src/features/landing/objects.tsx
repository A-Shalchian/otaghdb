import type { ReactNode, SVGAttributes } from "react";

export type ObjectKey =
  | "passport"
  | "backpack"
  | "hoodie"
  | "keys"
  | "cable"
  | "wallet"
  | "headphones"
  | "mug"
  | "book"
  | "sunglasses"
  | "pen"
  | "plant";

type Paint = {
  fill: (color: string) => SVGAttributes<SVGElement>;
  line: (color: string, width: number) => SVGAttributes<SVGElement>;
};

const colorPaint: Paint = {
  fill: (color) => ({ fill: color }),
  line: (color, width) => ({
    fill: "none",
    stroke: color,
    strokeWidth: width,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  }),
};

const linePaint: Paint = {
  fill: () => ({
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.5,
    strokeLinejoin: "round",
  }),
  line: () => ({
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  }),
};

const GOLD = "#c9a24a";

const drawings: Record<ObjectKey, (p: Paint) => ReactNode> = {
  passport: (p) => (
    <>
      <rect x="30" y="16" width="60" height="88" rx="6" {...p.fill("#1f3a5f")} />
      <circle cx="60" cy="52" r="13" {...p.line(GOLD, 3)} />
      <path d="M47 52h26M60 39v26" {...p.line(GOLD, 2)} />
      <rect x="42" y="78" width="36" height="4" rx="2" {...p.fill(GOLD)} />
      <rect x="47" y="87" width="26" height="3" rx="1.5" {...p.fill(GOLD)} />
    </>
  ),
  backpack: (p) => (
    <>
      <path d="M48 30c0-14 24-14 24 0" {...p.line("#1f1f22", 5)} />
      <rect x="26" y="28" width="68" height="80" rx="20" {...p.fill("#2b2b2f")} />
      <rect x="36" y="64" width="48" height="34" rx="9" {...p.fill("#3c3c42")} />
      <path d="M42 72h36" {...p.line("#56565d", 2.5)} />
      <rect x="54" y="40" width="12" height="6" rx="3" {...p.fill("#56565d")} />
    </>
  ),
  hoodie: (p) => (
    <>
      <path
        d="M40 26 28 34 14 70l12 4 8-18v48h52V56l8 18 12-4-14-36-12-8c-6 10-34 10-40 0Z"
        {...p.fill("#8a8f96")}
      />
      <path d="M42 26c4-16 32-16 36 0-8 9-28 9-36 0Z" {...p.fill("#72777e")} />
      <rect x="44" y="76" width="32" height="16" rx="4" {...p.fill("#7b8087")} />
      <path d="M60 40v64" {...p.line("#62676e", 2)} />
      <path d="M54 34v12M66 34v12" {...p.line("#e6e6e6", 1.6)} />
    </>
  ),
  keys: (p) => (
    <>
      <circle cx="36" cy="38" r="15" {...p.line("#9da1a6", 4)} />
      <g transform="rotate(28 52 62)">
        <circle cx="50" cy="62" r="13" {...p.fill(GOLD)} />
        <rect x="58" y="58" width="44" height="8" rx="2" {...p.fill(GOLD)} />
        <rect x="88" y="65" width="5" height="8" {...p.fill(GOLD)} />
        <rect x="96" y="65" width="5" height="11" {...p.fill(GOLD)} />
        <circle cx="46" cy="62" r="4" {...p.fill("#a8822f")} />
      </g>
      <g transform="rotate(64 40 50)">
        <circle cx="46" cy="50" r="11" {...p.fill("#b9bdc3")} />
        <rect x="53" y="47" width="36" height="7" rx="2" {...p.fill("#b9bdc3")} />
        <rect x="78" y="53" width="4" height="7" {...p.fill("#b9bdc3")} />
      </g>
    </>
  ),
  cable: (p) => (
    <>
      <path d="M24 30c44 0 6 62 54 62" {...p.line("#3f3f44", 6)} />
      <rect x="8" y="24" width="18" height="12" rx="3" {...p.fill("#2a2a2e")} />
      <rect x="2" y="27" width="8" height="6" rx="1.5" {...p.fill("#b9bdc3")} />
      <rect x="76" y="86" width="22" height="12" rx="3" {...p.fill("#2a2a2e")} />
      <rect x="96" y="89" width="10" height="6" rx="1.5" {...p.fill("#b9bdc3")} />
    </>
  ),
  wallet: (p) => (
    <>
      <rect x="18" y="34" width="84" height="56" rx="9" {...p.fill("#7a4a2a")} />
      <rect x="24" y="40" width="72" height="44" rx="6" {...p.line("#a06a45", 1.5)} strokeDasharray="3 3" />
      <rect x="62" y="48" width="40" height="28" rx="7" {...p.fill("#653d22")} />
      <circle cx="90" cy="62" r="4" {...p.fill(GOLD)} />
    </>
  ),
  headphones: (p) => (
    <>
      <path d="M28 70c0-50 64-50 64 0" {...p.line("#202024", 7)} />
      <rect x="18" y="60" width="20" height="32" rx="9" {...p.fill("#202024")} />
      <rect x="82" y="60" width="20" height="32" rx="9" {...p.fill("#202024")} />
      <path d="M28 92c0 14 10 18 26 18" {...p.line("#202024", 2.5)} />
    </>
  ),
  mug: (p) => (
    <>
      <path d="M80 46c22 0 22 32 0 32" {...p.line("#3d6fb6", 7)} />
      <rect x="28" y="32" width="54" height="62" rx="7" {...p.fill("#3d6fb6")} />
      <ellipse cx="55" cy="33" rx="27" ry="5" {...p.fill("#2f5a96")} />
      <path d="M38 50v30" {...p.line("#6f97cf", 3)} />
    </>
  ),
  book: (p) => (
    <>
      <rect x="84" y="22" width="6" height="78" rx="1" {...p.fill("#ece4d1")} />
      <rect x="30" y="18" width="56" height="84" rx="3" {...p.fill("#2f5d50")} />
      <rect x="30" y="18" width="9" height="84" rx="2" {...p.fill("#24483e")} />
      <rect x="47" y="36" width="30" height="4" rx="2" {...p.fill("#e7dcc0")} />
      <rect x="47" y="45" width="21" height="3" rx="1.5" {...p.fill("#e7dcc0")} />
    </>
  ),
  sunglasses: (p) => (
    <>
      <path d="M17 54 7 48M103 54l10-6" {...p.line("#1b1b1d", 4)} />
      <path d="M54 56c4-6 8-6 12 0" {...p.line("#1b1b1d", 4)} />
      <rect x="16" y="46" width="38" height="28" rx="13" {...p.fill("#1b1b1d")} />
      <rect x="66" y="46" width="38" height="28" rx="13" {...p.fill("#1b1b1d")} />
      <path d="M24 54l8-4M74 54l8-4" {...p.line("#5a5a60", 2.5)} />
    </>
  ),
  pen: (p) => (
    <g transform="rotate(-38 60 60)">
      <rect x="20" y="53" width="66" height="14" rx="7" {...p.fill("#1d1d20")} />
      <rect x="40" y="50" width="4" height="20" rx="1" {...p.fill(GOLD)} />
      <path d="M86 54l18 6-18 6Z" {...p.fill(GOLD)} />
      <path d="M90 60h10" {...p.line("#8a6a24", 1.2)} />
    </g>
  ),
  plant: (p) => (
    <>
      <ellipse cx="46" cy="50" rx="8" ry="21" transform="rotate(-32 46 50)" {...p.fill("#4f8a4b")} />
      <ellipse cx="74" cy="48" rx="8" ry="21" transform="rotate(32 74 48)" {...p.fill("#5f9b55")} />
      <ellipse cx="60" cy="38" rx="7" ry="25" {...p.fill("#467d42")} />
      <path d="M45 74h30l-6 30H51Z" {...p.fill("#a8603f")} />
      <rect x="40" y="68" width="40" height="9" rx="2" {...p.fill("#8f4f33")} />
    </>
  ),
};

export function ObjectArt({
  name,
  mode = "color",
  className,
  title,
}: {
  name: ObjectKey;
  mode?: "color" | "line";
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label={title ?? name}
      className={className}
    >
      {drawings[name](mode === "line" ? linePaint : colorPaint)}
    </svg>
  );
}

export const objectKeys = Object.keys(drawings) as ObjectKey[];
