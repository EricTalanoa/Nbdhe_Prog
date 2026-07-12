// Read-only patient-box display for a case (see 05-Dev/schema.md `cases.patient_box`).
// Case navigation (linking these into the practice loop) is 5b-case-nav.

export type PatientBoxData = {
  demographics: string;
  chief_complaint: string;
  background_history: string;
  current_findings: string;
};

export type CaseMediaItem = {
  id: string;
  kind: string;
  storage_path: string;
  caption: string | null;
};

const PATIENT_TYPE_LABEL: Record<string, string> = {
  adult: "Adult",
  pediatric: "Pediatric",
  geriatric: "Geriatric",
  special_needs: "Special needs",
  medically_compromised: "Medically compromised",
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm leading-relaxed">{value}</p>
    </div>
  );
}

export function PatientBox({
  title,
  patientType,
  patientBox,
  media = [],
}: {
  title: string;
  patientType: string | null;
  patientBox: PatientBoxData;
  media?: CaseMediaItem[];
}) {
  return (
    <div className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {patientType && (
          <span className="shrink-0 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            {PATIENT_TYPE_LABEL[patientType] ?? patientType}
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Demographics" value={patientBox.demographics} />
        <Field label="Chief complaint" value={patientBox.chief_complaint} />
        <Field label="Background / history" value={patientBox.background_history} />
        <Field label="Current findings" value={patientBox.current_findings} />
      </div>

      {media.length > 0 && (
        <div className="mt-5 border-t pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Media
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {media.map((m) => (
              <figure key={m.id} className="overflow-hidden rounded-lg border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.storage_path}
                  alt={m.caption ?? m.kind}
                  className="h-28 w-full object-cover"
                />
                {m.caption && (
                  <figcaption className="px-2 py-1 text-xs text-muted-foreground">
                    {m.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
