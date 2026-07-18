// Original self-drawn schematic (7d-topic-notes-depth, batch 3) — a simplified lateral view of
// the ramus for the inferior alveolar nerve block (IANB): the coronoid notch and occlusal plane
// used to gauge injection height, the pterygomandibular triangle (soft-tissue entry point), and
// the lingula/mandibular foramen (bony target), with the needle trajectory drawn in. Landmark
// positions are illustrative, not anatomically precise measurements, and are not traced from any
// textbook figure. Uses theme CSS vars via Tailwind fill/stroke utilities so it stays legible in
// light and dark mode.

function ArrowMarker() {
  return (
    <marker id="nerve-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" className="fill-foreground" />
    </marker>
  );
}

export function NerveBlockLandmarksDiagram() {
  return (
    <svg
      viewBox="0 0 640 340"
      role="img"
      aria-label="Diagram of the mandibular ramus for the inferior alveolar nerve block, showing the coronoid notch and occlusal plane used to gauge injection height, the pterygomandibular triangle entry point, the lingula and mandibular foramen target, and the needle trajectory between them"
      className="mx-auto h-auto w-full max-w-xl text-foreground"
    >
      <title>Inferior alveolar nerve block — key landmarks</title>
      <defs>
        <ArrowMarker />
      </defs>

      {/* ramus body, simplified as a rounded quadrilateral */}
      <path
        d="M120,40 Q95,55 90,110 Q86,180 110,260 Q140,300 230,300 L230,60 Q190,35 120,40 Z"
        className="fill-accent stroke-foreground"
        strokeWidth="1.5"
      />

      {/* coronoid notch: a point marker on the anterior-border concavity already drawn into the
          ramus outline above, palpated to set injection height — not a second overlapping curve.
          The leader line routes to just below the label block (not through it) so it never
          crosses the text it's pointing from. */}
      <circle cx="93" cy="95" r="4" className="fill-background stroke-foreground" strokeWidth="1.5" />
      <line x1="89" y1="92" x2="45" y2="44" className="stroke-muted-foreground" strokeWidth="1" />
      <text x="10" y="14" fontSize="12" className="fill-foreground">
        Coronoid notch
      </text>
      <text x="10" y="27" fontSize="10.5" className="fill-muted-foreground">
        (greatest concavity —
      </text>
      <text x="10" y="39" fontSize="10.5" className="fill-muted-foreground">
        sets injection height)
      </text>

      {/* occlusal plane, roughly level with the notch */}
      <line x1="0" y1="150" x2="400" y2="150" className="stroke-foreground" strokeWidth="1" strokeDasharray="6 4" />
      <text x="405" y="146" fontSize="11" className="fill-foreground">
        Occlusal plane
      </text>
      <text x="405" y="160" fontSize="10.5" className="fill-muted-foreground">
        (barrel held parallel to it)
      </text>

      {/* lingula / mandibular foramen: the bony target, 6–10mm above the occlusal plane */}
      <circle cx="185" cy="135" r="9" className="fill-chart-5 stroke-foreground" fillOpacity={0.5} strokeWidth="2" />
      <line x1="192" y1="128" x2="260" y2="90" className="stroke-muted-foreground" strokeWidth="1" />
      <text x="264" y="86" fontSize="12" className="fill-foreground">
        Lingula / mandibular
      </text>
      <text x="264" y="100" fontSize="12" className="fill-foreground">
        foramen (target)
      </text>
      <text x="264" y="114" fontSize="10.5" className="fill-muted-foreground">
        ~6–10mm above occlusal plane
      </text>

      {/* needle trajectory: from the contralateral premolar area (outside the mouth) to the
          target. The entry marker sits directly on this line, at the point it crosses the
          pterygomandibular triangle — not a disconnected second landmark. */}
      <line
        x1="420"
        y1="220"
        x2="194"
        y2="138"
        className="stroke-foreground"
        strokeWidth="1.75"
        markerEnd="url(#nerve-arrow)"
      />
      <circle cx="262" cy="163" r="6" className="fill-secondary stroke-foreground" strokeWidth="1.5" />
      <line x1="262" y1="169" x2="280" y2="205" className="stroke-muted-foreground" strokeWidth="1" />
      <text x="284" y="212" fontSize="12" className="fill-foreground">
        Entry: pterygomandibular
      </text>
      <text x="284" y="226" fontSize="12" className="fill-foreground">
        triangle, through the mucosa
      </text>

      <text x="380" y="252" fontSize="11" className="fill-foreground">
        Barrel over contralateral
      </text>
      <text x="380" y="265" fontSize="11" className="fill-foreground">
        premolars; ~20–25mm to bone
      </text>

      <text x="320" y="325" fontSize="11" className="fill-muted-foreground" textAnchor="middle">
        Missing the target high or shallow is the usual cause of an incomplete block.
      </text>
    </svg>
  );
}
