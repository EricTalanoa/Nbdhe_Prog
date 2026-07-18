// Original self-drawn schematic (7d-topic-notes-depth) — three side-by-side cross-sections
// (healthy sulcus / gingivitis / periodontitis) contrasting probing depth (PD, gingival margin to
// pocket base) against clinical attachment loss (CAL, the *fixed* CEJ to pocket base) — the exact
// distinction q-perio-0020 tests. Simple line-art, not a traced textbook figure.

const CEJ_Y = 110;
const CROWN_TOP_Y = 20;
const BOTTOM_Y = 300;

type Panel = {
  title: string;
  marginY: number;
  baseY: number;
  boneY: number;
  note: string;
};

const PANELS: Panel[] = [
  {
    title: "Healthy",
    marginY: 95,
    baseY: 114,
    boneY: 124,
    note: "PD shallow, CAL ~0",
  },
  {
    title: "Gingivitis",
    marginY: 76,
    baseY: 120,
    boneY: 124,
    note: "PD deep (swelling), CAL ~0",
  },
  {
    title: "Periodontitis",
    marginY: 132,
    baseY: 210,
    boneY: 220,
    note: "PD deep AND CAL deep",
  },
];

const PANEL_WIDTH = 180;

function Bracket({
  x,
  yTop,
  yBottom,
  label,
  side,
}: {
  x: number;
  yTop: number;
  yBottom: number;
  label: string;
  side: "left" | "right";
}) {
  const tick = side === "right" ? 6 : -6;
  const textX = side === "right" ? x + 10 : x - 10;
  return (
    <g stroke="currentColor" strokeWidth={1.25}>
      <line x1={x} y1={yTop} x2={x} y2={yBottom} />
      <line x1={x} y1={yTop} x2={x + tick} y2={yTop} />
      <line x1={x} y1={yBottom} x2={x + tick} y2={yBottom} />
      <text
        x={textX}
        y={(yTop + yBottom) / 2}
        dy={3}
        textAnchor={side === "right" ? "start" : "end"}
        fill="currentColor"
        stroke="none"
        className="text-[10px] font-semibold"
      >
        {label}
      </text>
    </g>
  );
}

function ToothPanel({ panel, index }: { panel: Panel; index: number }) {
  const ox = index * PANEL_WIDTH;
  return (
    <g transform={`translate(${ox},0)`}>
      {/* Alveolar bone (present from boneY down, resorbed above it) */}
      <rect x={40} y={panel.boneY} width={16} height={BOTTOM_Y - panel.boneY} fill="#c7d4cf" stroke="currentColor" strokeOpacity={0.3} />
      <rect x={84} y={panel.boneY} width={16} height={BOTTOM_Y - panel.boneY} fill="#c7d4cf" stroke="currentColor" strokeOpacity={0.3} />

      {/* Tooth: crown (enamel) above CEJ, root (cementum) below */}
      <rect x={58} y={CROWN_TOP_Y} width={24} height={CEJ_Y - CROWN_TOP_Y} fill="#eee7d8" stroke="currentColor" strokeOpacity={0.4} />
      <rect x={58} y={CEJ_Y} width={24} height={BOTTOM_Y - CEJ_Y} fill="#c9b48f" stroke="currentColor" strokeOpacity={0.4} />

      {/* CEJ tick (fixed reference point, same in every panel) */}
      <line x1={50} y1={CEJ_Y} x2={90} y2={CEJ_Y} stroke="currentColor" strokeWidth={1.25} strokeDasharray="3 2" opacity={0.8} />
      <text x={95} y={CEJ_Y} dy={3} fill="currentColor" className="text-[10px] font-semibold">
        CEJ
      </text>

      {/* Gum tissue, from the (variable) gingival margin down to the bone */}
      <path
        d={`M46,${panel.marginY} C46,${panel.marginY - 6} 58,${panel.marginY - 10} 70,${panel.marginY - 10} C82,${panel.marginY - 10} 94,${panel.marginY - 6} 94,${panel.marginY} L94,${panel.boneY + 6} C94,${panel.boneY + 14} 82,${panel.boneY + 18} 70,${panel.boneY + 18} C58,${panel.boneY + 18} 46,${panel.boneY + 14} 46,${panel.boneY + 6} Z`}
        fill="#e0879a"
        opacity={0.5}
        stroke="currentColor"
        strokeOpacity={0.3}
      />

      {/* Pocket base (junctional epithelium attachment) marker */}
      <line x1={58} y1={panel.baseY} x2={82} y2={panel.baseY} stroke="currentColor" strokeWidth={1.5} opacity={0.85} />

      {/* PD: margin -> base (right side) */}
      <Bracket x={112} yTop={panel.marginY} yBottom={panel.baseY} label="PD" side="right" />
      {/* CAL: CEJ (fixed) -> base (left side) */}
      <Bracket x={36} yTop={CEJ_Y} yBottom={panel.baseY} label="CAL" side="left" />

      <text x={70} y={325} textAnchor="middle" fill="currentColor" className="text-[12px] font-semibold">
        {panel.title}
      </text>
      <text x={70} y={340} textAnchor="middle" fill="currentColor" opacity={0.7} className="text-[9px]">
        {panel.note}
      </text>
    </g>
  );
}

export function PerioPocketDiagram() {
  return (
    <figure className="mt-4 rounded-lg border bg-card p-4">
      <svg
        viewBox={`0 0 ${PANEL_WIDTH * 3} 350`}
        className="mx-auto h-auto w-full max-w-lg text-foreground"
        role="img"
        aria-label="Three cross-sections comparing a healthy sulcus, gingivitis, and periodontitis, contrasting probing depth against clinical attachment loss measured from the fixed cementoenamel junction"
      >
        {PANELS.map((panel, i) => (
          <ToothPanel key={panel.title} panel={panel} index={i} />
        ))}
      </svg>
      <figcaption className="mt-2 text-center text-xs text-muted-foreground">
        Probing depth (PD) is measured from the gingival margin, which moves with swelling or
        recession. Clinical attachment loss (CAL) is measured from the fixed CEJ — that&apos;s why
        gingivitis can show a deep PD with no real attachment loss, while periodontitis shows both.
      </figcaption>
    </figure>
  );
}
