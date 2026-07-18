// Original self-drawn schematic (7d-topic-notes-depth) — a simplified longitudinal cross-section
// of a single-rooted tooth, not traced from any textbook figure. Uses theme CSS vars via Tailwind
// fill/stroke utilities so it stays legible in light and dark mode.

export function ToothAnatomyDiagram() {
  return (
    <svg
      viewBox="0 0 420 360"
      role="img"
      aria-label="Cross-section of a tooth showing enamel, dentin, pulp, cementum, the cementoenamel junction, and the apical foramen"
      className="mx-auto h-auto w-full max-w-sm text-foreground"
    >
      <title>Tooth cross-section</title>

      {/* root: cementum (outer) / dentin (inner) */}
      <path
        d="M168,150 L252,150 L233,290 Q210,318 187,290 Z"
        className="fill-chart-4 stroke-foreground"
        fillOpacity={0.45}
        strokeWidth="1.5"
      />
      <path
        d="M174,156 L246,156 L228,285 Q210,308 192,285 Z"
        className="fill-chart-4 stroke-foreground"
        fillOpacity={0.2}
        strokeOpacity={0.6}
        strokeWidth="1"
      />

      {/* crown: enamel (outer) / dentin (inner) */}
      <path
        d="M150,150 L150,95 Q150,40 210,40 Q270,40 270,95 L270,150 Z"
        className="fill-secondary stroke-foreground"
        strokeWidth="1.5"
      />
      <path
        d="M164,150 L164,100 Q164,54 210,54 Q256,54 256,100 L256,150 Z"
        className="fill-chart-4 stroke-foreground"
        fillOpacity={0.2}
        strokeOpacity={0.6}
        strokeWidth="1"
      />

      {/* pulp chamber + canal */}
      <rect
        x="190"
        y="88"
        width="40"
        height="32"
        rx="10"
        className="fill-destructive stroke-foreground"
        fillOpacity={0.8}
        strokeWidth="1"
      />
      <path
        d="M200,118 L220,118 L212,268 L208,268 Z"
        className="fill-destructive stroke-foreground"
        fillOpacity={0.8}
        strokeWidth="1"
      />

      {/* CEJ line */}
      <line x1="140" y1="150" x2="280" y2="150" className="stroke-muted-foreground" strokeWidth="1" strokeDasharray="4 3" />

      {/* labels */}
      <g className="fill-foreground stroke-muted-foreground" strokeWidth="1" fontSize="14">
        <line x1="150" y1="70" x2="90" y2="70" />
        <text x="20" y="74" stroke="none">Enamel</text>

        <line x1="180" y1="120" x2="70" y2="130" />
        <text x="10" y="134" stroke="none">Dentin</text>

        <line x1="210" y1="104" x2="330" y2="80" />
        <text x="332" y="84" stroke="none">Pulp</text>

        <line x1="182" y1="200" x2="70" y2="200" />
        <text x="8" y="204" stroke="none">Cementum</text>

        <line x1="215" y1="230" x2="330" y2="230" />
        <text x="332" y="234" stroke="none">Root canal</text>

        <line x1="280" y1="150" x2="340" y2="150" />
        <text x="342" y="154" stroke="none">CEJ</text>

        <line x1="210" y1="308" x2="300" y2="330" />
        <text x="302" y="334" stroke="none" fontSize="13">
          Apical foramen
        </text>
      </g>
    </svg>
  );
}
