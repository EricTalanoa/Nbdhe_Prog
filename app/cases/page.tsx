import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type CaseRow = {
  slug: string;
  title: string;
  patient_type: string | null;
};

export default async function CasesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("cases")
    .select("slug, title, patient_type")
    .order("title", { ascending: true });

  const cases = (data ?? []) as CaseRow[];

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cases</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {cases.length} case{cases.length === 1 ? "" : "s"} · patient-based item sets
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-muted-foreground underline underline-offset-4">
          ← Dashboard
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Couldn&apos;t load cases: {error.message}
        </div>
      )}

      {!error && cases.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          <p className="font-medium text-foreground">No cases yet.</p>
          <p className="mt-2">
            Apply the cases/testlets migration, then run{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">npm run content:import</code> to seed
            the sample case from the vault.
          </p>
        </div>
      )}

      <ul className="space-y-3">
        {cases.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/cases/${c.slug}`}
              className="block rounded-xl border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-accent/50"
            >
              <p className="font-medium">{c.title}</p>
              {c.patient_type && <p className="mt-1 text-xs text-muted-foreground">{c.patient_type}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
