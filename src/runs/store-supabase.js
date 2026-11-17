// Datos de la webapp conectados a Supabase: cuentas (Auth), tablas con reglas por fila y cambios en tiempo real.
// Tiene la misma interfaz que store-demo.js: lecturas síncronas sobre una copia local y cambios asíncronos.
// El esquema de la base de datos está en supabase/schema.sql.

import { emailToPhone, fail, phoneToEmail, todayISO } from "./util.js";

const WRONG_LOGIN = "El teléfono o la contraseña no coinciden. Revísalos y vuelve a intentarlo.";
const OFFLINE = "No hemos podido conectar con el servidor. Comprueba tu conexión y vuelve a intentarlo.";
const PROFILE_COLS = "id,name,level,modes,role,show_phone";
const MESSAGE_COLS = "id,run_id,user_id,kind,body,created_at";

// Filas de la base de datos <-> objetos que usan las pantallas
const toProfile = (r) => ({ id: r.id, name: r.name, level: r.level, modes: r.modes, role: r.role, showPhone: r.show_phone });
const toRun = (r) => ({
  id: r.id, date: r.day, time: r.meet_time, startId: r.start_id, endId: r.end_id, level: r.level, modes: r.modes,
  max: r.capacity, status: r.status, wind: { dir: r.wind_dir, min: r.wind_min, max: r.wind_max },
  meet: r.meet, logistics: r.logistics, notes: r.notes, km: r.km === null || r.km === undefined ? null : Number(r.km),
  createdBy: r.created_by,
});
const toSignup = (r) => ({ runId: r.run_id, userId: r.user_id, mode: r.mode, seats: r.seats, at: Date.parse(r.created_at) });
const toMessage = (r) => ({ id: r.id, runId: r.run_id, userId: r.user_id, kind: r.kind, text: r.body, at: Date.parse(r.created_at) });
const runColumns = (i) => ({
  day: i.date, meet_time: i.time, start_id: i.startId, end_id: i.endId, level: i.level, modes: i.modes, capacity: i.max,
  status: i.status, wind_dir: i.wind.dir, wind_min: i.wind.min, wind_max: i.wind.max, meet: i.meet,
  logistics: i.logistics, notes: i.notes, km: i.km || null,
});

const isNetwork = (error) => /failed to fetch|networkerror|load failed|fetch failed/i.test(error?.message || "");

/** Convierte un error de Supabase en un mensaje que entienda un rider. El original queda en la consola. */
function problem(error, fallback = "No se ha podido guardar. Inténtalo de nuevo.") {
  console.error("[runs]", error);
  if (isNetwork(error)) return fail(OFFLINE);
  // 42501: lo impide una regla de la base de datos · PGRST116: la regla no dejó tocar ninguna fila
  if (error?.code === "42501" || error?.code === "PGRST116") return fail("No tienes permiso para hacer esto.");
  return fail(fallback);
}

function unwrap({ data, error }, fallback) {
  if (error) throw problem(error, fallback);
  return data;
}

