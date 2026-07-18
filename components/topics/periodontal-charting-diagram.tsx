// Original self-drawn schematic (7d-topic-notes-depth, batch 3) — two panels: (A) how to read a
// periodontal probe's millimeter markings against the gingival margin to get a probing-depth
// number, and (B) the six sites charted per tooth (facial: DB/B/MB, lingual: DL/L/ML). Not traced
// from any textbook figure or a real manufacturer's probe-marking pattern. Uses theme CSS vars via
// Tailwind fill/stroke utilities so it stays legible in light and dark mode.

function ProbeTick({ y, label, bold }: { y: number; label: string; bold?: boolean }) {
  return (
    <g>
      <line
        x1="0"
        y1={y}
        x2={bold ? 16 : 11}
        y2={y}
        className="stroke-foreground"
        strokeWidth={bold ? 2 : 1.25}
      />
      <text x={20} y={y + 4} fontSize="10.5" className="fill-foreground">
        {label}
      </text>
    </g>
  );
}

function ProbePanel() {
  return (
    <g transform="translate(20,10)">
      <text x="70" y="14" fontSize="14" fontWeight="600" textAnchor="middle" className="fill-foreground">
        Reading the probe
      </text>

      {/* tooth root, gingiva, and pocket lumen the probe sits in */}
      <rect x="60" y="60" width="34" height="230" className="fill-chart-4 stroke-foreground" fillOpacity={0.45} strokeWidth="1.5" />
      <path
        d="M60,80 L34,68 Q20,110 26,160 L48,290 L60,290 L60,110 Q50,92 60,80 Z"
        className="fill-destructive stroke-foreground"
        fillOpacity={0.55}
        strokeWidth="1.5"
      />

      {/* probe shaft, inserted to the base of the pocket */}
      <line x1="77" y1="30" x2="77" y2="245" className="stroke-muted-foreground" strokeWidth="6" strokeLinecap="round" />
      <g transform="translate(69,30)">
        <ProbeTick y={0} label="1" />
        <ProbeTick y={16} label="2" />
        <ProbeTick y={32} label="3" bold />
        <ProbeTick y={64} label="5" bold />
        <ProbeTick y={96} label="7" />
        <ProbeTick y={112} label="8" />
        <ProbeTick y={128} label="9" />
        <ProbeTick y={144} label="10" bold />
      </g>

      {/* gingival margin: the reference line a reading is taken against */}
      <line x1="15" y1="110" x2="180" y2="110" className="stroke-foreground" strokeWidth="1.5" strokeDasharray="5 3" />
      <text x="182" y="106" fontSize="11" className="fill-foreground">
        Gingival margin
      </text>
      <text x="182" y="120" fontSize="11" className="fill-foreground">
        PD read here = 5 mm
      </text>

      {/* short lines only — SVG text never wraps, so a long caption here would run into the
          neighboring panel's own caption instead of breaking cleanly. The last line's baseline
          also needs real clearance from the viewBox's bottom edge — an SVG root clips to its own
          box by default, and a baseline placed too close to that edge gets the whole line clipped
          away, not just its descenders. */}
      <text x="15" y="303" fontSize="10.5" className="fill-muted-foreground">
        Walk the probe along the
      </text>
      <text x="15" y="316" fontSize="10.5" className="fill-muted-foreground">
        pocket base; read the mark
      </text>
      <text x="15" y="329" fontSize="10.5" className="fill-muted-foreground">
        nearest the margin, rounded up.
      </text>
    </g>
  );
}

function ChartingSite({
  cx,
  cy,
  label,
  labelAbove,
}: {
  cx: number;
  cy: number;
  label: string;
  labelAbove: boolean;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="5" className="fill-primary stroke-foreground" strokeWidth="1" />
      <text
        x={cx}
        y={labelAbove ? cy - 11 : cy + 19}
        fontSize="11"
        textAnchor="middle"
        className="fill-foreground"
      >
        {label}
      </text>
    </g>
  );
}

function SixPointPanel() {
  return (
    <g transform="translate(360,10)">
      <text x="90" y="14" fontSize="14" fontWeight="600" textAnchor="middle" className="fill-foreground">
        Six sites per tooth
      </text>

      <ellipse cx="90" cy="150" rx="60" ry="95" className="fill-secondary stroke-foreground" strokeWidth="1.5" />
      {/* facial/lingual labels sit clear outside the ellipse so they never collide with the
          site-dot labels just inside its edge */}
      <text x="90" y="34" fontSize="10.5" textAnchor="middle" className="fill-muted-foreground">
        Facial
      </text>
      <text x="90" y="273" fontSize="10.5" textAnchor="middle" className="fill-muted-foreground">
        Lingual
      </text>

      <ChartingSite cx={42} cy={90} label="DB" labelAbove />
      <ChartingSite cx={90} cy={74} label="B" labelAbove />
      <ChartingSite cx={138} cy={90} label="MB" labelAbove />
      <ChartingSite cx={42} cy={210} label="DL" labelAbove={false} />
      <ChartingSite cx={90} cy={226} label="L" labelAbove={false} />
      <ChartingSite cx={138} cy={210} label="ML" labelAbove={false} />

      <text x="90" y="300" fontSize="10.5" textAnchor="middle" className="fill-muted-foreground">
        Distal (D) points toward the
      </text>
      <text x="90" y="313" fontSize="10.5" textAnchor="middle" className="fill-muted-foreground">
        back of the arch at both sites.
      </text>
    </g>
  );
}

export function PeriodontalChartingDiagram() {
  return (
    <svg
      viewBox="0 0 630 350"
      role="img"
      aria-label="Diagram showing how to read a periodontal probe's millimeter markings against the gingival margin, and the six sites charted per tooth: distofacial, facial, mesiofacial, distolingual, lingual, and mesiolingual"
      className="mx-auto h-auto w-full max-w-xl text-foreground"
    >
      <title>Reading a periodontal probe and the six-point charting sequence</title>
      <ProbePanel />
      <SixPointPanel />
    </svg>
  );
}
