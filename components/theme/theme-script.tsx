// Runs synchronously in <head>, before the body paints, so the `dark` class lands on <html>
// before first paint instead of after hydration (which would flash the light theme for a split
// second on every load). Static string, no interpolation — same
// dangerouslySetInnerHTML pattern the 8c-injection-hardening audit already approved for the
// landing page's scoped <style> block. Keep the "nbdhe-theme" key literal in sync with
// lib/theme.ts's THEME_STORAGE_KEY — this file can't import it since it must stay a plain
// string with no build-time interpolation.
const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem("nbdhe-theme");var m=s==="light"||s==="dark"||s==="system"?s:"system";var d=m==="dark"||(m==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
}
