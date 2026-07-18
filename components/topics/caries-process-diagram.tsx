// Original self-drawn schematic (7d-topic-notes-depth, batch 2) — two panels contrasting
// demineralization (plaque acid dropping pH below the ~5.5 critical pH for enamel, pulling
// calcium/phosphate out of the crystal lattice) with remineralization (saliva + fluoride
// redepositing calcium/phosphate, with fluoride forming acid-resistant fluorapatite). Not traced
// from any textbook figure. Uses theme CSS vars via Tailwind fill/stroke utilities so it stays
// legible in light and dark mode.

function IonArrow({
  x1,
  y1,
  x2,
  y2,
  label,
  labelX,
  labelY,
  outward,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  labelX: number;
  labelY: number;
  outward: boolean;
}) {
  return (
    <>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        className={outward ? "stroke-destructive" : "stroke-chart-3"}
        strokeWidth="2"
        markerEnd={outward ? "url(#ion-arrow-out)" : "url(#ion-arrow-in)"}
      />
      <text x={labelX} y={labelY} fontSize="10.5" className="fill-foreground">
        {label}
      </text>
    </>
  );
}

export function CariesProcessDiagram() {
  return (
    <svg
      viewBox="0 0 640 300"
      role="img"
      aria-label="Diagram of demineralization, where plaque acid below the critical pH pulls calcium and phosphate out of enamel, versus remineralization, where saliva and fluoride redeposit those minerals and fluoride forms acid-resistant fluorapatite"
      className="mx-auto h-auto w-full max-w-xl text-foreground"
    >
      <title>Demineralization vs. remineralization</title>
      <defs>
        <marker id="ion-arrow-out" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="fill-destructive" />
        </marker>
        <marker id="ion-arrow-in" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="fill-chart-3" />
        </marker>
      </defs>

      {/* Panel A: demineralization */}
      <g transform="translate(10,10)">
        <text x="145" y="14" fontSize="14" fontWeight="600" textAnchor="middle" className="fill-foreground">
          Demineralization
        </text>
        <text x="145" y="32" fontSize="11" textAnchor="middle" className="fill-muted-foreground">
          plaque acid, pH below ~5.5
        </text>

        {/* plaque layer */}
        <rect x="40" y="55" width="210" height="26" rx="4" className="fill-chart-5 stroke-foreground" fillOpacity={0.3} strokeWidth="1" />
        <text x="145" y="72" fontSize="11" textAnchor="middle" className="fill-foreground">
          Biofilm: sugars → acid (H+)
        </text>

        {/* enamel surface */}
        <rect x="40" y="90" width="210" height="70" className="fill-secondary stroke-foreground" strokeWidth="1.5" />
        <text x="145" y="130" fontSize="12" textAnchor="middle" className="fill-foreground">
          Enamel (hydroxyapatite)
        </text>

        <IonArrow x1={90} y1={95} x2={78} y2={70} label="Ca²⁺" labelX={50} labelY={46} outward />
        <IonArrow x1={145} y1={95} x2={145} y2={68} label="PO₄³⁻" labelX={130} labelY={46} outward />
        <IonArrow x1={200} y1={95} x2={212} y2={70} label="OH⁻" labelX={214} labelY={46} outward />

        <text x="145" y="180" fontSize="10.5" textAnchor="middle" className="fill-muted-foreground">
          Crystal dissolves; net mineral loss if this repeats faster than repair.
        </text>
      </g>

      {/* Panel B: remineralization */}
      <g transform="translate(340,10)">
        <text x="145" y="14" fontSize="14" fontWeight="600" textAnchor="middle" className="fill-foreground">
          Remineralization
        </text>
        <text x="145" y="32" fontSize="11" textAnchor="middle" className="fill-muted-foreground">
          saliva buffering + fluoride
        </text>

        <rect x="40" y="55" width="210" height="26" rx="4" className="fill-chart-1 stroke-foreground" fillOpacity={0.3} strokeWidth="1" />
        <text x="145" y="72" fontSize="11" textAnchor="middle" className="fill-foreground">
          Saliva: buffers acid, supplies ions
        </text>

        <rect x="40" y="90" width="210" height="70" className="fill-secondary stroke-foreground" strokeWidth="1.5" />
        <text x="145" y="122" fontSize="12" textAnchor="middle" className="fill-foreground">
          Enamel
        </text>
        <text x="145" y="140" fontSize="11" textAnchor="middle" className="fill-chart-3">
          + fluorapatite (acid-resistant)
        </text>

        <IonArrow x1={78} y1={70} x2={90} y2={95} label="Ca²⁺" labelX={50} labelY={46} outward={false} />
        <IonArrow x1={145} y1={68} x2={145} y2={95} label="PO₄³⁻" labelX={130} labelY={46} outward={false} />
        <IonArrow x1={212} y1={70} x2={200} y2={95} label="F⁻" labelX={214} labelY={46} outward={false} />

        <text x="145" y="180" fontSize="10.5" textAnchor="middle" className="fill-muted-foreground">
          Fluoride swaps in for hydroxyl, forming fluorapatite: less soluble at low pH.
        </text>
      </g>

      <text x="320" y="215" fontSize="11" className="fill-muted-foreground" textAnchor="middle">
        Caries is this cycle tipped toward demineralization over time — not a one-way event.
      </text>
    </svg>
  );
}
