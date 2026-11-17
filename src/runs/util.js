// Utilidades compartidas por la webapp de runs: textos seguros, fechas en hora de Canarias y teléfonos.

export const TZ = "Atlantic/Canary";

/** Dominio interno con el que se registran las cuentas: <teléfono>@tel.alisiosdownwind.com (ver supabase/schema.sql) */
export const PHONE_EMAIL_DOMAIN = "tel.alisiosdownwind.com";

export const MODES = ["SUP foil", "Parawing", "Wing foil"];

export const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export function uid() {
  const a = new Uint32Array(2);
  crypto.getRandomValues(a);
  return (a[0].toString(36) + a[1].toString(36)).slice(0, 10);
}

/** Error con el campo del formulario al que pertenece, para pintarlo junto a ese campo */
export const fail = (message, field) => Object.assign(new Error(message), { field });

// ---------- Fechas ----------
// Los runs guardan su día como AAAA-MM-DD. Se formatean a mediodía UTC para que no cambien de día según el huso.

export function todayISO() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export const asDate = (iso) => new Date(`${iso}T12:00:00Z`);

export const fmtDate = (iso, opts) => new Intl.DateTimeFormat("es-ES", { timeZone: "UTC", ...opts }).format(asDate(iso));

export function addDays(iso, n) {
  const d = asDate(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function nextDow(dow, from = todayISO(), minOffset = 1) {
  let iso = addDays(from, minOffset);
  while (asDate(iso).getUTCDay() !== dow) iso = addDays(iso, 1);
  return iso;
}

export const dayDiff = (iso) => Math.round((asDate(iso) - asDate(todayISO())) / 86400000);

export function longDate(iso) {
  const diff = dayDiff(iso);
  const day = fmtDate(iso, { day: "numeric", month: "long" });
  const weekday = fmtDate(iso, { weekday: "long" });
  if (diff === 0) return `Hoy, ${weekday} ${day}`;
  if (diff === 1) return `Mañana, ${weekday} ${day}`;
  return `${cap(weekday)} ${day}`;
}

export function chatTime(ms) {
  const d = new Date(ms);
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const hm = new Intl.DateTimeFormat("es-ES", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(d);
  if (day === todayISO()) return hm;
  return `${new Intl.DateTimeFormat("es-ES", { timeZone: TZ, day: "numeric", month: "short" }).format(d)}, ${hm}`;
}

// ---------- Teléfonos ----------

export const PREFIXES = [
  ["+34", "España"],
  ["+351", "Portugal"],
  ["+33", "Francia"],
  ["+49", "Alemania"],
  ["+44", "Reino Unido"],
  ["+39", "Italia"],
  ["+31", "Países Bajos"],
  ["+41", "Suiza"],
  ["+43", "Austria"],
  ["+32", "Bélgica"],
  ["+45", "Dinamarca"],
  ["+46", "Suecia"],
  ["+47", "Noruega"],
  ["+1", "EE. UU. / Canadá"],
];

/** Devuelve { value: "+34612345678" } o { error: "..." } */
export function normalizePhone(prefix, raw) {
  const text = String(raw || "").trim();
  let digits = text.replace(/\D/g, "");
  if (!digits) return { error: "Escribe tu número de teléfono." };
  if (text.startsWith("+") || text.startsWith("00")) {
    digits = digits.replace(/^00/, "");
    if (digits.length < 8 || digits.length > 15) return { error: "Este número no parece válido. Revisa las cifras." };
    return { value: `+${digits}` };
  }
  if (prefix === "+34") {
    if (!/^[67]\d{8}$/.test(digits)) return { error: "Un móvil español tiene 9 cifras y empieza por 6 o 7." };
  } else if (digits.length < 6 || digits.length > 13) {
    return { error: "Este número no parece válido. Revisa las cifras." };
  }
  return { value: prefix + digits };
}

export function prettyPhone(phone) {
  const m = /^\+34(\d{3})(\d{3})(\d{3})$/.exec(phone || "");
  return m ? `+34 ${m[1]} ${m[2]} ${m[3]}` : phone || "";
}

export const phoneToEmail = (phone) => `${String(phone).replace(/\D/g, "")}@${PHONE_EMAIL_DOMAIN}`;

export const emailToPhone = (email) => `+${String(email || "").split("@")[0].replace(/\D/g, "")}`;
