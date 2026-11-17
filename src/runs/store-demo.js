// Datos de la webapp en modo demo: todo se guarda en este navegador (localStorage), con riders y runs de ejemplo.
// Se usa cuando la web no tiene configurado Supabase (ver README). Tiene la misma interfaz que store-supabase.js.

import { MODES, addDays, fail, nextDow, todayISO, uid } from "./util.js";

const KEY = "alisios-runs-demo-v1";

// Solo para la demo. Con Supabase, la contraseña la guarda y la comprueba su servicio de cuentas, nunca el navegador.
async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  let h = 5381;
  for (const b of data) h = ((h << 5) + h + b) >>> 0;
  return `x${h.toString(16)}`;
}

function seed() {
  const now = Date.now();
  const H = 3600000;
  const sat = nextDow(6);
  const sun = nextDow(0);
  const wed = nextDow(3);
  const ex = (id, name, level, modes) => ({ id, name, level, modes, phone: "", role: "rider", showPhone: false, example: true });
  const users = [
    { ...ex("ex-org", "Equipo Alisios", 3, [...MODES]), role: "organizer" },
    ex("ex-nayra", "Nayra", 3, ["SUP foil"]),
    ex("ex-acaymo", "Acaymo", 3, ["Parawing", "SUP foil"]),
    ex("ex-yeray", "Yeray", 2, ["Wing foil"]),
    ex("ex-dacil", "Dácil", 2, ["SUP foil"]),
    ex("ex-airam", "Airam", 3, ["Parawing"]),
    ex("ex-idaira", "Idaira", 2, ["Parawing", "Wing foil"]),
    ex("ex-echedey", "Echedey", 1, ["Wing foil"]),
    ex("ex-jonas", "Jonas", 3, ["Parawing"]),
    ex("ex-guaci", "Guacimara", 2, ["Wing foil"]),
  ];
  const run = (id, date, time, startId, endId, level, modes, max, status, wind, meet, logistics, notes) => ({
    id, date, time, startId, endId, level, modes, max, status, wind, meet, logistics, notes, km: null, createdBy: "ex-org", example: true,
  });
  const runs = [
    run("burrero-pozo", sat, "10:30", "burrero", "pozo", 2, [...MODES], 10, "confirmed", { dir: "NE", min: 22, max: 28 },
      "Aparcamiento de la playa de Pozo Izquierdo (llegada)",
      "Dejamos coches en Pozo y subimos juntos al Burrero. Al terminar, cada coche está ya en la llegada.",
      "Nos reagrupamos frente a Arinaga antes de seguir hasta Pozo. Si alguien se queda atrás, el grupo espera."),
    run("vargas-arinaga", sun, "11:00", "vargas", "arinaga", 1, [...MODES], 8, "pending", { dir: "NE", min: 18, max: 22 },
      "Paseo marítimo de Arinaga, junto al muelle (llegada)",
      "Coches en Arinaga y subimos a Vargas en dos furgos.",
      "Run corto con paradas para reagruparnos. Buena opción si es tu primer downwind con el grupo."),
    run("melenara-pozo", wed, "15:30", "melenara", "pozo", 3, ["SUP foil", "Parawing"], 6, "pending", { dir: "NNE", min: 25, max: 32 },
      "Aparcamiento de la playa de Pozo Izquierdo (llegada)",
      "Hace falta un coche por cada tres riders para subir a Melenara. Salimos de Pozo a las 15:45 como tarde.",
      "Run largo. Llevad agua y el móvil cargado en funda estanca. Si el parte baja de 20 nudos lo acortamos."),
    run("pozo-feliz", addDays(sat, 7), "10:00", "pozo", "feliz", 2, ["Parawing", "Wing foil"], 12, "pending", { dir: "NE", min: 20, max: 26 },
      "Aparcamiento de Bahía Feliz (llegada)",
      "Coches en Bahía Feliz y subimos juntos a Pozo.",
      "Se decide el jueves con el parte. Avisamos por aquí."),
  ];
  const su = (runId, userId, mode, seats, ago) => ({ runId, userId, mode, seats, at: now - ago * H });
  const signups = [
    su("burrero-pozo", "ex-nayra", "SUP foil", 3, 40),
    su("burrero-pozo", "ex-acaymo", "Parawing", 2, 38),
    su("burrero-pozo", "ex-yeray", "Wing foil", -1, 30),
    su("burrero-pozo", "ex-dacil", "SUP foil", -1, 26),
    su("burrero-pozo", "ex-idaira", "Parawing", -1, 20),
    su("burrero-pozo", "ex-jonas", "Parawing", -1, 9),
    su("vargas-arinaga", "ex-echedey", "Wing foil", -1, 22),
    su("vargas-arinaga", "ex-guaci", "Wing foil", 3, 18),
    su("vargas-arinaga", "ex-dacil", "SUP foil", -1, 6),
    su("melenara-pozo", "ex-airam", "Parawing", 2, 50),
    su("melenara-pozo", "ex-nayra", "SUP foil", -1, 47),
    su("melenara-pozo", "ex-acaymo", "SUP foil", 2, 44),
    su("melenara-pozo", "ex-jonas", "Parawing", -1, 31),
    su("melenara-pozo", "ex-idaira", "Parawing", -1, 12),
    su("melenara-pozo", "ex-yeray", "Parawing", -1, 5),
    su("melenara-pozo", "ex-dacil", "SUP foil", -1, 2),
    su("pozo-feliz", "ex-guaci", "Wing foil", 2, 15),
    su("pozo-feliz", "ex-airam", "Parawing", -1, 3),
  ];
  const msg = (runId, userId, text, ago) => ({ id: uid(), runId, userId, kind: "text", text, at: now - ago * H });
  const messages = [
    msg("burrero-pozo", "ex-org", "Parte confirmado para el sábado: NE de 22 a 28 nudos. Quedamos a las 10:30 en el aparcamiento de Pozo.", 28),
    msg("burrero-pozo", "ex-nayra", "Llevo la furgo con 3 plazas y sitio para tablas.", 27),
    msg("burrero-pozo", "ex-yeray", "¿Alguien sale desde Las Palmas? Comparto gasolina.", 21),
    msg("burrero-pozo", "ex-acaymo", "Yo paso por Telde, te recojo de camino. Te escribo el viernes.", 20),
    msg("burrero-pozo", "ex-jonas", "First run with the group, see you Saturday!", 8),
    msg("vargas-arinaga", "ex-org", "Pendiente del parte del sábado por la tarde. Si entra flojo, lo pasamos al domingo siguiente.", 17),
    msg("vargas-arinaga", "ex-echedey", "Es mi primer downwind. ¿Paramos a mitad de camino?", 10),
    msg("vargas-arinaga", "ex-org", "Sí, paramos dos veces y nadie se queda solo.", 9),
    msg("melenara-pozo", "ex-org", "Run completo. Si te apuntas ahora entras en lista de espera y te avisamos si queda un hueco.", 4),
  ];
  return { v: 1, users, runs, signups, messages, session: null };
}

