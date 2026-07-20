"use client";

import { useState } from "react";
import { SignInModal } from "@/components/landing/sign-in-modal";

// Landing / intro page for logged-out visitors. Ported from the approved design
// (seafoam & white theme). Self-contained: all colors are CSS variables scoped to `.nb-root`
// via a namespaced <style> block, and the light/dark toggle flips `data-nb-theme` on the
// wrapper only — it never touches the app's own theme tokens or the rest of the DOM.

type Vars = React.CSSProperties;

function Icon({
  paths,
  size = 18,
  sw = 2,
}: {
  paths: string[];
  size?: number;
  sw?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

const AREAS = [
  "Anatomic Sciences",
  "Physiology",
  "Biochemistry & Nutrition",
  "Microbiology & Immunology",
  "Pathology",
  "Pharmacology (incl. Local Anesthesia)",
  "Patient Assessment",
  "Dental Radiography",
  "Dental Hygiene Care Planning",
  "Periodontal Disease Management",
  "Preventive Agents",
  "Supportive Treatment Services",
  "Professional Responsibility",
  "Research & Community Health",
];

const STATS = [
  { value: "190+", label: "Original items", note: "and growing", color: "var(--teal)" },
  { value: "10", label: "Patient cases", note: "and growing", color: "var(--cyan)" },
  { value: "14", label: "Score areas", note: "full blueprint coverage", color: "var(--blue)" },
  { value: "SM-2", label: "Spaced-repetition flashcards", note: "due-card scheduling", color: "var(--gold)" },
];

const STEPS = [
  {
    n: "1",
    color: "var(--teal)",
    title: "Sign in",
    body: "A passwordless magic link — no password to remember, nothing to manage.",
  },
  {
    n: "2",
    color: "var(--cyan)",
    title: "Practice",
    body: "Pick a topic set, build a custom set (area, difficulty, size, timer), or take a quick 10-question set. Every answer explains the correct rationale and why each wrong option is wrong.",
  },
  {
    n: "3",
    color: "var(--blue)",
    title: "Review",
    body: "Spaced-repetition flashcards, retries of missed or flagged questions, and topic notes with original diagrams.",
  },
  {
    n: "4",
    color: "var(--green)",
    title: "Track readiness",
    body: "Analytics roll up to each score area with a readiness band, coverage %, weak-spot ranking, an accuracy trend, and study-next suggestions — plus a timed two-component mock exam.",
  },
];

const FEATURES = [
  { color: "var(--teal)", paths: ["M4 6h16M4 12h16M4 18h10"], title: "Question sets", body: "One-tap sets by topic — local anesthesia, perio, radiology, and more." },
  { color: "var(--cyan)", paths: ["M12 3v18M3 12h18"], title: "Build a set", body: "Choose areas, difficulty, size, and an optional timer." },
  { color: "var(--blue)", paths: ["M8 12l3 3 5-6", "M12 3l7 3v5c0 5-3.2 8.5-7 10-3.8-1.5-7-5-7-10V6z"], title: "Study-mode feedback", body: "Rationale plus per-distractor explanations; three item formats, with EXCEPT/NOT items flagged." },
  { color: "var(--gold)", paths: ["M12 12a4 4 0 100-8 4 4 0 000 8z", "M4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1"], title: "Patient cases", body: "Realistic patient boxes with linked questions — pediatric, geriatric, pregnant, medically complex, special needs, oral pathology." },
  { color: "var(--green)", paths: ["M12 8v4l3 2", "M12 22a10 10 0 100-20 10 10 0 000 20z"], title: "Mock exam", body: "A timed, format-accurate two-component NBDHE simulation with a scoreband." },
  { color: "var(--teal)", paths: ["M4 5h16v14H4z", "M4 12h16"], title: "Flashcards", body: "SM-2 spaced repetition surfaces exactly the cards due today." },
  { color: "var(--cyan)", paths: ["M4 20V10M10 20V4M16 20v-8M22 20H2"], title: "Progress & readiness", body: "Per-area readiness bands, weak spots, coverage, and your accuracy trend." },
  { color: "var(--blue)", paths: ["M5 4h11l3 3v13H5z", "M9 9h6M9 13h6M9 17h4"], title: "Topic notes", body: "An overview plus original hand-drawn diagrams for each score area." },
  { color: "var(--gold)", paths: ["M2 12h4l2-7 4 14 3-10 2 3h5"], title: "Works offline", body: "Installable as an app — keep studying without a connection." },
];

const CSS = `
.nb-root{
  --teal:hsl(168 54% 42%);--cyan:hsl(190 60% 42%);--green:hsl(145 50% 45%);--gold:hsl(43 74% 60%);--blue:hsl(210 55% 55%);
  min-height:100vh;background:var(--bg);color:var(--fg);
  font-family:-apple-system,"SF Pro Text","Segoe UI",system-ui,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;
  scroll-behavior:smooth;
}
.nb-root[data-nb-theme="light"]{
  --bg:hsl(165 38% 98.5%);--fg:hsl(196 30% 15%);--muted:hsl(196 18% 42%);
  --primary:hsl(168 54% 39%);--primary-fg:#fff;--accent:hsl(166 46% 91%);
  --card:#fff;--border:hsl(166 26% 88%);--pill-bg:hsl(166 46% 93%);--ring-track:hsl(166 26% 90%);
  --shadow:0 1px 2px hsl(196 30% 15% / .04), 0 8px 24px hsl(168 40% 30% / .07);
  --shadow-lg:0 2px 4px hsl(196 30% 15% / .05), 0 16px 40px hsl(168 40% 30% / .12);
  --hero-grad:radial-gradient(80rem 40rem at 70% -10%, hsl(166 46% 91% / .8), transparent 60%), radial-gradient(50rem 30rem at 10% 10%, hsl(190 60% 92% / .6), transparent 60%);
}
.nb-root[data-nb-theme="dark"]{
  --bg:hsl(196 32% 8%);--fg:hsl(160 24% 92%);--muted:hsl(180 12% 62%);
  --primary:hsl(168 54% 42%);--primary-fg:hsl(196 32% 8%);--accent:hsl(196 28% 14%);
  --card:hsl(196 28% 11%);--border:hsl(196 24% 18%);--pill-bg:hsl(196 28% 14%);--ring-track:hsl(196 24% 18%);
  --shadow:0 1px 2px hsl(0 0% 0% / .2), 0 8px 24px hsl(0 0% 0% / .3);
  --shadow-lg:0 2px 4px hsl(0 0% 0% / .25), 0 16px 40px hsl(0 0% 0% / .45);
  --hero-grad:radial-gradient(80rem 40rem at 70% -10%, hsl(168 40% 16% / .6), transparent 60%), radial-gradient(50rem 30rem at 10% 10%, hsl(196 40% 14% / .5), transparent 60%);
}
.nb-root a{color:inherit;text-decoration:none}
.nb-root :focus-visible{outline:2px solid var(--primary);outline-offset:3px;border-radius:4px}
.nb-cta{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:12px;border:0;background:var(--primary);color:var(--primary-fg);font-weight:700;font-size:16px;cursor:pointer;font-family:inherit;box-shadow:var(--shadow-lg);transition:transform .15s ease}
.nb-cta:hover{transform:translateY(-2px)}
.nb-signin{display:inline-flex;align-items:center;padding:9px 18px;border-radius:10px;border:0;background:var(--primary);color:var(--primary-fg);font-weight:600;font-size:14px;cursor:pointer;font-family:inherit;box-shadow:var(--shadow);transition:transform .15s ease}
.nb-signin:hover{transform:translateY(-1px)}
.nb-ghost{display:inline-flex;align-items:center;padding:14px 20px;border-radius:12px;border:1px solid var(--border);color:var(--fg);font-weight:600;font-size:15px;background:transparent;transition:border-color .15s ease}
.nb-ghost:hover{border-color:var(--primary)}
.nb-toggle{width:38px;height:38px;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--muted);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:color .15s ease,border-color .15s ease}
.nb-toggle:hover{color:var(--fg);border-color:var(--primary)}
.nb-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:24px;box-shadow:var(--shadow);transition:transform .15s ease, box-shadow .15s ease}
.nb-card:hover{transform:translateY(-3px);box-shadow:var(--shadow-lg)}
.nb-input{width:100%;padding:11px 13px;border-radius:10px;border:1px solid var(--border);background:var(--bg);color:var(--fg);font-size:15px;font-family:inherit;box-sizing:border-box}
.nb-input:focus{outline:2px solid var(--primary);outline-offset:1px;border-color:var(--primary)}
.nb-close{position:absolute;top:12px;right:12px;width:32px;height:32px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--muted);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:13px;line-height:1}
.nb-close:hover{color:var(--fg);border-color:var(--primary)}
@media (prefers-reduced-motion: reduce){.nb-root{scroll-behavior:auto}.nb-root *{transition:none !important;animation:none !important}}
`;

export function LandingPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [signInOpen, setSignInOpen] = useState(false);
  const openSignIn = () => setSignInOpen(true);

  const wrap: Vars = { maxWidth: 1120, margin: "0 auto", padding: "0 24px" };
  const eyebrow: Vars = {
    margin: 0,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: ".1em",
    textTransform: "uppercase",
    color: "var(--primary)",
  };
  const h2: Vars = {
    margin: "12px 0 0",
    fontSize: "clamp(26px,3.6vw,38px)",
    letterSpacing: "-0.02em",
    fontWeight: 800,
    textWrap: "balance" as Vars["textWrap"],
  };

  return (
    <div className="nb-root" data-nb-theme={theme}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* HEADER */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          backdropFilter: "blur(12px)",
          background: "color-mix(in srgb, var(--bg) 82%, transparent)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            ...wrap,
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              fontSize: 17,
            }}
          >
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                background: "linear-gradient(135deg, var(--teal), var(--cyan))",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                boxShadow: "var(--shadow)",
              }}
            >
              <Icon size={16} sw={2.2} paths={["M12 3l7 3v5c0 5-3.2 8.5-7 10-3.8-1.5-7-5-7-10V6z", "M9 12l2 2 4-4.5"]} />
            </span>
            NBDHE Prep <span style={{ color: "var(--primary)" }}>2026</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              aria-label="Toggle color theme"
              className="nb-toggle"
            >
              {theme === "dark" ? (
                <Icon paths={["M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4", "M12 8a4 4 0 100 8 4 4 0 000-8z"]} />
              ) : (
                <Icon paths={["M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"]} />
              )}
            </button>
            <button type="button" onClick={openSignIn} className="nb-signin">
              Sign in
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section aria-label="Intro" style={{ position: "relative", overflow: "hidden", backgroundImage: "var(--hero-grad)" }}>
          <svg aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5, pointerEvents: "none" }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="nbdots" width="26" height="26" patternUnits="userSpaceOnUse">
                <circle cx="1.3" cy="1.3" r="1.3" fill="var(--border)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#nbdots)" style={{ maskImage: "linear-gradient(to bottom, black 0%, transparent 75%)", WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 75%)" }} />
          </svg>
          <div style={{ ...wrap, position: "relative", padding: "72px 24px 80px", display: "flex", flexWrap: "wrap", gap: 56, alignItems: "center" }}>
            <div style={{ flex: "1 1 420px", minWidth: "min(100%,340px)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "var(--pill-bg)", border: "1px solid var(--border)", color: "var(--primary)", fontSize: 13, fontWeight: 600, letterSpacing: ".02em" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)" }} />
                Free concept demo — no payment, no ads
              </span>
              <h1 style={{ margin: "22px 0 0", fontSize: "clamp(34px, 5.4vw, 56px)", lineHeight: 1.06, letterSpacing: "-0.03em", fontWeight: 800, textWrap: "balance" as Vars["textWrap"] }}>
                Pass-ready for the NBDHE — one focused rep at a time.
              </h1>
              <p style={{ margin: "20px 0 0", fontSize: "clamp(16px,2.2vw,19px)", lineHeight: 1.6, color: "var(--muted)", maxWidth: "34em", textWrap: "pretty" as Vars["textWrap"] }}>
                Original, blueprint-aligned NBDHE practice — with analytics that show you when you&apos;re actually ready, area by area.
              </p>
              <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
                <button type="button" onClick={openSignIn} className="nb-cta">
                  Start practicing — it&apos;s free
                  <Icon size={16} sw={2.4} paths={["M5 12h14M13 6l6 6-6 6"]} />
                </button>
                <a href="#covered" className="nb-ghost">
                  See what&apos;s inside
                </a>
              </div>
              <p style={{ margin: "22px 0 0", fontSize: 13, color: "var(--muted)" }}>
                Passwordless sign-in · 100% original items · Not affiliated with JCNDE or ADA
              </p>
            </div>

            {/* Hero visual: stylized readiness dashboard */}
            <div aria-hidden="true" style={{ flex: "1 1 380px", minWidth: "min(100%,320px)", display: "flex", justifyContent: "center" }}>
              <div style={{ width: "100%", maxWidth: 440, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "var(--shadow-lg)", padding: 22, display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Readiness</div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--green)", background: "color-mix(in srgb, var(--green) 12%, transparent)", padding: "4px 10px", borderRadius: 999 }}>Trending up</span>
                </div>
                <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
                  <svg width="118" height="118" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="var(--ring-track)" strokeWidth="10" />
                    <circle cx="60" cy="60" r="52" fill="none" stroke="var(--teal)" strokeWidth="10" strokeLinecap="round" strokeDasharray="238 327" transform="rotate(-90 60 60)" />
                    <circle cx="60" cy="60" r="38" fill="none" stroke="var(--ring-track)" strokeWidth="10" />
                    <circle cx="60" cy="60" r="38" fill="none" stroke="var(--cyan)" strokeWidth="10" strokeLinecap="round" strokeDasharray="150 239" transform="rotate(-90 60 60)" />
                    <text x="60" y="66" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--fg)" fontFamily="inherit">73%</text>
                  </svg>
                  <div style={{ flex: 1, minWidth: 150, display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { name: "Pharmacology", band: "Ready", color: "var(--green)", pct: 86 },
                      { name: "Radiography", band: "Approaching", color: "var(--gold)", pct: 58 },
                      { name: "Periodontics", band: "Approaching", color: "var(--cyan)", pct: 64 },
                    ].map((r) => (
                      <div key={r.name}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 5 }}>
                          <span>{r.name}</span>
                          <span style={{ color: r.color, fontWeight: 600 }}>{r.band}</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: "var(--ring-track)" }}>
                          <div style={{ width: `${r.pct}%`, height: "100%", borderRadius: 3, background: r.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", letterSpacing: ".06em", textTransform: "uppercase" }}>Question 7 of 10</div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>
                    Which local anesthetic is an amide with the <em>shortest</em> duration of action?
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 9, border: "1.5px solid var(--green)", background: "color-mix(in srgb, var(--green) 8%, transparent)", fontSize: 13, fontWeight: 600 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 7" /></svg>
                      Prilocaine (plain)
                    </div>
                    <div style={{ padding: "8px 12px", borderRadius: 9, border: "1px solid var(--border)", fontSize: 13, color: "var(--muted)" }}>Bupivacaine</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHAT'S COVERED */}
        <section id="covered" aria-label="What's covered" style={{ borderTop: "1px solid var(--border)" }}>
          <div style={{ ...wrap, padding: "80px 24px" }}>
            <p style={eyebrow}>What&apos;s covered</p>
            <h2 style={{ ...h2, maxWidth: "22em" }}>
              The full 2026 blueprint — all 13 discipline score areas, plus Research &amp; Community Health.
            </h2>
            <div style={{ marginTop: 36, display: "flex", flexWrap: "wrap", gap: 10 }}>
              {AREAS.map((area) => (
                <span key={area} style={{ padding: "9px 16px", borderRadius: 999, background: "var(--card)", border: "1px solid var(--border)", fontSize: 14, fontWeight: 500, boxShadow: "var(--shadow)" }}>
                  {area}
                </span>
              ))}
            </div>
            <div style={{ marginTop: 44, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
              {STATS.map((s) => (
                <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 22, boxShadow: "var(--shadow)" }}>
                  <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em", color: s.color }}>{s.value}</div>
                  <div style={{ marginTop: 6, fontSize: 14, fontWeight: 600 }}>{s.label}</div>
                  <div style={{ marginTop: 3, fontSize: 12, color: "var(--muted)" }}>{s.note}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section aria-label="How it works" style={{ background: "var(--accent)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <div style={{ ...wrap, padding: "80px 24px" }}>
            <p style={eyebrow}>How it works</p>
            <h2 style={h2}>Four steps, one calm loop.</h2>
            <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
              {STEPS.map((st) => (
                <div key={st.n} className="nb-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 36, height: 36, borderRadius: 10, background: `color-mix(in srgb, ${st.color} 14%, transparent)`, color: st.color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15 }}>{st.n}</span>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{st.title}</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--muted)", textWrap: "pretty" as Vars["textWrap"] }}>{st.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section aria-label="Features">
          <div style={{ ...wrap, padding: "80px 24px" }}>
            <p style={eyebrow}>Everything inside</p>
            <h2 style={h2}>Built for the way you actually study.</h2>
            <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
              {FEATURES.map((f) => (
                <div key={f.title} className="nb-card">
                  <span style={{ width: 38, height: 38, borderRadius: 10, background: `color-mix(in srgb, ${f.color} 13%, transparent)`, color: f.color, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon paths={f.paths} />
                  </span>
                  <h3 style={{ margin: "14px 0 0", fontSize: 16.5, fontWeight: 700 }}>{f.title}</h3>
                  <p style={{ margin: "7px 0 0", fontSize: 14, lineHeight: 1.55, color: "var(--muted)", textWrap: "pretty" as Vars["textWrap"] }}>{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CLOSING CTA */}
        <section aria-label="Get started" style={{ borderTop: "1px solid var(--border)", backgroundImage: "var(--hero-grad)" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", padding: "88px 24px", textAlign: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "var(--pill-bg)", border: "1px solid var(--border)", color: "var(--primary)", fontSize: 13, fontWeight: 600 }}>Free concept demo</span>
            <h2 style={{ margin: "20px 0 0", fontSize: "clamp(28px,4vw,42px)", letterSpacing: "-0.025em", fontWeight: 800, textWrap: "balance" as Vars["textWrap"] }}>Your next rep is the one that counts.</h2>
            <p style={{ margin: "16px auto 0", fontSize: 17, lineHeight: 1.6, color: "var(--muted)", maxWidth: "32em" }}>
              No payment, no subscription, no pressure — just focused, original NBDHE practice and a clear read on your readiness.
            </p>
            <div style={{ marginTop: 30 }}>
              <button type="button" onClick={openSignIn} className="nb-cta">Start practicing — it&apos;s free</button>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)" }}>
        <div style={{ ...wrap, padding: "36px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.7, color: "var(--muted)", maxWidth: "64em", textWrap: "pretty" as Vars["textWrap"] }}>
            All study content is 100% original, written to the 2026 NBDHE blueprint from standard dental-hygiene references. It does not reproduce real examination questions. NBDHE Prep 2026 is a free, non-commercial concept demo and is not affiliated with, endorsed by, or connected to the Joint Commission on National Dental Examinations (JCNDE), the American Dental Association (ADA), or any testing body.
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>Built as a concept demo · For demonstration only</p>
        </div>
      </footer>

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </div>
  );
}
