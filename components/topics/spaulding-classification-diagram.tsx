// Original self-drawn schematic (7d-topic-notes-depth, batch 6) — the Spaulding classification
// used to decide how an instrument or item must be processed between patients, based on what
// tissue it contacts: critical items penetrate soft tissue/bone or contact the bloodstream and
// must be sterilized; semicritical items touch mucous membranes or non-intact skin and need at
// least high-level disinfection; noncritical items touch only intact skin and need low- or
// intermediate-level disinfection. Not traced from any textbook figure. Uses theme CSS vars via
// Tailwind fill/stroke utilities so it stays legible in light and dark mode.
//
// Contact/example lines are kept short and pre-split by hand — SVG text never wraps, so a long
// line here would bleed into a neighboring tier instead of breaking cleanly (a bug caught and
// fixed in an earlier draft of this diagram).

function Tier({
  x,
  fillClass,
  title,
  contactLines,
  example,
  processing,
}: {
  x: number;
  fillClass: string;
  title: string;
  contactLines: [string, string];
  example: string;
  processing: string;
}) {
  return (
    <g transform={`translate(${x},0)`}>
      <rect
        x="0"
        y="0"
        width="190"
        height="86"
        rx="10"
        className={`${fillClass} stroke-foreground`}
        fillOpacity={0.55}
        strokeWidth="1.5"
      />
      <text x="95" y="20" fontSize="13.5" fontWeight="600" textAnchor="middle" className="fill-foreground">
        {title}
      </text>
      <text x="95" y="38" fontSize="10" textAnchor="middle" className="fill-foreground">
        {contactLines[0]}
      </text>
      <text x="95" y="52" fontSize="10" textAnchor="middle" className="fill-foreground">
        {contactLines[1]}
      </text>
      <text x="95" y="70" fontSize="9.5" textAnchor="middle" className="fill-muted-foreground">
        {example}
      </text>

      <line x1="95" y1="86" x2="95" y2="114" className="stroke-foreground" strokeWidth="1.5" markerEnd="url(#sp-arrow)" />
      <text x="95" y="132" fontSize="11" fontWeight="600" textAnchor="middle" className="fill-foreground">
        {processing}
      </text>
    </g>
  );
}

export function SpauldingClassificationDiagram() {
  return (
    <svg
      viewBox="0 0 660 155"
      role="img"
      aria-label="Diagram of the Spaulding classification: critical items that penetrate soft tissue, bone, or the bloodstream require sterilization; semicritical items that touch mucous membranes or non-intact skin require at least high-level disinfection; noncritical items that touch only intact skin require low- or intermediate-level disinfection"
      className="mx-auto h-auto w-full max-w-xl text-foreground"
    >
      <title>Spaulding classification: instrument risk tier decides the required processing level</title>
      <defs>
        <marker id="sp-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="fill-foreground" />
        </marker>
      </defs>
      <Tier
        x={10}
        fillClass="fill-destructive"
        title="Critical"
        contactLines={["Penetrates soft tissue,", "bone, or bloodstream"]}
        example="e.g. scalers, surgical instruments"
        processing="Sterilize"
      />
      <Tier
        x={235}
        fillClass="fill-chart-4"
        title="Semicritical"
        contactLines={["Touches mucous", "membranes/non-intact skin"]}
        example="e.g. mirrors, impression trays"
        processing="High-level disinfect"
      />
      <Tier
        x={460}
        fillClass="fill-chart-3"
        title="Noncritical"
        contactLines={["Touches only", "intact skin"]}
        example="e.g. BP cuff, pulse oximeter"
        processing="Low/intermediate disinfect"
      />
    </svg>
  );
}
