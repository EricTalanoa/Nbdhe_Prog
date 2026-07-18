// Original self-drawn schematic (7d-topic-notes-depth, batch 2) — two simplified periapical
// panels contrasting a normal anatomic landmark (the mental foramen, which can mimic disease)
// against a true periapical lesion, and the features that tell them apart. Not traced from any
// textbook figure. Uses theme CSS vars via Tailwind fill/stroke utilities so it stays legible in
// light and dark mode.

function Root({ x, apexY }: { x: number; apexY: number }) {
  return (
    <path
      d={`M${x - 22},40 L${x + 22},40 L${x + 14},${apexY - 10} Q${x},${apexY + 8} ${x - 14},${apexY - 10} Z`}
      className="fill-chart-4 stroke-foreground"
      fillOpacity={0.45}
      strokeWidth="1.5"
    />
  );
}

function Crown({ x }: { x: number }) {
  return (
    <rect
      x={x - 26}
      y="8"
      width="52"
      height="34"
      rx="6"
      className="fill-secondary stroke-foreground"
      strokeWidth="1.5"
    />
  );
}

export function RadiographicLandmarksDiagram() {
  return (
    <svg
      viewBox="0 0 640 285"
      role="img"
      aria-label="Diagram comparing the mental foramen, a normal anatomic radiolucency with a corticated border and continuity with the mandibular canal, against a periapical lesion, a pathologic radiolucency with a diffuse border and a widened periodontal ligament space"
      className="mx-auto h-auto w-full max-w-xl text-foreground"
    >
      <title>Normal landmark vs. periapical lesion on a periapical radiograph</title>

      {/* Panel A: mental foramen */}
      <g transform="translate(10,10)">
        <Crown x={145} />
        <Root x={145} apexY={150} />
        <line x1="0" y1="165" x2="290" y2="165" className="stroke-muted-foreground" strokeWidth="1" />
        <text x="0" y="180" fontSize="10" className="fill-muted-foreground">
          alveolar crest / basal bone
        </text>

        {/* mandibular canal, continuous with the foramen */}
        <path
          d="M0,205 Q150,190 290,210"
          className="stroke-chart-5"
          strokeWidth="14"
          strokeOpacity={0.3}
          fill="none"
        />

        {/* the foramen itself: round, corticated (ring), sits near the apex but distinct from it */}
        <circle cx="150" cy="150" r="20" className="fill-chart-5 stroke-foreground" fillOpacity={0.35} strokeWidth="2" />
        <circle cx="150" cy="150" r="20" className="fill-none stroke-background" strokeWidth="3" strokeOpacity={0.9} />
        <circle cx="150" cy="150" r="21.5" className="fill-none stroke-foreground" strokeWidth="1" strokeOpacity={0.8} />

        <g fontSize="11" className="fill-foreground">
          <line x1="172" y1="150" x2="188" y2="122" className="stroke-muted-foreground" strokeWidth="1" />
          <text x="190" y="120">
            Corticated rim
          </text>
          <line x1="150" y1="205" x2="185" y2="232" className="stroke-muted-foreground" strokeWidth="1" />
          <text x="150" y="234">
            Follows the canal
          </text>
          <text x="40" y="252" className="fill-muted-foreground">
            PDL space: normal width
          </text>
        </g>

        {/* painted last so it sits on top of the crown/root shapes beneath it */}
        <text x="145" y="14" fontSize="14" fontWeight="600" textAnchor="middle" className="fill-foreground">
          Mental foramen (normal)
        </text>
      </g>

      {/* Panel B: periapical lesion */}
      <g transform="translate(340,10)">
        <Crown x={145} />
        <Root x={145} apexY={150} />
        <line x1="0" y1="200" x2="290" y2="200" className="stroke-muted-foreground" strokeWidth="1" />
        <text x="0" y="215" fontSize="10" className="fill-muted-foreground">
          alveolar crest / basal bone
        </text>

        {/* widened PDL space at the apex, leading into a diffuse radiolucency */}
        <path
          d="M137,120 Q125,150 132,168"
          className="stroke-destructive"
          strokeWidth="4"
          fill="none"
          strokeOpacity={0.85}
        />
        <path
          d="M155,120 Q168,150 160,168"
          className="stroke-destructive"
          strokeWidth="4"
          fill="none"
          strokeOpacity={0.85}
        />

        {/* the lesion: irregular, no cortical rim, soft/diffuse edge */}
        <circle cx="146" cy="182" r="26" className="fill-destructive stroke-none" fillOpacity={0.4} />
        <circle cx="146" cy="182" r="18" className="fill-destructive stroke-none" fillOpacity={0.35} />

        <g fontSize="11" className="fill-foreground">
          <line x1="172" y1="182" x2="188" y2="154" className="stroke-muted-foreground" strokeWidth="1" />
          <text x="190" y="152">
            Diffuse border
          </text>
          <line x1="146" y1="140" x2="188" y2="120" className="stroke-muted-foreground" strokeWidth="1" />
          <text x="190" y="118">
            Widened PDL space
          </text>
          <text x="30" y="252" className="fill-muted-foreground">
            Non-vital tooth; not tied to a canal
          </text>
        </g>

        {/* painted last so it sits on top of the crown/root shapes beneath it */}
        <text x="145" y="14" fontSize="14" fontWeight="600" textAnchor="middle" className="fill-foreground">
          Periapical lesion (pathologic)
        </text>
      </g>

      <text x="320" y="278" fontSize="11" className="fill-muted-foreground" textAnchor="middle">
        Same radiolucent look — the border, position, and PDL space are what separate anatomy from disease.
      </text>
    </svg>
  );
}
