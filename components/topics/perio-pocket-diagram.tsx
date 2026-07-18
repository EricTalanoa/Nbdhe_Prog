// Original self-drawn schematic (7d-topic-notes-depth) — two simplified periodontium
// cross-sections (healthy sulcus vs. periodontal pocket) contrasting probing depth (PD, measured
// from the gingival margin) with clinical attachment level (CAL, measured from the fixed CEJ).
// Not traced from any textbook figure. Uses theme CSS vars via Tailwind fill/stroke utilities so
// it stays legible in light and dark mode.

function ArrowMarker() {
  return (
    <marker id="perio-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" className="fill-foreground" />
    </marker>
  );
}

function Panel({
  x,
  title,
  boneY,
  boneHeight,
  marginY,
  attachY,
  cejLineEnd,
  cejLabelX,
  calX,
  pdLabelY,
  calLabelY,
  pdLabel,
  calLabel,
  gingivaPath,
}: {
  x: number;
  title: string;
  boneY: number;
  boneHeight: number;
  marginY: number;
  attachY: number;
  cejLineEnd: number;
  cejLabelX: number;
  calX: number;
  pdLabelY: number;
  calLabelY: number;
  pdLabel: string;
  calLabel: string;
  gingivaPath: string;
}) {
  return (
    <g transform={`translate(${x},10)`}>
      <text x="55" y="16" fontSize="15" fontWeight="600" className="fill-foreground">
        {title}
      </text>

      {/* alveolar bone */}
      <rect x="40" y={boneY} width="160" height={boneHeight} className="fill-accent stroke-foreground" strokeWidth="1" />
      {/* crown (enamel) */}
      <rect x="100" y="35" width="40" height="50" className="fill-secondary stroke-foreground" strokeWidth="1.5" />
      {/* root (cementum) */}
      <rect x="100" y="85" width="40" height="270" className="fill-chart-4 stroke-foreground" fillOpacity={0.45} strokeWidth="1.5" />

      {/* gingiva, with the sulcus/pocket lumen as the gap between margin and attachment */}
      <path d={gingivaPath} className="fill-destructive stroke-foreground" fillOpacity={0.55} strokeWidth="1.5" />

      {/* CEJ (fixed reference) */}
      <line x1="90" y1="85" x2={cejLineEnd} y2="85" className="stroke-muted-foreground" strokeWidth="1" strokeDasharray="4 3" />
      <text x={cejLabelX} y="89" fontSize="12" className="fill-foreground">
        CEJ
      </text>

      {/* margin / attachment / bone-crest reference ticks */}
      <line x1="60" y1={marginY} x2="150" y2={marginY} className="stroke-muted-foreground" strokeWidth="0.75" strokeDasharray="2 2" />
      <line x1="60" y1={attachY} x2="150" y2={attachY} className="stroke-muted-foreground" strokeWidth="0.75" strokeDasharray="2 2" />
      <line x1="40" y1={boneY} x2="150" y2={boneY} className="stroke-muted-foreground" strokeWidth="0.75" strokeDasharray="2 2" />

      {/* PD: margin -> attachment */}
      <line
        x1="160"
        y1={marginY}
        x2="160"
        y2={attachY}
        className="stroke-foreground"
        strokeWidth="1.5"
        markerStart="url(#perio-arrow)"
        markerEnd="url(#perio-arrow)"
      />
      <text x="166" y={pdLabelY} fontSize="11" className="fill-foreground">
        {pdLabel}
      </text>

      {/* CAL: CEJ -> attachment (fixed reference) */}
      <line
        x1={calX}
        y1="85"
        x2={calX}
        y2={attachY}
        className="stroke-foreground"
        strokeWidth="1.5"
        markerStart="url(#perio-arrow)"
        markerEnd="url(#perio-arrow)"
      />
      <text x="166" y={calLabelY} fontSize="11" className="fill-foreground">
        {calLabel}
      </text>
    </g>
  );
}

export function PerioPocketDiagram() {
  return (
    <svg
      viewBox="0 0 640 400"
      role="img"
      aria-label="Diagram comparing a healthy gingival sulcus to a periodontal pocket, showing probing depth measured from the gingival margin versus clinical attachment level measured from the fixed cementoenamel junction"
      className="mx-auto h-auto w-full max-w-xl text-foreground"
    >
      <title>Healthy sulcus vs. periodontal pocket — PD vs. CAL</title>
      <defs>
        <ArrowMarker />
      </defs>

      <Panel
        x={20}
        title="Healthy sulcus"
        boneY={108}
        boneHeight={247}
        marginY={70}
        attachY={95}
        cejLineEnd={215}
        cejLabelX={219}
        calX={205}
        pdLabelY={72}
        calLabelY={112}
        pdLabel="PD 2mm"
        calLabel="CAL ~0mm"
        gingivaPath="M100,70 L70,58 Q52,80 58,120 L85,355 L100,355 L100,95 Q90,80 100,70 Z"
      />
      <Panel
        x={340}
        title="Periodontal pocket"
        boneY={245}
        boneHeight={110}
        marginY={80}
        attachY={230}
        cejLineEnd={235}
        cejLabelX={239}
        calX={205}
        pdLabelY={140}
        calLabelY={185}
        pdLabel="PD 7mm"
        calLabel="CAL 6.5mm"
        gingivaPath="M100,80 L70,68 Q52,150 58,240 L85,355 L100,355 L100,230 Q90,150 100,80 Z"
      />

      <text x="320" y="385" fontSize="11" className="fill-muted-foreground" textAnchor="middle">
        Margin→JE = PD (probing depth). Fixed CEJ→JE = CAL — reliable even when recession or swelling skews PD.
      </text>
    </svg>
  );
}
