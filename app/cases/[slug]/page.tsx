import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PatientBox, type CaseMediaItem, type PatientBoxData } from "@/components/cases/patient-box";

type CaseDetailRow = {
  id: string;
  slug: string;
  title: string;
  patient_type: string | null;
  patient_box: PatientBoxData;
};

type LinkedQuestion = {
  slug: string;
  stem: string;
  format: string;
};

export default async function CaseDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: caseRow, error } = await supabase
    .from("cases")
    .select("id, slug, title, patient_type, patient_box")
    .eq("slug", params.slug)
    .maybeSingle();

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Couldn&apos;t load case: {error.message}
        </div>
      </main>
    );
  }
  if (!caseRow) notFound();

  const typedCase = caseRow as CaseDetailRow;

  const { data: mediaRows } = await supabase
    .from("case_media")
    .select("id, kind, storage_path, caption")
    .eq("case_id", typedCase.id)
    .order("sort_order", { ascending: true });

  const { data: itemRows } = await supabase
    .from("questions")
    .select("slug, stem, format")
    .eq("case_id", typedCase.id)
    .in("status", ["approved", "live"]);

  const items = (itemRows ?? []) as LinkedQuestion[];
  const media = (mediaRows ?? []) as CaseMediaItem[];

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <Link href="/cases" className="text-sm text-muted-foreground underline underline-offset-4">
          ← Cases
        </Link>
      </div>

      <PatientBox
        title={typedCase.title}
        patientType={typedCase.patient_type}
        patientBox={typedCase.patient_box}
        media={media}
      />

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Linked items · {items.length}
        </h2>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items linked to this case yet.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((q) => (
              <li key={q.slug} className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
                <code className="text-xs text-muted-foreground">{q.slug}</code>
                <p className="mt-1 text-sm">{q.stem}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Answering these items in sequence inside the practice loop lands in 5b-case-nav.
        </p>
      </section>
    </main>
  );
}
