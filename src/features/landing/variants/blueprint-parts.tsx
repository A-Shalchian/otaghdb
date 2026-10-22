import { sampleItems } from "../content";

const WHITE = "#ffffff";
const CYAN = "#a9d8f0";
const PAPER = "#1c3f6e";

export const bedroomItems = sampleItems.filter((item) => item.room === "bedroom");

type Pin = {
  x: number;
  y: number;
  label: { x: number; y: number; anchor: "start" | "end" };
  leader: string;
};

const pins: Record<number, Pin> = {
  42: { x: 690, y: 170, label: { x: 800, y: 150, anchor: "start" }, leader: "M690 170 L776 144 H794" },
  17: { x: 690, y: 262, label: { x: 800, y: 268, anchor: "start" }, leader: "M690 262 L776 262 H794" },
  77: { x: 618, y: 135, label: { x: 800, y: 50, anchor: "start" }, leader: "M618 135 L652 44 H794" },
  8: { x: 560, y: 135, label: { x: 520, y: 50, anchor: "end" }, leader: "M560 135 L540 44 H526" },
  12: { x: 226, y: 163, label: { x: 30, y: 50, anchor: "start" }, leader: "M226 163 L290 44 H272" },
};

const walls = [
  [188, 98, 142, 12],
  [500, 98, 232, 12],
  [188, 510, 412, 12],
  [690, 510, 42, 12],
  [188, 98, 12, 424],
  [720, 98, 12, 424],
];

function Walls({ hatch }: { hatch: string }) {
  return (
    <g>
      {walls.map(([x, y, width, height]) => (
        <rect
          key={`${x}-${y}-${width}`}
          x={x}
          y={y}
          width={width}
          height={height}
          fill={`url(#${hatch})`}
          stroke={WHITE}
          strokeWidth="1.5"
        />
      ))}
      <path d="M330 98H500M330 104H500M330 110H500M330 98V110M500 98V110" stroke={WHITE} strokeWidth="1" />
      <path d="M690 510V420" stroke={WHITE} strokeWidth="2" />
      <path d="M690 420A90 90 0 0 0 600 510" fill="none" stroke={CYAN} strokeWidth="1" strokeDasharray="4 4" />
    </g>
  );
}

function Furniture() {
  return (
    <g fill="none" stroke={CYAN} strokeWidth="1.5">
      <rect x="200" y="196" width="200" height="160" />
      <rect x="210" y="206" width="44" height="64" rx="6" />
      <rect x="210" y="282" width="44" height="64" rx="6" />
      <path d="M280 196V356M360 356L400 316" />
      <rect x="200" y="140" width="52" height="46" />
      <rect x="530" y="110" width="120" height="50" />
      <path d="M530 152H650" />
      <rect x="656" y="110" width="6" height="114" />
      <rect x="662" y="216" width="6" height="114" />
      <path d="M668 330H720" />
      <path d="M692 118V322" strokeDasharray="6 5" />
      <rect x="240" y="452" width="160" height="58" />
      <rect x="296" y="464" width="44" height="28" />
      <rect x="296" y="400" width="50" height="42" rx="10" />
      <path d="M300 404H342" />
    </g>
  );
}

function Dimensions() {
  return (
    <g stroke={CYAN} strokeWidth="1" fill="none">
      <path d="M188 530V584M732 530V584M180 572H740M182 578L194 566M726 578L738 566" />
      <path d="M180 98H142M180 522H142M150 90V530M144 104L156 92M144 528L156 516" />
      <text x="460" y="564" fill={CYAN} stroke="none" textAnchor="middle" className="font-plex" fontSize="14">
        5440
      </text>
      <text
        x="140"
        y="310"
        fill={CYAN}
        stroke="none"
        textAnchor="middle"
        transform="rotate(-90 140 310)"
        className="font-plex"
        fontSize="14"
      >
        4240
      </text>
      <path d="M780 596H880V602H780Z" fill={WHITE} stroke={WHITE} />
      <path d="M880 596H980V602H880Z" stroke={WHITE} />
      <text x="780" y="622" fill={CYAN} stroke="none" textAnchor="middle" className="font-plex" fontSize="12">
        0
      </text>
      <text x="880" y="622" fill={CYAN} stroke="none" textAnchor="middle" className="font-plex" fontSize="12">
        1
      </text>
      <text x="980" y="622" fill={CYAN} stroke="none" textAnchor="end" className="font-plex" fontSize="12">
        2 m
      </text>
      <circle cx="900" cy="470" r="20" stroke={WHITE} />
      <path d="M900 446L909 478L900 472L891 478Z" fill={WHITE} stroke="none" />
      <text x="900" y="438" fill={WHITE} stroke="none" textAnchor="middle" className="font-plex" fontSize="13">
        N
      </text>
    </g>
  );
}

function Callouts() {
  return (
    <g>
      {bedroomItems.map((item) => {
        const pin = pins[item.id];
        if (!pin) return null;
        const { x, y, anchor } = pin.label;
        return (
          <g key={item.id}>
            <path d={pin.leader} fill="none" stroke={WHITE} strokeWidth="1" />
            <text x={x} y={y} textAnchor={anchor} fill={WHITE} fontSize="21" className="font-architect">
              {item.name} #{item.id}
            </text>
            <text x={x} y={y + 22} textAnchor={anchor} fill={CYAN} fontSize="13" className="font-plex">
              {item.spot}
            </text>
            {item.container ? (
              <text x={x} y={y + 40} textAnchor={anchor} fill={CYAN} fontSize="13" className="font-plex">
                in {item.container}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

function Markers({ radius }: { radius: number }) {
  return (
    <g>
      {bedroomItems.map((item) => {
        const pin = pins[item.id];
        if (!pin) return null;
        return (
          <g key={item.id}>
            <circle cx={pin.x} cy={pin.y} r={radius} fill={WHITE} />
            <text
              x={pin.x}
              y={pin.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={PAPER}
              fontSize={radius * 0.9}
              fontWeight="600"
              className="font-plex"
            >
              {item.id}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export function FloorPlan({ compact, className }: { compact: boolean; className: string }) {
  const hatch = compact ? "blueprint-hatch-compact" : "blueprint-hatch-wide";
  return (
    <svg
      viewBox={compact ? "176 86 568 448" : "0 0 1000 640"}
      role="img"
      aria-label="Floor plan of a bedroom with a bed, nightstand, dresser, closet and desk. Numbered markers show where five items are filed."
      className={className}
    >
      <defs>
        <pattern id={hatch} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke={CYAN} strokeWidth="1.2" />
        </pattern>
      </defs>
      <Walls hatch={hatch} />
      <Furniture />
      <text x="520" y="300" textAnchor="middle" fill={WHITE} fontSize="28" className="font-architect">
        Bedroom
      </text>
      <text x="520" y="324" textAnchor="middle" fill={CYAN} fontSize="13" className="font-plex">
        5.2 × 4.0 m
      </text>
      <text x="690" y="350" textAnchor="middle" fill={CYAN} fontSize="12" className="font-plex">
        CL
      </text>
      {compact ? null : (
        <>
          <Dimensions />
          <Callouts />
        </>
      )}
      <Markers radius={compact ? 19 : 15} />
    </svg>
  );
}
