// Clases compartidas de botones y bloques. Botón principal: 8px vertical, 12px horizontal, 16px semibold.

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 font-semibold transition-all duration-700 ease-fluid active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60";

export const btnPrimary = `${base} text-base bg-foam text-ink hover:bg-foam-strong hover:-translate-y-0.5`;
export const btnGhost = `${base} text-base border border-white/15 text-white hover:bg-white/10 hover:-translate-y-0.5`;
export const btnSmall = `${base} text-sm bg-foam text-ink hover:bg-foam-strong`;

export const container = "mx-auto w-full max-w-6xl px-4 md:px-6";
export const section = "py-24";
export const eyebrow = "text-sm font-semibold text-foam";
export const h2 = "mt-4 max-w-[680px] text-3xl font-semibold tracking-tight md:text-5xl";
export const lead = "mt-6 max-w-[680px] text-lg text-white/70";
