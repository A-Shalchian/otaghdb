import type { ReactNode } from "react";

const code39: Record<string, string> = {
  "*": "010010100",
  A: "100001001",
  B: "001001001",
  D: "000011001",
  G: "000001101",
  H: "100001100",
  O: "100010010",
  T: "000010110",
};

function encode(text: string) {
  const narrow = 2;
  const wide = 5;
  const rects: { x: number; width: number }[] = [];
  let cursor = 0;
  for (const char of `*${text}*`) {
    const pattern = code39[char] ?? code39["*"];
    for (let index = 0; index < pattern.length; index += 1) {
      const width = pattern[index] === "1" ? wide : narrow;
      if (index % 2 === 0) rects.push({ x: cursor, width });
      cursor += width;
    }
    cursor += narrow;
  }
  return { rects, width: cursor - narrow };
}

const barcode = encode("OTAGHDB");

export function Barcode() {
  return (
    <figure className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${barcode.width} 50`}
        preserveAspectRatio="none"
        className="h-16 w-full max-w-[300px]"
        aria-hidden
      >
        {barcode.rects.map((rect) => (
          <rect key={rect.x} x={rect.x} y="0" width={rect.width} height="50" fill="#2a2926" />
        ))}
      </svg>
      <figcaption className="mt-1 text-xs">*OTAGHDB*</figcaption>
    </figure>
  );
}

export function Row({
  label,
  value,
  strong = false,
}: {
  label: ReactNode;
  value: ReactNode;
  strong?: boolean;
}) {
  return (
    <div className={`flex items-baseline gap-2 ${strong ? "text-base font-semibold" : ""}`}>
      <span className="min-w-0">{label}</span>
      <span aria-hidden className="mb-1 min-w-4 flex-1 border-b border-dotted border-[#2a2926]/45" />
      <span className="shrink-0 tabular-nums">{value}</span>
    </div>
  );
}

export function Rule() {
  return <hr className="my-6 border-dashed border-[#2a2926]/55" />;
}

export function Heading({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mb-3 text-center text-[13px] font-semibold uppercase">
      {children}
    </h2>
  );
}
