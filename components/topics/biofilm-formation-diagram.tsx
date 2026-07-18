// Original self-drawn schematic (7d-topic-notes-depth, batch 4) — three panels showing dental
// plaque biofilm as a structured microbial succession rather than loose bacteria: (A) an acquired
// salivary pellicle forms on enamel and early colonizers (largely streptococci) attach directly to
// it, (B) bridging organisms (e.g., Fusobacterium nucleatum) coaggregate with the early colonizers
// and recruit later, more pathogenic species, and (C) a mature, layered biofilm develops an oxygen
// gradient — facultative species nearer the surface, strict anaerobes (the "red complex":
// P. gingivalis, T. forsythia, T. denticola) concentrated deep in the pocket against the tooth.
// Not traced from any textbook figure. Uses theme CSS vars via Tailwind fill/stroke utilities so
// it stays legible in light and dark mode.

function ToothBase({ label }: { label: string }) {
  return (
    <>
      <rect x="10" y="150" width="160" height="30" className="fill-secondary stroke-foreground" strokeWidth="1.5" />
      <text x="90" y="169" fontSize="10.5" textAnchor="middle" className="fill-foreground">
        {label}
      </text>
    </>
  );
}

function EarlyColonizerPanel() {
  return (
    <g transform="translate(10,10)">
      <text x="90" y="14" fontSize="13" fontWeight="600" textAnchor="middle" className="fill-foreground">
        Pellicle + early colonizers
      </text>
      <ToothBase label="Enamel" />
      <rect x="10" y="138" width="160" height="12" rx="2" className="fill-chart-5 stroke-foreground" fillOpacity={0.35} strokeWidth="1" />
      <text x="90" y="147" fontSize="9" textAnchor="middle" className="fill-foreground">
        Acquired pellicle
      </text>
      {[28, 58, 90, 122, 152].map((cx) => (
        <circle key={cx} cx={cx} cy={132} r="6" className="fill-chart-1 stroke-foreground" strokeWidth="1" />
      ))}
      <text x="90" y="105" fontSize="9.5" textAnchor="middle" className="fill-foreground">
        Streptococcus spp.
      </text>
      <text x="90" y="118" fontSize="9.5" textAnchor="middle" className="fill-foreground">
        attach directly to pellicle
      </text>
    </g>
  );
}

function CoaggregationPanel() {
  return (
    <g transform="translate(220,10)">
      <text x="90" y="14" fontSize="13" fontWeight="600" textAnchor="middle" className="fill-foreground">
        Coaggregation
      </text>
      <ToothBase label="Enamel" />
      <rect x="10" y="138" width="160" height="12" rx="2" className="fill-chart-5 stroke-foreground" fillOpacity={0.35} strokeWidth="1" />
      {[28, 90, 152].map((cx) => (
        <circle key={cx} cx={cx} cy={132} r="6" className="fill-chart-1 stroke-foreground" strokeWidth="1" />
      ))}
      {/* bridging organism, drawn as an elongated rod linking an early colonizer to a later one */}
      <line x1="28" y1="126" x2="55" y2="90" className="stroke-chart-2" strokeWidth="2.5" />
      <line x1="90" y1="126" x2="90" y2="90" className="stroke-chart-2" strokeWidth="2.5" />
      <line x1="152" y1="126" x2="125" y2="90" className="stroke-chart-2" strokeWidth="2.5" />
      <ellipse cx="90" cy="80" rx="12" ry="5" className="fill-chart-2 stroke-foreground" strokeWidth="1" />
      <circle cx="55" cy="80" r="5.5" className="fill-chart-4 stroke-foreground" strokeWidth="1" />
      <circle cx="125" cy="80" r="5.5" className="fill-chart-4 stroke-foreground" strokeWidth="1" />
      <text x="90" y="55" fontSize="9.5" textAnchor="middle" className="fill-foreground">
        Fusobacterium bridges early
      </text>
      <text x="90" y="67" fontSize="9.5" textAnchor="middle" className="fill-foreground">
        colonizers to later species
      </text>
    </g>
  );
}

function MatureBiofilmPanel() {
  return (
    <g transform="translate(430,10)">
      <text x="90" y="14" fontSize="13" fontWeight="600" textAnchor="middle" className="fill-foreground">
        Mature biofilm
      </text>
      <ToothBase label="Enamel / root surface" />
      {/* layered extracellular-matrix community, denser and more anaerobic toward the tooth */}
      <rect x="10" y="105" width="160" height="45" className="fill-chart-5 stroke-foreground" fillOpacity={0.3} strokeWidth="1" />
      <rect x="10" y="80" width="160" height="25" className="fill-chart-2 stroke-foreground" fillOpacity={0.35} strokeWidth="1" />
      <text x="90" y="97" fontSize="9" textAnchor="middle" className="fill-foreground">
        Red complex (anaerobic)
      </text>
      <text x="90" y="65" fontSize="9" textAnchor="middle" className="fill-muted-foreground">
        Facultative species
      </text>

      <line x1="185" y1="80" x2="185" y2="148" className="stroke-muted-foreground" strokeWidth="1.5" markerEnd="url(#o2-arrow)" />
      <text x="196" y="86" fontSize="9" className="fill-muted-foreground">
        O₂
      </text>
      <text x="196" y="150" fontSize="9" className="fill-muted-foreground">
        anaerobic
      </text>

      <text x="90" y="42" fontSize="9.5" textAnchor="middle" className="fill-foreground">
        P. gingivalis, T. forsythia,
      </text>
      <text x="90" y="54" fontSize="9.5" textAnchor="middle" className="fill-foreground">
        T. denticola concentrate deepest
      </text>
    </g>
  );
}

export function BiofilmFormationDiagram() {
  return (
    <svg
      viewBox="0 0 660 215"
      role="img"
      aria-label="Diagram of dental plaque biofilm formation: an acquired pellicle with early streptococcal colonizers, coaggregation where Fusobacterium bridges early and later species, and a mature layered biofilm with an oxygen gradient concentrating the anaerobic red complex deepest against the tooth"
      className="mx-auto h-auto w-full max-w-xl text-foreground"
    >
      <title>Dental plaque biofilm: from pellicle to mature, layered community</title>
      <defs>
        <marker id="o2-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="fill-muted-foreground" />
        </marker>
      </defs>
      <EarlyColonizerPanel />
      <CoaggregationPanel />
      <MatureBiofilmPanel />
      <text x="330" y="206" fontSize="10.5" textAnchor="middle" className="fill-muted-foreground">
        A structured succession, not a random bacterial pile-up — order determines what grows where.
      </text>
    </svg>
  );
}
