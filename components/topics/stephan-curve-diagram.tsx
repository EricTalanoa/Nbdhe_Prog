// Original self-drawn schematic (7d-topic-notes-depth, batch 4) — two Stephan-curve panels
// plotting plaque pH against time after a fermentable-carbohydrate exposure: (A) a single exposure,
// where pH dips below the ~5.5 critical pH for enamel and then fully recovers before the next
// meal, versus (B) closely spaced exposures (snacking), where pH is dragged back down before it
// recovers and total time spent below critical pH is much longer even though each individual dip
// looks similar. Curve shapes and axis values are illustrative, not traced from any published
// dataset or textbook figure. Uses theme CSS vars via Tailwind fill/stroke utilities so it stays
// legible in light and dark mode.

function AxisLabels() {
  return (
    <>
      <text x="28" y="49" fontSize="9" textAnchor="end" className="fill-muted-foreground">
        7.0
      </text>
      <text x="28" y="109" fontSize="9" textAnchor="end" className="fill-destructive">
        5.5
      </text>
      <text x="28" y="169" fontSize="9" textAnchor="end" className="fill-muted-foreground">
        4.0
      </text>
      <line x1="34" y1="45" x2="34" y2="165" className="stroke-foreground" strokeWidth="1.25" />
      <line x1="34" y1="165" x2="234" y2="165" className="stroke-foreground" strokeWidth="1.25" />
      <line
        x1="34"
        y1="105"
        x2="234"
        y2="105"
        className="stroke-destructive"
        strokeWidth="1.25"
        strokeDasharray="4 3"
      />
      <text x="134" y="181" fontSize="9.5" textAnchor="middle" className="fill-muted-foreground">
        Minutes after exposure →
      </text>
    </>
  );
}

function ExposureMarker({ x }: { x: number }) {
  return (
    <g transform={`translate(${x},30)`}>
      <path d="M0,0 L-4,-8 L4,-8 Z" className="fill-chart-4 stroke-foreground" strokeWidth="0.75" />
      <text x="0" y="-11" fontSize="8.5" textAnchor="middle" className="fill-foreground">
        sugar
      </text>
    </g>
  );
}

function SinglePanel() {
  return (
    <g transform="translate(10,10)">
      <text x="134" y="14" fontSize="13" fontWeight="600" textAnchor="middle" className="fill-foreground">
        Single exposure
      </text>
      <AxisLabels />
      <ExposureMarker x={59} />
      <polygon
        points="72.9,105 84,153 124,125 144,105"
        className="fill-destructive"
        fillOpacity={0.3}
      />
      <polyline
        points="34,45 59,45 84,153 124,125 164,85 209,45 234,45"
        className="stroke-chart-2"
        strokeWidth="2"
        fill="none"
      />
      <text x="134" y="196" fontSize="9.5" textAnchor="middle" className="fill-muted-foreground">
        pH dips, then fully recovers
      </text>
      <text x="134" y="209" fontSize="9.5" textAnchor="middle" className="fill-muted-foreground">
        above critical before the next meal.
      </text>
    </g>
  );
}

function FrequentPanel() {
  return (
    <g transform="translate(310,10)">
      <text x="134" y="14" fontSize="13" fontWeight="600" textAnchor="middle" className="fill-foreground">
        Frequent exposures (snacking)
      </text>
      <AxisLabels />
      <ExposureMarker x={49} />
      <ExposureMarker x={89} />
      <ExposureMarker x={129} />
      <polygon
        points="59,105 64,135 79,115 89,130 104,120 114,135 129,125 144,115 154,105"
        className="fill-destructive"
        fillOpacity={0.3}
      />
      <polyline
        points="34,45 49,45 64,135 79,115 89,130 104,120 114,135 129,125 144,115 174,85 199,55 234,45"
        className="stroke-chart-2"
        strokeWidth="2"
        fill="none"
      />
      <text x="134" y="196" fontSize="9.5" textAnchor="middle" className="fill-muted-foreground">
        Back-to-back dips keep pH below
      </text>
      <text x="134" y="209" fontSize="9.5" textAnchor="middle" className="fill-muted-foreground">
        critical almost continuously.
      </text>
    </g>
  );
}

export function StephanCurveDiagram() {
  return (
    <svg
      viewBox="0 0 570 225"
      role="img"
      aria-label="Two Stephan curve graphs of plaque pH over time after a sugar exposure: a single exposure where pH dips below the critical pH of about 5.5 and fully recovers, versus frequent snacking exposures where pH is kept below critical almost continuously, illustrating why exposure frequency matters more than total sugar quantity"
      className="mx-auto h-auto w-full max-w-xl text-foreground"
    >
      <title>The Stephan curve: exposure frequency vs. total time below critical pH</title>
      <SinglePanel />
      <FrequentPanel />
    </svg>
  );
}
