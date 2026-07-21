// Original self-drawn schematic (7d-topic-notes-depth, batch 5) — two panels contrasting the two
// cellular adaptations tested against each other on the exam: hyperplasia (more cells, same size
// each) versus hypertrophy (same number of cells, each one larger). Ties directly to why
// drug-induced gingival enlargement (phenytoin, cyclosporine, nifedipine) is classified as
// hyperplasia — fibroblasts proliferate and increase collagen synthesis rather than individually
// enlarging. Not traced from any textbook figure. Uses theme CSS vars via Tailwind fill/stroke
// utilities so it stays legible in light and dark mode.

function ArrowRight({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return (
    <line
      x1={x1}
      y1={y}
      x2={x2}
      y2={y}
      className="stroke-foreground"
      strokeWidth="1.75"
      markerEnd="url(#hh-arrow)"
    />
  );
}

function HyperplasiaPanel() {
  const smallCx = [46, 64, 82, 100];
  const groupCx = [172, 190, 208, 226];
  return (
    <g transform="translate(10,10)">
      <text x="150" y="14" fontSize="14" fontWeight="600" textAnchor="middle" className="fill-foreground">
        Hyperplasia
      </text>
      <text x="150" y="30" fontSize="10.5" textAnchor="middle" className="fill-muted-foreground">
        ↑ number of cells
      </text>

      <text x="70" y="52" fontSize="10" textAnchor="middle" className="fill-muted-foreground">
        Normal
      </text>
      {smallCx.map((cx) => (
        <circle key={cx} cx={cx} cy={75} r="7" className="fill-chart-1 stroke-foreground" strokeWidth="1" />
      ))}

      <ArrowRight x1={112} x2={145} y={75} />

      <text x="225" y="52" fontSize="10" textAnchor="middle" className="fill-muted-foreground">
        Hyperplastic
      </text>
      {groupCx.map((cx) => (
        <circle key={`a-${cx}`} cx={cx} cy={66} r="7" className="fill-chart-1 stroke-foreground" strokeWidth="1" />
      ))}
      {groupCx.map((cx) => (
        <circle key={`b-${cx}`} cx={cx} cy={84} r="7" className="fill-chart-1 stroke-foreground" strokeWidth="1" />
      ))}

      <text x="150" y="112" fontSize="10" textAnchor="middle" className="fill-foreground">
        Same cell size — just more of them
      </text>
      <text x="150" y="132" fontSize="9.5" textAnchor="middle" className="fill-muted-foreground">
        e.g. drug-induced gingival enlargement:
      </text>
      <text x="150" y="146" fontSize="9.5" textAnchor="middle" className="fill-muted-foreground">
        fibroblasts proliferate, collagen ↑
      </text>
    </g>
  );
}

function HypertrophyPanel() {
  const smallCx = [46, 64, 82, 100];
  const bigCx = [178, 208, 238, 268];
  return (
    <g transform="translate(350,10)">
      <text x="150" y="14" fontSize="14" fontWeight="600" textAnchor="middle" className="fill-foreground">
        Hypertrophy
      </text>
      <text x="150" y="30" fontSize="10.5" textAnchor="middle" className="fill-muted-foreground">
        ↑ size of cells
      </text>

      <text x="70" y="52" fontSize="10" textAnchor="middle" className="fill-muted-foreground">
        Normal
      </text>
      {smallCx.map((cx) => (
        <circle key={cx} cx={cx} cy={75} r="7" className="fill-chart-2 stroke-foreground" strokeWidth="1" />
      ))}

      <ArrowRight x1={112} x2={145} y={75} />

      <text x="223" y="52" fontSize="10" textAnchor="middle" className="fill-muted-foreground">
        Hypertrophic
      </text>
      {bigCx.map((cx) => (
        <circle key={cx} cx={cx} cy={75} r="13" className="fill-chart-2 stroke-foreground" strokeWidth="1" />
      ))}

      <text x="150" y="112" fontSize="10" textAnchor="middle" className="fill-foreground">
        Same number, each cell bigger
      </text>
      <text x="150" y="132" fontSize="9.5" textAnchor="middle" className="fill-muted-foreground">
        e.g. cardiac muscle hypertrophy under
      </text>
      <text x="150" y="146" fontSize="9.5" textAnchor="middle" className="fill-muted-foreground">
        chronic pressure/volume overload
      </text>
    </g>
  );
}

export function HyperplasiaHypertrophyDiagram() {
  return (
    <svg
      viewBox="0 0 660 190"
      role="img"
      aria-label="Diagram contrasting hyperplasia, an increase in the number of cells at the same size each, with hypertrophy, the same number of cells each growing larger, illustrated with drug-induced gingival enlargement as a hyperplasia example and cardiac muscle under chronic overload as a hypertrophy example"
      className="mx-auto h-auto w-full max-w-xl text-foreground"
    >
      <title>Hyperplasia (more cells) vs. hypertrophy (bigger cells)</title>
      <defs>
        <marker id="hh-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="fill-foreground" />
        </marker>
      </defs>
      <HyperplasiaPanel />
      <HypertrophyPanel />
      <text x="330" y="175" fontSize="10.5" textAnchor="middle" className="fill-muted-foreground">
        Both are reversible adaptations to a sustained stimulus — neither is cancer.
      </text>
    </svg>
  );
}