export function createDemoStore() {
  const listeners = new Set();
  let db;

  const read = () => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };
  const persist = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch {
      /* sin almacenamiento: la demo sigue en memoria hasta cerrar la pestaña */
    }
  };
  const commit = () => {
    persist();
    listeners.forEach((fn) => fn());
  };

  // Los runs de ejemplo se mueven a la semana que toca para que la demo nunca salga vacía
  const rollExamples = () => {
    const today = todayISO();
    for (const r of db.runs) {
      if (!r.example) continue;
      while (r.date < today) r.date = addDays(r.date, 7);
    }
  };

  db = read();
  if (!db || db.v !== 1) db = seed();
  rollExamples();
  persist();

  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    const next = read();
    if (next) {
      db = next;
      listeners.forEach((fn) => fn());
    }
  });

  const me = () => db.users.find((u) => u.id === db.session) || null;
  const needMe = () => {
    const u = me();
    if (!u) throw fail("Entra con tu cuenta para continuar.");
    return u;
  };
  const needOrganizer = () => {
    const u = needMe();
    if (u.role !== "organizer") throw fail("Solo los organizadores pueden cambiar un run.");
    return u;
  };
  const upcoming = () => {
    const today = todayISO();
    return db.runs.filter((r) => r.date >= today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  };
  const signupsOf = (runId) => db.signups.filter((s) => s.runId === runId).sort((a, b) => a.at - b.at);
  const note = (runId, userId, kind) => db.messages.push({ id: uid(), runId, userId, kind, text: "", at: Date.now() });

  return {
    demo: true,
    ready: Promise.resolve(),

    get me() {
      return me();
    },
    get runs() {
      return upcoming();
    },
    /** Lo que ve alguien sin cuenta en la pantalla de entrada */
    get teaser() {
      return upcoming().filter((r) => r.status !== "cancelled").slice(0, 3);
    },
    run: (id) => db.runs.find((r) => r.id === id) || null,
    user: (id) => db.users.find((u) => u.id === id) || null,
    signups: signupsOf,
    messages: (runId) => db.messages.filter((m) => m.runId === runId).sort((a, b) => a.at - b.at),
    /** Teléfono de otro rider, solo si lo ha activado y quien mira comparte run con él o es organizador */
    contact(runId, userId) {
      const viewer = me();
      const u = db.users.find((x) => x.id === userId);
      if (!viewer || !u || u.id === viewer.id || !u.showPhone || !u.phone) return "";
      const shares = db.signups.some((s) => s.runId === runId && s.userId === viewer.id);
      return shares || viewer.role === "organizer" ? u.phone : "";
    },
    onChange(fn) {
      listeners.add(fn);
    },
    /** Con Supabase carga el chat del run; en la demo ya está todo en memoria */
    async loadRun() {},
    chatReady: () => true,

    async register({ phone, password, name, level, modes }) {
      if (db.users.some((u) => u.phone === phone)) {
        throw fail("Ya hay una cuenta con este teléfono. Entra con tu contraseña.", "phone");
      }
      const salt = uid();
      const user = {
        id: uid(), phone, name, level, modes, role: "rider", showPhone: false,
        salt, pass: await hashPassword(password, salt), createdAt: Date.now(),
      };
      db.users.push(user);
      db.session = user.id;
      commit();
      return user;
    },

    async login({ phone, password }) {
      const user = db.users.find((u) => u.phone === phone && u.pass);
      // Mismo mensaje exista o no la cuenta, para no revelar qué teléfonos están registrados
      const wrong = fail("El teléfono o la contraseña no coinciden. Revísalos y vuelve a intentarlo.");
      if (!user) throw wrong;
      if ((await hashPassword(password, user.salt)) !== user.pass) throw wrong;
      db.session = user.id;
      commit();
      return user;
    },

    async demoLogin() {
      let user = db.users.find((u) => u.id === "demo-rider");
      if (!user) {
        user = {
          id: "demo-rider", phone: "+34600000000", name: "Rider de prueba", level: 2, modes: ["SUP foil", "Parawing"],
          role: "organizer", showPhone: false, createdAt: Date.now(),
        };
        db.users.push(user);
      }
      db.session = user.id;
      commit();
      return user;
    },

    async logout() {
      db.session = null;
      commit();
    },

    async updateProfile(patch) {
      const u = needMe();
      for (const k of ["name", "level", "modes", "showPhone", "role"]) if (k in patch) u[k] = patch[k];
      commit();
    },

    async saveRun(input) {
      const u = needOrganizer();
      let run = input.id ? db.runs.find((r) => r.id === input.id) : null;
      if (!run) {
        run = { id: uid(), createdBy: u.id, km: null };
        db.runs.push(run);
      }
      Object.assign(run, {
        date: input.date, time: input.time, startId: input.startId, endId: input.endId, level: input.level,
        modes: input.modes, max: input.max, status: input.status, wind: input.wind, meet: input.meet,
        km: input.km || null, logistics: input.logistics, notes: input.notes,
      });
      commit();
      return run;
    },

    async setStatus(runId, status) {
      needOrganizer();
      const run = db.runs.find((r) => r.id === runId);
      if (!run || run.status === status) return;
      run.status = status;
      note(runId, null, `status-${status}`);
      commit();
    },

    async deleteRun(runId) {
      needOrganizer();
      db.runs = db.runs.filter((r) => r.id !== runId);
      db.signups = db.signups.filter((s) => s.runId !== runId);
      db.messages = db.messages.filter((m) => m.runId !== runId);
      commit();
    },

    async join(runId, { mode, seats }) {
      const u = needMe();
      const run = db.runs.find((r) => r.id === runId);
      if (!run) throw fail("Este run ya no existe.");
      if (run.status === "cancelled") throw fail("Este run está cancelado.");
      const mine = db.signups.find((s) => s.runId === runId && s.userId === u.id);
      if (mine) {
        mine.mode = mode;
        mine.seats = seats;
      } else {
        db.signups.push({ runId, userId: u.id, mode, seats, at: Date.now() });
        note(runId, u.id, "join");
      }
      commit();
    },

    async leave(runId) {
      const u = needMe();
      const before = db.signups.length;
      db.signups = db.signups.filter((s) => !(s.runId === runId && s.userId === u.id));
      if (db.signups.length !== before) note(runId, u.id, "leave");
      commit();
    },

    async send(runId, text) {
      const u = needMe();
      const clean = String(text).trim().slice(0, 600);
      if (!clean) return;
      db.messages.push({ id: uid(), runId, userId: u.id, kind: "text", text: clean, at: Date.now() });
      commit();
    },

    async resetDemo() {
      db = seed();
      commit();
    },
  };
}