/** `sb` es un cliente de Supabase ya creado. Separado de createSupabaseStore para poder probarlo. */
export function makeSupabaseStore(sb) {
  const listeners = new Set();
  const emit = () => listeners.forEach((fn) => fn());

  let me = null;
  let busy = false; // hay un registro o una entrada en curso en esta pestaña
  let channel = null;
  let teaser = [];
  let signups = [];
  const profiles = new Map();
  const runs = new Map();
  const messages = new Map(); // id del run -> mensajes, solo de los chats abiertos
  const contacts = new Map(); // id del run -> Map(id del rider -> teléfono)

  const needMe = () => {
    if (!me) throw fail("Entra con tu cuenta para continuar.");
    return me;
  };

  function clear() {
    me = null;
    signups = [];
    profiles.clear();
    runs.clear();
    messages.clear();
    contacts.clear();
    if (channel) {
      sb.removeChannel(channel);
      channel = null;
    }
  }

  async function ensureProfiles(ids) {
    const missing = [...new Set(ids)].filter((id) => id && !profiles.has(id));
    if (!missing.length) return;
    const { data } = await sb.from("profiles").select(PROFILE_COLS).in("id", missing);
    (data || []).forEach((r) => profiles.set(r.id, toProfile(r)));
  }

  async function loadTeaser() {
    const { data } = await sb.from("runs_teaser").select("*");
    teaser = (data || []).map((r) => ({
      id: r.id, date: r.day, startId: r.start_id, endId: r.end_id, level: r.level, modes: r.modes,
      km: r.km === null || r.km === undefined ? null : Number(r.km),
    }));
  }

  async function loadRunsAndSignups() {
    const rows = unwrap(
      await sb.from("runs").select("*").gte("day", todayISO()).order("day", { ascending: true }).order("meet_time", { ascending: true }),
      OFFLINE,
    );
    runs.clear();
    rows.forEach((r) => runs.set(r.id, toRun(r)));
    const ids = rows.map((r) => r.id);
    const su = ids.length
      ? unwrap(await sb.from("signups").select("run_id,user_id,mode,seats,created_at").in("run_id", ids), OFFLINE)
      : [];
    signups = su.map(toSignup);
    await ensureProfiles(signups.map((s) => s.userId));
  }

  async function loadMessages(runId) {
    const rows = unwrap(
      await sb.from("messages").select(MESSAGE_COLS).eq("run_id", runId).order("created_at", { ascending: true }).limit(500),
      OFFLINE,
    );
    messages.set(runId, rows.map(toMessage));
    await ensureProfiles(rows.map((r) => r.user_id));
  }

  async function loadContacts(runId) {
    const { data } = await sb.rpc("run_contacts", { p_run: runId });
    contacts.set(runId, new Map((data || []).map((c) => [c.user_id, c.phone])));
  }

  // Carga todo lo que necesita un rider recién entrado y empieza a escuchar cambios
  async function enter(user) {
    const rows = unwrap(await sb.from("profiles").select(PROFILE_COLS), OFFLINE);
    profiles.clear();
    rows.forEach((r) => profiles.set(r.id, toProfile(r)));
    const mine = profiles.get(user.id);
    if (!mine) {
      await sb.auth.signOut();
      throw fail("Esta cuenta no tiene ficha de rider. Crea una cuenta nueva con tu teléfono.");
    }
    me = { ...mine, phone: emailToPhone(user.email) };
    await loadRunsAndSignups();
    subscribe();
  }

  function subscribe() {
    if (channel) return;
    channel = sb
      .channel("runs-app")
      .on("postgres_changes", { event: "*", schema: "public", table: "runs" }, (p) => {
        if (p.eventType === "DELETE") {
          runs.delete(p.old.id);
          signups = signups.filter((s) => s.runId !== p.old.id);
          messages.delete(p.old.id);
        } else if (p.new.day >= todayISO()) {
          runs.set(p.new.id, toRun(p.new));
        }
        emit();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "signups" }, async (p) => {
        if (p.eventType === "DELETE") {
          signups = signups.filter((s) => !(s.runId === p.old.run_id && s.userId === p.old.user_id));
        } else {
          const s = toSignup(p.new);
          signups = signups.filter((x) => !(x.runId === s.runId && x.userId === s.userId));
          signups.push(s);
          await ensureProfiles([s.userId]);
        }
        emit();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, async (p) => {
        const m = toMessage(p.new);
        const list = messages.get(m.runId);
        if (!list || list.some((x) => x.id === m.id)) return;
        list.push(m);
        await ensureProfiles([m.userId]);
        emit();
      })
      .subscribe();
  }

  const ready = (async () => {
    const { data, error } = await sb.auth.getSession();
    if (error) throw problem(error, OFFLINE);
    if (data.session) await enter(data.session.user);
    else await loadTeaser();

    // Sesión abierta o cerrada desde otra pestaña. Se atiende fuera del aviso para no bloquear al cliente de Supabase.
    sb.auth.onAuthStateChange((event, session) => {
      setTimeout(async () => {
        try {
          if (event === "SIGNED_OUT" && me) {
            clear();
            await loadTeaser();
            emit();
          } else if (event === "SIGNED_IN" && !me && !busy && session) {
            await enter(session.user);
            emit();
          }
        } catch (err) {
          console.error("[runs]", err);
        }
      }, 0);
    });
  })();

  return {
    demo: false,
    ready,

    get me() {
      return me;
    },
    get runs() {
      const today = todayISO();
      return [...runs.values()]
        .filter((r) => r.date >= today)
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    },
    get teaser() {
      return me ? this.runs.filter((r) => r.status !== "cancelled").slice(0, 3) : teaser;
    },
    run: (id) => runs.get(id) || null,
    user: (id) => profiles.get(id) || null,
    signups: (runId) => signups.filter((s) => s.runId === runId).sort((a, b) => a.at - b.at),
    messages: (runId) => [...(messages.get(runId) || [])].sort((a, b) => a.at - b.at || a.id - b.id),
    contact: (runId, userId) => contacts.get(runId)?.get(userId) || "",
    /** El chat de un run se pide al abrirlo; hasta entonces no hay mensajes que enseñar */
    chatReady: (runId) => messages.has(runId),
    onChange(fn) {
      listeners.add(fn);
    },

    /** Chat y teléfonos compartidos de un run. Se llama al abrirlo y después de apuntarse o borrarse. */
    async loadRun(runId) {
      if (!me || !runs.has(runId)) return;
      await Promise.all([loadMessages(runId), loadContacts(runId)]);
      emit();
    },

    /** Vuelve a pedir runs y apuntados. Por si el tiempo real se cortó con el móvil bloqueado. */
    async refresh() {
      if (!me) return;
      await loadRunsAndSignups();
      emit();
    },

    async register({ phone, password, name, level, modes }) {
      busy = true;
      try {
        const { data, error } = await sb.auth.signUp({
          email: phoneToEmail(phone),
          password,
          options: { data: { name, level, modes } },
        });
        if (error) {
          console.error("[runs]", error);
          if (error.code === "user_already_exists" || /already registered/i.test(error.message)) {
            throw fail("Ya hay una cuenta con este teléfono. Entra con tu contraseña.", "phone");
          }
          if (error.code === "weak_password") throw fail("Esa contraseña no vale. Usa al menos 8 caracteres.", "password");
          if (error.status === 429) throw fail("Demasiados intentos seguidos. Espera un minuto y vuelve a probar.");
          throw fail(isNetwork(error) ? OFFLINE : "No hemos podido crear tu cuenta. Inténtalo de nuevo en un momento.");
        }
        if (!data.session) {
          // Pasa si en Supabase sigue activada la confirmación por email (ver README) o si el teléfono ya tenía cuenta
          console.warn("[runs] signUp no ha devuelto sesión: revisa que 'Confirm email' esté desactivado en Supabase.");
          throw fail("No hemos podido abrir tu sesión. Si ya tenías cuenta, entra con tu contraseña.");
        }
        await enter(data.user);
        emit();
        return me;
      } finally {
        busy = false;
      }
    },

    async login({ phone, password }) {
      busy = true;
      try {
        const { data, error } = await sb.auth.signInWithPassword({ email: phoneToEmail(phone), password });
        if (error) {
          if (isNetwork(error)) throw fail(OFFLINE);
          if (error.status === 429) throw fail("Demasiados intentos seguidos. Espera un minuto y vuelve a probar.");
          throw fail(WRONG_LOGIN);
        }
        await enter(data.user);
        emit();
        return me;
      } finally {
        busy = false;
      }
    },

    async logout() {
      const { error } = await sb.auth.signOut();
      if (error && isNetwork(error)) throw fail(OFFLINE);
      clear();
      await loadTeaser();
      emit();
    },

    async updateProfile(patch) {
      const u = needMe();
      const row = unwrap(
        await sb
          .from("profiles")
          .update({ name: patch.name, level: patch.level, modes: patch.modes, show_phone: patch.showPhone })
          .eq("id", u.id)
          .select(PROFILE_COLS)
          .single(),
      );
      const next = toProfile(row);
      profiles.set(next.id, next);
      me = { ...next, phone: u.phone };
      emit();
    },

    async saveRun(input) {
      needMe();
      const cols = runColumns(input);
      const query = input.id ? sb.from("runs").update(cols).eq("id", input.id) : sb.from("runs").insert(cols);
      const run = toRun(unwrap(await query.select().single()));
      runs.set(run.id, run);
      if (messages.has(run.id)) await loadMessages(run.id);
      emit();
      return run;
    },

    async setStatus(runId, status) {
      needMe();
      const run = toRun(unwrap(await sb.from("runs").update({ status }).eq("id", runId).select().single()));
      runs.set(run.id, run);
      if (messages.has(runId)) await loadMessages(runId);
      emit();
    },

    async deleteRun(runId) {
      needMe();
      unwrap(await sb.from("runs").delete().eq("id", runId).select("id").single());
      runs.delete(runId);
      signups = signups.filter((s) => s.runId !== runId);
      messages.delete(runId);
      contacts.delete(runId);
      emit();
    },

    async join(runId, { mode, seats }) {
      const u = needMe();
      const mine = signups.find((s) => s.runId === runId && s.userId === u.id);
      const query = mine
        ? sb.from("signups").update({ mode, seats }).eq("run_id", runId).eq("user_id", u.id)
        : sb.from("signups").insert({ run_id: runId, mode, seats });
      const { data, error } = await query.select().single();
      if (error) {
        // 23505: ya estaba apuntado desde otro dispositivo
        if (error.code !== "23505") throw problem(error, "No hemos podido apuntarte. Puede que el run se haya cancelado.");
        await loadRunsAndSignups();
      } else {
        const s = toSignup(data);
        signups = signups.filter((x) => !(x.runId === runId && x.userId === u.id));
        signups.push(s);
      }
      // El aviso "se ha apuntado" y los teléfonos compartidos cambian al entrar en el run
      await Promise.all([loadMessages(runId), loadContacts(runId)]);
      emit();
    },

    async leave(runId) {
      const u = needMe();
      unwrap(await sb.from("signups").delete().eq("run_id", runId).eq("user_id", u.id));
      signups = signups.filter((s) => !(s.runId === runId && s.userId === u.id));
      await Promise.all([loadMessages(runId), loadContacts(runId)]);
      emit();
    },

    async send(runId, text) {
      needMe();
      const clean = String(text).trim().slice(0, 600);
      if (!clean) return;
      const row = unwrap(
        await sb.from("messages").insert({ run_id: runId, body: clean }).select(MESSAGE_COLS).single(),
        "No se ha podido enviar el mensaje. Inténtalo de nuevo.",
      );
      const list = messages.get(runId) || [];
      if (!list.some((m) => m.id === row.id)) list.push(toMessage(row));
      messages.set(runId, list);
      emit();
    },
  };
}

/** Crea la conexión con Supabase. La librería se descarga solo cuando la web está configurada (ver src/config.ts). */
export async function createSupabaseStore({ url, key }) {
  const { createClient } = await import("@supabase/supabase-js");
  return makeSupabaseStore(createClient(url, key));
}
