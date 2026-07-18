// Original self-drawn schematic (7d-topic-notes-depth) — a simplified sagittal cross-section of a
// single-rooted tooth, labeling the layers tested under Anatomic Sciences. Deliberately simple
// line-art (same spirit as the app's `public/icon.svg`), not a scanned/traced textbook figure.

const TOOTH_OUTLINE =
  "M110,170 C110,170 100,120 115,70 C125,45 145,35 160,35 C175,35 195,45 205,70 " +
  "C220,120 210,170 210,170 L210,170 C205,220 190,280 170,320 C165,335 162,345 160,350 " +
  "C158,345 155,335 150,320 C130,280 115,220 110,170 Z";

function Label({
  x,
  y,
  lineTo,
  children,
  anchor = "start",
}: {
  x: number;
  y: number;
  lineTo: { x: number; y: number };
  children: string;
  anchor?: "start" | "end";
}) {
  return (
    <g>
      <line
        x1={x}
        y1={y}
        x2={lineTo.x}
        y2={lineTo.y}
        stroke="currentColor"
        strokeWidth={1}
        opacity={0.5}
      />
      <circle cx={lineTo.x} cy={lineTo.y} r={2.5} fill="currentColor" opacity={0.6} />
      <text
        x={x}
        y={y}
        dy={4}
        textAnchor={anchor}
        className="fill-current text-[11px] font-medium"
      >
        {children}
      </text>
    </g>
  );
}

export function ToothAnatomyDiagram() {
  return (
    <figure className="mt-4 rounded-lg border bg-card p-4">
      <svg
        viewBox="-20 0 360 400"
        className="mx-auto h-auto w-full max-w-xs text-foreground"
        role="img"
        aria-label="Schematic cross-section of a tooth labeling enamel, dentin, pulp, cementum, the cementoenamel junction, periodontal ligament, gingiva, and alveolar bone"
      >
        {/* Alveolar bone flanking the root */}
        <rect x={72} y={185} width={26} height={140} rx={4} fill="#c7d4cf" stroke="currentColor" strokeOpacity={0.3} />
        <rect x={222} y={185} width={26} height={140} rx={4} fill="#c7d4cf" stroke="currentColor" strokeOpacity={0.3} />

        {/* Periodontal ligament space (dashed, root only) */}
        <path
          d="M110,182 C108,225 116,270 133,308 M210,182 C212,225 204,270 187,308"
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.55}
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />

        {/* Whole-tooth outline, cementum-tinted base (root) */}
        <path d={TOOTH_OUTLINE} fill="#c9b48f" stroke="currentColor" strokeOpacity={0.4} />
        {/* Enamel overlay, clipped to the crown (above the CEJ line) */}
        <clipPath id="crownClip">
          <rect x={0} y={0} width={320} height={170} />
        </clipPath>
        <path d={TOOTH_OUTLINE} fill="#eee7d8" clipPath="url(#crownClip)" stroke="currentColor" strokeOpacity={0.4} />

        {/* Dentin — inset copy of the outline, leaving a visible enamel/cementum band */}
        <path
          d={TOOTH_OUTLINE}
          fill="#d8c9a3"
          transform="translate(160,193) scale(0.66) translate(-160,-193)"
        />

        {/* Pulp chamber (crown) + canal (root), drawn separately so it can't bleed into the gingiva */}
        <ellipse cx={160} cy={100} rx={26} ry={44} fill="#c9596b" />
        <path d="M144,140 L176,140 L163,300 L157,300 Z" fill="#c9596b" />

        {/* CEJ line */}
        <line x1={100} y1={170} x2={220} y2={170} stroke="currentColor" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.7} />

        {/* Gingiva collar */}
        <path
          d="M96,150 C96,138 122,128 160,128 C198,128 224,138 224,150 C224,168 210,188 160,190 C110,188 96,168 96,150 Z"
          fill="#eba8b2"
          opacity={0.65}
          stroke="currentColor"
          strokeOpacity={0.3}
        />

        {/* Labels */}
        <Label x={252} y={70} lineTo={{ x: 195, y: 75 }}>
          Enamel
        </Label>
        <Label x={252} y={100} lineTo={{ x: 183, y: 110 }}>
          Dentin
        </Label>
        <Label x={252} y={130} lineTo={{ x: 175, y: 108 }}>
          Pulp
        </Label>
        <Label x={252} y={170} lineTo={{ x: 213, y: 170 }}>
          CEJ
        </Label>
        <Label x={252} y={200} lineTo={{ x: 205, y: 205 }}>
          Gingiva
        </Label>
        <Label x={252} y={230} lineTo={{ x: 205, y: 245 }}>
          Cementum
        </Label>
        <Label x={20} y={230} lineTo={{ x: 108, y: 240 }} anchor="end">
          PDL
        </Label>
        <Label x={20} y={270} lineTo={{ x: 82, y: 260 }} anchor="end">
          Bone
        </Label>
        <Label x={160} y={370} lineTo={{ x: 160, y: 350 }} anchor="start">
          Apex
        </Label>
      </svg>
      <figcaption className="mt-2 text-center text-xs text-muted-foreground">
        Enamel covers the crown; cementum covers the root — they meet at the CEJ. Dentin makes up
        the bulk of the tooth around a central pulp chamber and canal.
      </figcaption>
    </figure>
  );
}
