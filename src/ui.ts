// Clases compartidas. Botón principal: 8px vertical, 12px horizontal, 16px semibold.

const base =
  "inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink px-3 py-2 font-semibold transition-all duration-700 ease-fluid hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:pointer-events-none disabled:opacity-60";

export const btnPrimary = `${base} text-base bg-ink text-cream shadow-hard-sun hover:bg-blue`;
export const btnSecondary = `${base} text-base bg-paper text-ink shadow-hard-sm hover:bg-sun`;
export const btnSmall = `${base} text-sm bg-ink text-cream hover:bg-blue`;

export const container = "mx-auto w-full max-w-6xl px-4 md:px-6";
export const section = "py-24";
export const stickerBase =
  "inline-flex items-center gap-2 rounded-full border-2 border-ink px-3 py-1 text-sm font-semibold uppercase tracking-wide text-ink";
export const sticker = `${stickerBase} bg-sun`;
export const h2 = "mt-6 max-w-[680px] font-display text-5xl uppercase leading-none md:text-7xl";
export const lead = "mt-6 max-w-[680px] text-lg text-ink/70";
export const card = "rounded-2xl border-2 border-ink bg-paper shadow-hard";
