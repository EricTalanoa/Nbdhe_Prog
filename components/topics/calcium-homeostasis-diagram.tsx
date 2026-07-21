// Original self-drawn schematic (7d-topic-notes-depth, batch 5) — the PTH negative-feedback loop
// for calcium homeostasis: falling serum Ca²⁺ triggers parathyroid hormone (PTH) release, which
// raises blood calcium through three simultaneous target-organ effects (bone, kidney, intestine),
// and restored serum Ca²⁺ is itself the signal that shuts PTH release back off. Not traced from
// any textbook figure. Uses theme CSS vars via Tailwind fill/stroke utilities so it stays legible
// in light and dark mode.

function FlowArrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      className="stroke-foreground"
      strokeWidth="1.75"
      markerEnd="url(#calc-arrow)"
    />
  );
}

function TargetBox({
  x,
  title,
  lines,
}: {
  x: number;
  title: string;
  lines: string[];
}) {
  const width = 190;
  const cx = x + width / 2;
  return (
    <g>
      <rect
        x={x}
        y={148}
        width={width}
        height={92}
        rx="8"
        className="fill-secondary stroke-foreground"
        strokeWidth="1.25"
      />
      <text x={cx} y={170} fontSize="12.5" fontWeight="600" textAnchor="middle" className="fill-foreground">
        {title}
      </text>
      {lines.map((line, i) => (
        <text
          key={i}
          x={cx}
          y={188 + i * 15}
          fontSize="9.5"
          textAnchor="middle"
          className="fill-muted-foreground"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

export function CalciumHomeostasisDiagram() {
  return (
    <svg
      viewBox="0 0 660 340"
      role="img"
      aria-label="Diagram of parathyroid hormone regulating calcium homeostasis: falling serum calcium triggers PTH release, which acts on bone to increase osteoclastic resorption, on the kidney to increase calcium reabsorption and activate vitamin D, and on the intestine to increase calcium absorption via that active vitamin D, restoring serum calcium and shutting off further PTH release"
      className="mx-auto h-auto w-full max-w-xl text-foreground"
    >
      <title>PTH and calcium homeostasis: one trigger, three coordinated targets</title>
      <defs>
        <marker id="calc-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="fill-foreground" />
        </marker>
      </defs>

      {/* Trigger */}
      <rect x="230" y="14" width="200" height="36" rx="8" className="fill-destructive stroke-foreground" fillOpacity={0.85} strokeWidth="1.25" />
      <text x="330" y="37" fontSize="13" fontWeight="600" textAnchor="middle" className="fill-destructive-foreground">
        Serum Ca²⁺ falls
      </text>

      <FlowArrow x1={330} y1={50} x2={330} y2={69} />

      {/* Gland */}
      <rect x="205" y="71" width="250" height="42" rx="8" className="fill-card stroke-foreground" strokeWidth="1.5" />
      <text x="330" y="88" fontSize="11.5" fontWeight="600" textAnchor="middle" className="fill-foreground">
        Parathyroid glands
      </text>
      <text x="330" y="104" fontSize="10.5" textAnchor="middle" className="fill-muted-foreground">
        release PTH
      </text>

      {/* Fan out to three targets */}
      <FlowArrow x1={280} y1={113} x2={110} y2={146} />
      <FlowArrow x1={330} y1={113} x2={330} y2={146} />
      <FlowArrow x1={380} y1={113} x2={550} y2={146} />

      <TargetBox
        x={15}
        title="Bone"
        lines={["↑ osteoclastic resorption", "releases Ca²⁺ and PO₄³⁻", "from bone matrix"]}
      />
      <TargetBox
        x={235}
        title="Kidney"
        lines={["↑ renal Ca²⁺ reabsorption;", "activates vitamin D", "(1,25-(OH)₂D)"]}
      />
      <TargetBox
        x={455}
        title="Intestine"
        lines={["↑ dietary Ca²⁺ absorption,", "via that activated", "vitamin D"]}
      />

      {/* Converge back down */}
      <line x1={110} y1={240} x2={330} y2={266} className="stroke-foreground" strokeWidth="1.75" />
      <line x1={330} y1={240} x2={330} y2={266} className="stroke-foreground" strokeWidth="1.75" />
      <line x1={550} y1={240} x2={330} y2={266} className="stroke-foreground" strokeWidth="1.75" />
      <FlowArrow x1={330} y1={266} x2={330} y2={283} />

      {/* Restored state */}
      <rect x="230" y="285" width="200" height="36" rx="8" className="fill-chart-3 stroke-foreground" fillOpacity={0.85} strokeWidth="1.25" />
      <text x="330" y="308" fontSize="13" fontWeight="600" textAnchor="middle" className="fill-foreground">
        Serum Ca²⁺ restored
      </text>

      <text x="330" y="335" fontSize="10.5" textAnchor="middle" className="fill-muted-foreground">
        Restored Ca²⁺ is itself the signal that shuts PTH release back off — a negative feedback loop.
      </text>
    </svg>
  );
}
