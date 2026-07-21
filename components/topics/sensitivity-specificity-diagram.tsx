// Original self-drawn schematic (7d-topic-notes-depth, batch 6) — the 2x2 diagnostic-test
// contingency table behind sensitivity and specificity, plus the SnNout/SpPin mnemonics tested
// alongside it (a highly Sensitive test, when Negative, rules a disease OUT; a highly Specific
// test, when Positive, rules a disease IN). Not traced from any textbook figure. Uses theme CSS
// vars via Tailwind fill/stroke utilities so it stays legible in light and dark mode.

function Cell({
  x,
  y,
  w,
  h,
  fillClass,
  label,
  sub,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fillClass: string;
  label: string;
  sub: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} className={`${fillClass} stroke-foreground`} fillOpacity={0.5} strokeWidth="1.5" />
      <text x={x + w / 2} y={y + h / 2 - 4} fontSize="15" fontWeight="700" textAnchor="middle" className="fill-foreground">
        {label}
      </text>
      <text x={x + w / 2} y={y + h / 2 + 14} fontSize="9.5" textAnchor="middle" className="fill-muted-foreground">
        {sub}
      </text>
    </g>
  );
}

export function SensitivitySpecificityDiagram() {
  const tableX = 130;
  const tableY = 44;
  const cellW = 110;
  const cellH = 66;

  return (
    <svg
      viewBox="0 0 480 330"
      role="img"
      aria-label="2 by 2 diagnostic test contingency table: test-positive results are true positive when disease is present and false positive when disease is absent; test-negative results are false negative when disease is present and true negative when disease is absent. Sensitivity equals true positives divided by all disease-present cases; specificity equals true negatives divided by all disease-absent cases. Mnemonics: SnNout, a highly sensitive test with a negative result rules a disease out; SpPin, a highly specific test with a positive result rules a disease in"
      className="mx-auto h-auto w-full max-w-md text-foreground"
    >
      <title>Sensitivity and specificity: the 2x2 diagnostic-test table</title>

      {/* column headers: disease status, centered over each column */}
      <text x={tableX + cellW / 2} y={tableY - 22} fontSize="11" fontWeight="600" textAnchor="middle" className="fill-foreground">
        Disease present
      </text>
      <text x={tableX + cellW * 1.5} y={tableY - 22} fontSize="11" fontWeight="600" textAnchor="middle" className="fill-foreground">
        Disease absent
      </text>

      {/* row headers: test result */}
      <text x={tableX - 10} y={tableY + cellH / 2 + 4} fontSize="11" fontWeight="600" textAnchor="end" className="fill-foreground">
        Test +
      </text>
      <text x={tableX - 10} y={tableY + cellH * 1.5 + 4} fontSize="11" fontWeight="600" textAnchor="end" className="fill-foreground">
        Test −
      </text>

      <Cell x={tableX} y={tableY} w={cellW} h={cellH} fillClass="fill-chart-3" label="TP" sub="true positive" />
      <Cell x={tableX + cellW} y={tableY} w={cellW} h={cellH} fillClass="fill-destructive" label="FP" sub="false positive" />
      <Cell x={tableX} y={tableY + cellH} w={cellW} h={cellH} fillClass="fill-destructive" label="FN" sub="false negative" />
      <Cell x={tableX + cellW} y={tableY + cellH} w={cellW} h={cellH} fillClass="fill-chart-3" label="TN" sub="true negative" />

      {/* formulas, stacked so neither line can bleed into the other at this font size */}
      <text x="240" y={tableY + cellH * 2 + 26} fontSize="11" textAnchor="middle" className="fill-foreground">
        Sensitivity = TP / (TP + FN)
      </text>
      <text x="240" y={tableY + cellH * 2 + 44} fontSize="11" textAnchor="middle" className="fill-foreground">
        Specificity = TN / (TN + FP)
      </text>

      <line
        x1="20"
        y1={tableY + cellH * 2 + 60}
        x2="460"
        y2={tableY + cellH * 2 + 60}
        className="stroke-muted-foreground"
        strokeDasharray="4 4"
      />

      <text x="240" y={tableY + cellH * 2 + 80} fontSize="11" fontWeight="600" textAnchor="middle" className="fill-foreground">
        SnNout: a very Sensitive test, if Negative, rules disease OUT
      </text>
      <text x="240" y={tableY + cellH * 2 + 98} fontSize="11" fontWeight="600" textAnchor="middle" className="fill-foreground">
        SpPin: a very Specific test, if Positive, rules disease IN
      </text>
    </svg>
  );
}
