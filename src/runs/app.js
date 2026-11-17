// Pantallas de la webapp de runs: entrar o crear cuenta, listado de runs, ficha del run (ruta, apuntarse,
// quién va, chat) y herramientas de organizador.
//
// Todo se pinta dentro de un shadow root para que los estilos de la web y los de la app no se mezclen.
// Los datos llegan siempre por `store` (store-demo.js o store-supabase.js): lecturas síncronas y cambios asíncronos.

import css from "./runs.css?raw";
import { icons } from "../icons";
import { SPOTS, kmLabel, routeMap, spotName } from "./geo.js";
import {
  MODES, PREFIXES, asDate, chatTime, esc, fmtDate, longDate, nextDow, normalizePhone, plural, prettyPhone, todayISO,
} from "./util.js";

// Iconos de trazo propios para lo que src/icons.ts todavía no trae (viewBox 0 0 24 24)
const STROKES = {
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  send: '<path d="M20.5 3.5L10 14M20.5 3.5l-6.5 17-4-6.5-6.5-4z"/>',
  logout: '<path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14M10 8l-4 4 4 4M6 12h9"/>',
  pencil: '<path d="M4 20l1-4.5L16.5 4 20 7.5 8.5 19zM14 6.5L17.5 10"/>',
  trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5M10 10.5v6M14 10.5v6"/>',
  lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
};

function icon(name, cls = "") {
  const c = `icon ${cls}`.trim();
  if (icons[name]) {
    return `<svg class="${c}" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">${icons[name]}</svg>`;
  }
  return `<svg class="${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${STROKES[name] || ""}</svg>`;
}

// Nivel del rider: las mismas tres opciones que el formulario de la portada
const RIDER_LEVELS = {
  1: { long: "Estoy aprendiendo a despegar", short: "Aprendiendo a despegar" },
  2: { long: "Despego y navego con choppy", short: "Despega con choppy" },
  3: { long: "Hago downwind con soltura", short: "Downwind con soltura" },
};

// Dificultad del run
const RUN_LEVELS = {
  1: { name: "Iniciación", text: "Run corto y con paradas. Vale si ya despegas, aunque todavía te cueste con choppy." },
  2: { name: "Intermedio", text: "Tienes que despegar sin ayuda con choppy y aguantar una sesión larga en el agua." },
  3: { name: "Avanzado", text: "Run largo o con mar formado. Solo si haces downwind con soltura y sabes volver a costa por tu cuenta." },
};

const STATUS = {
  confirmed: { label: "Confirmado", cls: "pill--ok", icon: "check" },
  pending: { label: "Pendiente de parte", cls: "pill--pending", icon: "wind" },
  cancelled: { label: "Cancelado", cls: "pill--cancelled", icon: "warning" },
};

const WIND_DIRS = ["N", "NNE", "NE", "ENE", "E"];

function initials(name) {
  const parts = String(name || "?").trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

function tone(id) {
  let h = 0;
  for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % 4;
}

const avatar = (u, cls = "") =>
  `<span class="avatar ${cls}" data-tone="${tone(u.id)}" aria-hidden="true">${esc(initials(u.name))}</span>`;

const firstName = (u) => String(u.name).split(" ")[0];

/**
 * Monta la app dentro de `host`.
 * @param {HTMLElement} host
 * @param {{ store: object, links: { privacy: string, whatsapp: string, logo: string } }} options
 */
export function mountRunsApp(host, { store, links }) {
  const root = host.shadowRoot || host.attachShadow({ mode: "open" });
  root.innerHTML = `<style>${css}</style>
    <div class="app" id="app"><div class="wrap"><p class="loading" role="status">Cargando los runs…</p></div></div>
    <dialog id="dlg"></dialog>
    <div class="toasts" id="toasts" role="status" aria-live="polite"></div>`;

  const $ = (sel, from = root) => from.querySelector(sel);
  const app = $("#app");
  const dlg = $("#dlg");
  const toasts = $("#toasts");

  const state = {
    hash: "",
    authTab: "login",
    filter: "all",
    editJoin: false,
    pendingHash: "",
  };

  function toast(text, ico = "check") {
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `${icon(ico)}<span>${esc(text)}</span>`;
    toasts.append(el);
    setTimeout(() => el.remove(), 4200);
  }

  function parseHash(h) {
    const name = String(h || "").replace(/^#/, "");
    if (name.startsWith("run-")) return { view: "run", id: name.slice(4) };
    return { view: "runs" };
  }

  function toTop() {
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function navigate(hash) {
    state.hash = hash;
    state.editJoin = false;
    try {
      if (location.hash !== hash) location.hash = hash;
    } catch {
      /* si no se puede tocar la dirección, se navega igual dentro de la página */
    }
    render();
    toTop();
  }

  // ---------- Piezas compartidas ----------

  const demoNote = () =>
    store.demo
      ? `<p class="demo-note" role="note"><b>Modo demo</b><span>Riders y runs de ejemplo. Lo que hagas se guarda solo en este navegador.</span></p>`
      : "";

  function bar(left) {
    const me = store.me;
    return `<div class="bar">
      ${left}
      <button type="button" class="user-chip" data-action="profile" aria-label="Tu perfil, ${esc(me.name)}">
        ${avatar(me)}<span class="name">${esc(firstName(me))}</span>
      </button>
    </div>`;
  }

  const statusPill = (run) => {
    const s = STATUS[run.status] || STATUS.pending;
    return `<span class="pill ${s.cls}">${icon(s.icon)}${s.label}</span>`;
  };

  function levelMeter(level, prefix = "Nivel") {
    const lv = RUN_LEVELS[level] || RUN_LEVELS[2];
    const bumps = [0, 1, 2]
      .map((i) => `<path class="${i < level ? "on" : ""}" d="M${i * 15 + 1} 15 Q${i * 15 + 7.5} -9 ${i * 15 + 14} 15 Z"/>`)
      .join("");
    return `<span class="level"><svg viewBox="0 0 45 16" aria-hidden="true">${bumps}</svg><span>${prefix ? `${prefix} ` : ""}${lv.name.toLowerCase()}</span></span>`;
  }

  const modePills = (modes) =>
    modes.map((m) => `<span class="pill pill--mode-${MODES.indexOf(m)}">${esc(m)}</span>`).join("");

  const windLabel = (w) => (w ? `${w.dir} ${w.min}–${w.max}` : "Por confirmar");

  const routeTitle = (run) =>
    `${esc(spotName(run.startId))} <span class="arrow" aria-hidden="true">→</span><span class="sr-only"> a </span> ${esc(spotName(run.endId))}`;

  function dateBlock(run, extra = "") {
    return `<div class="date-block ${extra}">
      <span class="dow">${esc(fmtDate(run.date, { weekday: "short" }).replace(".", ""))}</span>
      <span class="day">${asDate(run.date).getUTCDate()}</span>
      <span class="mon">${esc(fmtDate(run.date, { month: "short" }).replace(".", ""))}</span>
    </div>`;
  }

  // Plazas: los primeros en apuntarse entran; el resto queda en lista de espera por orden de llegada
  function occupancy(run) {
    const all = store.signups(run.id);
    const inside = all.slice(0, run.max);
    const waiting = all.slice(run.max);
    const me = store.me;
    const mineIdx = me ? all.findIndex((s) => s.userId === me.id) : -1;
    return {
      all, inside, waiting,
      left: Math.max(0, run.max - inside.length),
      mine: mineIdx >= 0 ? all[mineIdx] : null,
      mineWaiting: mineIdx >= run.max,
      waitPos: mineIdx >= run.max ? mineIdx - run.max + 1 : 0,
    };
  }

  function underline() {
    return `<svg class="scribble" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
      <path d="M4 15 C 52 7, 118 5, 178 9 S 268 15, 296 8" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
      <path d="M22 20 C 96 13, 190 14, 284 17" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
  }

  // ---------- Entrada: entrar o crear cuenta ----------

  const prefixOptions = (sel = "+34") =>
    PREFIXES.map(([p, c]) => `<option value="${p}" ${p === sel ? "selected" : ""} aria-label="${c} ${p}">${p}</option>`).join("");

  function phoneFields(idp) {
    return `<div>
      <label class="label" for="${idp}-phone">Teléfono</label>
      <div class="phone-field">
        <select class="field" id="${idp}-prefix" name="prefix" aria-label="Prefijo del país">${prefixOptions()}</select>
        <input class="field" id="${idp}-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="612 345 678" aria-describedby="${idp}-phone-error" required>
      </div>
      <p class="error" id="${idp}-phone-error" data-error-for="phone" hidden></p>
    </div>`;
  }

  function passField(idp, autocomplete, hint = "") {
    return `<div>
      <label class="label" for="${idp}-pass">Contraseña</label>
      <div class="pass-field">
        <input class="field" id="${idp}-pass" name="password" type="password" autocomplete="${autocomplete}" aria-describedby="${idp}-pass-error" required>
        <button type="button" class="pass-toggle" data-action="toggle-pass" aria-pressed="false">Ver</button>
      </div>
      ${hint ? `<p class="hint">${hint}</p>` : ""}
      <p class="error" id="${idp}-pass-error" data-error-for="password" hidden></p>
    </div>`;
  }

  function authForm() {
    if (state.authTab === "login") {
      const group = links.whatsapp
        ? `<a href="${esc(links.whatsapp)}" target="_blank" rel="noopener">grupo de WhatsApp</a>`
        : "grupo de WhatsApp";
      return `<form class="form" id="login-form" novalidate>
        ${phoneFields("li")}
        ${passField("li", "current-password")}
        <div class="form-alert" data-form-alert hidden></div>
        <button class="btn btn--primary btn--big btn--block" type="submit"><span>Entrar</span>${icon("arrowRight")}</button>
        <p class="hint"><button type="button" class="link" data-action="forgot">¿Has olvidado la contraseña?</button></p>
        <p class="notice" id="forgot-note" hidden>${icon("whatsapp")}<span>Escribe a un organizador por el ${group} y te la restablece. No enviamos SMS.</span></p>
      </form>`;
    }
    return `<form class="form" id="register-form" novalidate>
      <div>
        <label class="label" for="rg-name">Nombre</label>
        <input class="field" id="rg-name" name="name" type="text" autocomplete="given-name" placeholder="Nayra" maxlength="40" aria-describedby="rg-name-error" required>
        <p class="error" id="rg-name-error" data-error-for="name" hidden></p>
      </div>
      ${phoneFields("rg")}
      ${passField("rg", "new-password", "Mínimo 8 caracteres.")}
      <fieldset>
        <legend class="label">Qué modalidad haces</legend>
        <div class="chips">
          ${MODES.map((m) => `<label class="chip"><input type="checkbox" name="modes" value="${m}"><span>${m}</span></label>`).join("")}
        </div>
        <p class="error" data-error-for="modes" hidden></p>
      </fieldset>
      <div>
        <label class="label" for="rg-level">Tu nivel</label>
        <select class="field" id="rg-level" name="level" aria-describedby="rg-level-error" required>
          <option value="" disabled selected>Elige una opción</option>
          ${[1, 2, 3].map((n) => `<option value="${n}">${RIDER_LEVELS[n].long}</option>`).join("")}
        </select>
        <p class="error" id="rg-level-error" data-error-for="level" hidden></p>
      </div>
      <div>
        <label class="check"><input type="checkbox" name="consent" id="rg-consent"><span>He leído la <a href="${esc(links.privacy)}" target="_blank" rel="noopener">política de privacidad</a> y acepto que los organizadores usen mi teléfono para coordinar los runs.</span></label>
        <p class="error" data-error-for="consent" hidden></p>
      </div>
      <div class="form-alert" data-form-alert hidden></div>
      <button class="btn btn--primary btn--big btn--block" type="submit"><span>Crear cuenta</span>${icon("arrowRight")}</button>
    </form>`;
  }

  function renderAuth() {
    const runs = store.teaser;
    app.innerHTML = `<div class="wrap">
      ${demoNote()}
      <section class="auth" aria-labelledby="auth-title">
        <div class="auth-copy">
          <div class="auth-intro">
            <p class="tag" style="transform: rotate(-2deg)">${icon("mapPin")}<span>Gran Canaria · Runs abiertos</span></p>
            <h1 id="auth-title" class="display">Apúntate al<br>próximo run.<br><span class="accent">Nunca solo.${underline()}</span></h1>
          </div>
          <div class="auth-more">
          <p class="lead">Entra con tu teléfono y verás los downwinds planificados, con su ruta, su nivel y el punto de encuentro. Te apuntas, ves quién va y cuadras coches por el chat del run.</p>
          <ul class="perks">
            <li>${icon("check")}<span>Gratis y sin cuotas</span></li>
            <li>${icon("check")}<span>Ruta, nivel y quedada de cada run</span></li>
            <li>${icon("check")}<span>Ves quién va y hablas con el grupo</span></li>
          </ul>
          ${links.logo ? `<img class="auth-logo" src="${esc(links.logo)}" width="960" height="1004" alt="Logo de Alisios DW: un pez con cresta volando sobre un foil, dentro de una explosión azul y amarilla">` : ""}
          </div>
        </div>
        <div class="auth-side" id="auth-box">
          <div class="halftone" aria-hidden="true"></div>
          <div class="card auth-card">
            <span class="sticker sticker--blue" aria-hidden="true">Join the crew</span>
            <div class="tabs" role="tablist" aria-label="Entrar o crear cuenta">
              <button type="button" class="tab" role="tab" data-action="auth-tab" data-tab="login" aria-selected="${state.authTab === "login"}">Ya tengo cuenta</button>
              <button type="button" class="tab" role="tab" data-action="auth-tab" data-tab="register" aria-selected="${state.authTab === "register"}">Crear cuenta</button>
            </div>
            ${authForm()}
            ${
              store.demo
                ? `<div class="auth-foot">
                    <p><strong>Estás en la demo.</strong> Las cuentas que crees aquí se guardan solo en este navegador.</p>
                    <button type="button" class="btn btn--secondary btn--block" data-action="demo-login">Entrar con una cuenta de prueba</button>
                  </div>`
                : ""
            }
          </div>
        </div>
      </section>
      ${
        runs.length
          ? `<section class="teaser" aria-labelledby="teaser-title">
              <div class="teaser-head">
                <h2 id="teaser-title" class="display">Lo que viene</h2>
                <p class="pill">${icon("lock")}Entra para ver quién va y apuntarte</p>
              </div>
              <ul class="teaser-list">
                ${runs
                  .map(
                    (r, i) => `<li class="teaser-item">
                      ${dateBlock(r, i === 1 ? "is-blue" : "")}
                      <div>
                        <h3 class="display">${routeTitle(r)}</h3>
                        <p>${levelMeter(r.level)}</p>
                        <p>${esc(r.modes.join(" · "))} · ${kmLabel(r)}</p>
                      </div>
                    </li>`,
                  )
                  .join("")}
              </ul>
            </section>`
          : ""
      }
    </div>`;
  }

  function setErrors(form, errors) {
    form.querySelectorAll("[data-error-for]").forEach((p) => {
      const msg = errors[p.dataset.errorFor];
      p.hidden = !msg;
      p.textContent = msg || "";
    });
    form.querySelectorAll("[name]").forEach((el) => {
      if (el.type === "checkbox" || el.type === "radio") return;
      if (errors[el.name]) el.setAttribute("aria-invalid", "true");
      else el.removeAttribute("aria-invalid");
    });
    const alert = form.querySelector("[data-form-alert]");
    if (alert) {
      alert.hidden = !errors._form;
      alert.innerHTML = errors._form ? `${icon("warning", "icon--lg")}<span>${esc(errors._form)}</span>` : "";
    }
    const first = Object.keys(errors).find((k) => k !== "_form");
    if (first) form.querySelector(`[name="${first}"]`)?.focus();
    return Object.keys(errors).length === 0;
  }

  // Bloquea el botón mientras se guarda y, si algo falla, lo enseña en el formulario
  async function withBusy(form, fn) {
    const btn = form.querySelector('[type="submit"]');
    if (btn) btn.disabled = true;
    try {
      await fn();
    } catch (err) {
      const errors = err.field
        ? { [err.field]: err.message }
        : { _form: err.message || "No se ha podido completar. Inténtalo de nuevo." };
      if (form.isConnected) setErrors(form, errors);
      else toast(errors._form || err.message, "warning");
    } finally {
      if (btn?.isConnected) btn.disabled = false;
    }
  }

  function afterLogin(user, isNew) {
    const target = state.pendingHash || "#runs";
    state.pendingHash = "";
    navigate(target);
    toast(isNew ? `Bienvenido, ${firstName(user)}. Ya puedes apuntarte a un run.` : `Hola de nuevo, ${firstName(user)}.`);
  }

  async function onLogin(form) {
    const f = new FormData(form);
    const errors = {};
    const phone = normalizePhone(f.get("prefix"), f.get("phone"));
    if (phone.error) errors.phone = phone.error;
    if (!f.get("password")) errors.password = "Escribe tu contraseña.";
    if (!setErrors(form, errors)) return;
    await withBusy(form, async () => {
      const user = await store.login({ phone: phone.value, password: f.get("password") });
      afterLogin(user, false);
    });
  }

  async function onRegister(form) {
    const f = new FormData(form);
    const errors = {};
    const name = String(f.get("name") || "").trim();
    const phone = normalizePhone(f.get("prefix"), f.get("phone"));
    const password = String(f.get("password") || "");
    const modes = f.getAll("modes");
    const level = Number(f.get("level"));
    if (name.length < 2) errors.name = "Escribe tu nombre, como te conocen en el agua.";
    if (phone.error) errors.phone = phone.error;
    if (password.length < 8) errors.password = "La contraseña necesita al menos 8 caracteres.";
    if (!modes.length) errors.modes = "Marca al menos una modalidad.";
    if (!level) errors.level = "Elige tu nivel para saber qué runs te encajan.";
    if (!f.get("consent")) errors.consent = "Necesitamos tu permiso para guardar tu teléfono.";
    if (!setErrors(form, errors)) return;
    await withBusy(form, async () => {
      const user = await store.register({ phone: phone.value, password, name, level, modes });
      state.authTab = "login";
      afterLogin(user, true);
    });
  }

  // ---------- Listado de runs ----------

  function myNextRun() {
    const me = store.me;
    return store.runs.find((r) => r.status !== "cancelled" && store.signups(r.id).some((s) => s.userId === me.id)) || null;
  }

  function runCard(run) {
    const occ = occupancy(run);
    const cancelled = run.status === "cancelled";
    const shown = occ.inside.slice(0, 4).map((s) => store.user(s.userId)).filter(Boolean);
    const extra = occ.inside.length - shown.length;
    let cta = `<span class="btn btn--small">${occ.left ? "Ver y apuntarme" : "Ver lista de espera"}${icon("arrowRight")}</span>`;
    if (cancelled) cta = `<span class="btn btn--ghost">Ver detalles</span>`;
    else if (occ.mine) {
      cta = occ.mineWaiting
        ? `<span class="in-badge is-wait">${icon("clock")}En espera, puesto ${occ.waitPos}</span>`
        : `<span class="in-badge">${icon("check")}Estás dentro</span>`;
    }
    const spotsText = occ.inside.length
      ? `${occ.inside.length} de ${run.max} plazas<small>${occ.left ? `Quedan ${occ.left}` : occ.waiting.length ? `Completo · ${occ.waiting.length} en espera` : "Completo"}</small>`
      : `${run.max} plazas libres<small>Sé el primero</small>`;
    return `<li class="card run-card ${cancelled ? "is-cancelled" : ""}">
      <div class="run-main has-thumb">
        ${dateBlock(run)}
        <div class="run-body">
          <h3 class="display"><a href="#run-${esc(run.id)}">${routeTitle(run)}</a></h3>
          <div class="pills">${statusPill(run)}${levelMeter(run.level)}</div>
          <div class="meta">
            <span>${icon("clock")}Quedada ${esc(run.time)}</span>
            <span>${icon("path")}${kmLabel(run)}</span>
            <span>${icon("wind")}${esc(windLabel(run.wind))} nudos</span>
          </div>
          <div class="pills">${modePills(run.modes)}</div>
        </div>
        <div class="route-map thumb">${routeMap(run, { thumb: true })}</div>
      </div>
      <div class="run-foot">
        <div class="spots">
          ${shown.length ? `<span class="avatar-stack">${shown.map((u) => avatar(u)).join("")}${extra > 0 ? `<span class="avatar more">+${extra}</span>` : ""}</span>` : ""}
          <span>${spotsText}</span>
        </div>
        ${cta}
      </div>
    </li>`;
  }

  function runsListHTML() {
    const me = store.me;
    let runs = store.runs;
    if (state.filter === "mine") runs = runs.filter((r) => store.signups(r.id).some((s) => s.userId === me.id));
    else if (state.filter !== "all") runs = runs.filter((r) => r.modes.includes(state.filter));
    if (!runs.length) {
      const all = store.runs.length;
      return `<li class="empty" style="grid-column: 1 / -1">
        <h3 class="display">${state.filter === "mine" ? "Todavía no te has apuntado a ninguno" : all ? "Ningún run con ese filtro" : "No hay runs planificados"}</h3>
        <p>${
          state.filter === "mine"
            ? "Elige un run de la lista y apúntate. Aparecerá aquí con su chat."
            : all
              ? "Prueba con otra modalidad o mira todos los runs."
              : "Cuando el parte confirme viento, los organizadores publicarán aquí el siguiente run."
        }</p>
        ${state.filter !== "all" ? `<button type="button" class="btn btn--secondary" data-action="filter-all">Ver todos los runs</button>` : ""}
      </li>`;
    }
    return runs.map(runCard).join("");
  }

  function runsBarHTML() {
    const active = store.runs.filter((r) => r.status !== "cancelled").length;
    return bar(
      `<p class="tag" style="transform: rotate(-2deg)">${icon("calendar")}<span>${plural(active, "run planificado", "runs planificados")}</span></p>`,
    );
  }

  function runsHeadHTML() {
    const me = store.me;
    const next = myNextRun();
    return `<div>
        <h1 class="display">Próximos runs</h1>
        <p class="lead">Hola, ${esc(firstName(me))}. Elige tu run, mira la ruta y el nivel y apúntate. Los coches se cuadran en el chat de cada uno.</p>
      </div>
      ${
        next
          ? `<a class="next-up" href="#run-${esc(next.id)}">
              <span class="eyebrow" style="color: inherit">Tu próximo run</span>
              <strong>${esc(spotName(next.startId))} → ${esc(spotName(next.endId))}</strong>
              <span>${esc(longDate(next.date))} · quedada a las ${esc(next.time)}</span>
            </a>`
          : ""
      }`;
  }

  function renderRuns() {
    const me = store.me;
    const filters = [["all", "Todos"], ...MODES.map((m) => [m, m]), ["mine", "Mis runs"]];
    app.innerHTML = `<div class="wrap">
      ${demoNote()}
      <div id="runs-bar">${runsBarHTML()}</div>
      <header class="page-head" id="runs-head">${runsHeadHTML()}</header>
      <div class="toolbar">
        <div class="chips" role="group" aria-label="Filtrar runs">
          ${filters
            .map(([v, label]) => `<label class="chip"><input type="radio" name="filter" value="${v}" ${state.filter === v ? "checked" : ""}><span>${label}</span></label>`)
            .join("")}
        </div>
        ${me.role === "organizer" ? `<button type="button" class="btn btn--primary" data-action="new-run">${icon("plus")}<span>Nuevo run</span></button>` : ""}
      </div>
      <ul class="runs" id="runs-list">${runsListHTML()}</ul>
    </div>`;
  }

  // ---------- Ficha del run ----------

  const seatsLabel = (seats) =>
    seats < 0 ? "Sin coche" : seats === 0 ? "Lleva coche, sin plazas libres" : `Lleva coche con ${plural(seats, "plaza libre", "plazas libres")}`;

  function joinHTML(run) {
    const me = store.me;
    const occ = occupancy(run);
    if (run.status === "cancelled") {
      return `<h2 class="display">Run cancelado</h2>
        <p>Este run no sale. Mira el chat por si los organizadores proponen otra fecha.</p>
        <a class="btn btn--onsun" href="#runs" style="margin-top: 1rem">Ver otros runs</a>`;
    }
    const pct = Math.min(100, Math.round((occ.inside.length / run.max) * 100));
    const capacity = `<div class="capacity">
        <div class="capacity-bar" role="img" aria-label="${occ.inside.length} de ${run.max} plazas ocupadas"><i style="width: ${pct}%"></i></div>
        <p><span>${occ.inside.length} de ${run.max} plazas</span><span>${occ.left ? `Quedan ${occ.left}` : occ.waiting.length ? `${occ.waiting.length} en espera` : "Completo"}</span></p>
      </div>`;

    if (occ.mine && !state.editJoin) {
      return `<h2 class="display">${occ.mineWaiting ? "En lista de espera" : "Estás dentro"}</h2>
        ${capacity}
        <div class="you-in">
          <strong>${icon(occ.mineWaiting ? "clock" : "check", "icon--lg")}${occ.mineWaiting ? `Puesto ${occ.waitPos} en la lista` : esc(occ.mine.mode)}</strong>
          <p>${occ.mineWaiting ? `Vas con ${esc(occ.mine.mode)}. Si alguien se borra, entras por orden de llegada. ` : ""}${esc(seatsLabel(occ.mine.seats).replace("Lleva", "Llevas"))}.</p>
          <div class="row">
            <button type="button" class="btn btn--ghost" data-action="edit-join">${icon("pencil")}Cambiar</button>
            <button type="button" class="btn btn--danger" data-action="leave">Borrarme del run</button>
          </div>
        </div>
        <p class="smallprint">Quedada a las ${esc(run.time)} en ${esc(run.meet || "el punto que confirmen los organizadores")}.</p>`;
    }

    const allowed = run.modes;
    const pre = occ.mine?.mode || me.modes.find((m) => allowed.includes(m)) || allowed[0];
    const seats = occ.mine ? occ.mine.seats : -1;
    const lowLevel = me.level < run.level;
    const noMode = !me.modes.some((m) => allowed.includes(m));
    const full = !occ.mine && occ.left === 0;
    return `<h2 class="display">${occ.mine ? "Cambia tu plaza" : full ? "Run completo" : "Apúntate"}</h2>
      ${capacity}
      <form class="form" id="join-form" novalidate>
        <fieldset>
          <legend class="label">Con qué vas</legend>
          <div class="chips">
            ${allowed.map((m) => `<label class="chip"><input type="radio" name="mode" value="${esc(m)}" ${m === pre ? "checked" : ""}><span>${esc(m)}</span></label>`).join("")}
          </div>
        </fieldset>
        <div>
          <label class="label" for="join-seats">¿Llevas coche?</label>
          <select class="field" id="join-seats" name="seats">
            <option value="-1" ${seats === -1 ? "selected" : ""}>No, necesito sitio en un coche</option>
            <option value="0" ${seats === 0 ? "selected" : ""}>Sí, pero sin plazas libres</option>
            ${[1, 2, 3, 4, 5, 6].map((n) => `<option value="${n}" ${seats === n ? "selected" : ""}>Sí, con ${plural(n, "plaza libre", "plazas libres")}</option>`).join("")}
          </select>
        </div>
        ${
          lowLevel
            ? `<p class="notice">${icon("warning")}<span>Este run pide nivel ${RUN_LEVELS[run.level].name.toLowerCase()} y tú has marcado «${esc(RIDER_LEVELS[me.level].long)}». Háblalo con los organizadores en el chat antes de apuntarte.</span></p>`
            : ""
        }
        ${noMode ? `<p class="notice">${icon("warning")}<span>Este run es para ${esc(allowed.join(" y "))}, que no tienes marcado en tu perfil.</span></p>` : ""}
        <div class="form-alert" data-form-alert hidden></div>
        <div class="dialog-actions" style="justify-content: stretch">
          <button class="btn btn--onsun btn--big" type="submit" style="flex: 1">${occ.mine ? "Guardar cambios" : full ? "Entrar en lista de espera" : "Apuntarme al run"}</button>
          ${occ.mine ? `<button type="button" class="btn btn--ghost" data-action="cancel-edit-join">Cancelar</button>` : ""}
        </div>
      </form>
      <p class="smallprint">Gratis y sin cuotas. En los runs abiertos cada rider sale bajo su propia responsabilidad y decide según su nivel y el estado del mar.</p>`;
  }

  function riderRow(run, s) {
    const u = store.user(s.userId);
    if (!u) return "";
    const isMe = u.id === store.me.id;
    const phone = isMe ? "" : store.contact(run.id, u.id);
    return `<li class="rider">
      ${avatar(u)}
      <div class="who">
        <b><span>${esc(u.name)}</span>${isMe ? '<i class="you-tag" style="font-style: normal">Tú</i>' : ""}</b>
        <small>${esc(s.mode)} · ${esc(RIDER_LEVELS[u.level]?.short || "")}</small>
      </div>
      <div class="side">
        ${s.seats >= 0 ? `<span class="pill" title="${esc(seatsLabel(s.seats))}">${icon("car")}${s.seats > 0 ? `+${s.seats}` : "Coche"}</span>` : ""}
        ${phone ? `<a class="wa" href="https://wa.me/${esc(phone.replace(/\D/g, ""))}" target="_blank" rel="noopener" aria-label="Escribir a ${esc(u.name)} por WhatsApp">${icon("whatsapp")}</a>` : ""}
      </div>
    </li>`;
  }

  function whoHTML(run) {
    const occ = occupancy(run);
    let cars = "";
    if (occ.inside.length) {
      const withCar = occ.inside.filter((s) => s.seats >= 0);
      const room = withCar.reduce((n, s) => n + 1 + s.seats, 0);
      const short = occ.inside.length - room;
      cars =
        short > 0
          ? `<p class="cars is-short">${icon("car", "icon--lg")}<span>${withCar.length ? `Faltan ${plural(short, "plaza", "plazas")} de coche: sois ${occ.inside.length} y hay sitio para ${room}.` : "Todavía nadie lleva coche. Hace falta al menos uno para subir a la salida."}</span></p>`
          : `<p class="cars">${icon("car", "icon--lg")}<span>${plural(withCar.length, "coche", "coches")} con sitio para ${room}. Cabéis los ${occ.inside.length}.</span></p>`;
    }
    return `<div class="panel-head">
        <h2 class="display">Quién va</h2>
        <span>${occ.inside.length} de ${run.max}</span>
      </div>
      ${cars}
      ${
        occ.inside.length
          ? `<ul class="riders">${occ.inside.map((s) => riderRow(run, s)).join("")}</ul>`
          : `<p class="muted" style="margin-top: 0.75rem">Todavía no se ha apuntado nadie. Estrena tú la lista.</p>`
      }
      ${
        occ.waiting.length
          ? `<p class="wait-title">Lista de espera · ${occ.waiting.length}</p>
             <ul class="riders">${occ.waiting.map((s) => riderRow(run, s)).join("")}</ul>`
          : ""
      }`;
  }

  function messageHTML(m) {
    const me = store.me;
    if (m.kind !== "text") {
      const u = m.userId ? store.user(m.userId) : null;
      const who = u ? (u.id === me.id ? "Te has" : `${u.name} se ha`) : "Alguien se ha";
      const text =
        m.kind === "join" ? `${who} apuntado`
        : m.kind === "leave" ? `${who} borrado del run`
        : m.kind === "status-confirmed" ? "Run confirmado por los organizadores"
        : m.kind === "status-cancelled" ? "Run cancelado por los organizadores"
        : "El run vuelve a estar pendiente de parte";
      return `<p class="sys">${esc(text)} · ${esc(chatTime(m.at))}</p>`;
    }
    const u = (m.userId && store.user(m.userId)) || { id: "?", name: "Rider", role: "rider" };
    const mine = u.id === me.id;
    return `<div class="msg ${mine ? "is-me" : ""} ${!mine && u.role === "organizer" ? "is-org" : ""}">
      <span class="by">${mine ? "Tú" : esc(u.name)}${!mine && u.role === "organizer" ? " · organiza" : ""} · ${esc(chatTime(m.at))}</span>
      <p class="bubble">${esc(m.text)}</p>
    </div>`;
  }

  function chatLogHTML(run) {
    if (!store.chatReady(run.id)) return `<p class="chat-empty">Cargando el chat…</p>`;
    const list = store.messages(run.id);
    if (!list.length) return `<p class="chat-empty">Nadie ha escrito todavía. Pregunta lo que necesites o di si llevas coche.</p>`;
    return list.map(messageHTML).join("");
  }

  const chatCount = (run) => plural(store.messages(run.id).filter((m) => m.kind === "text").length, "mensaje", "mensajes");

  function gearText(run) {
    const wings = run.modes.filter((m) => m !== "SUP foil");
    return `Tu tabla y tu foil, chaleco o impact vest, leash y el móvil en una funda estanca. Recomendamos casco.${wings.length ? ` Para ${wings.join(" y ").toLowerCase()}, tu ala.` : ""}`;
  }

  const headPillsHTML = (run) => `${statusPill(run)}${levelMeter(run.level)}${modePills(run.modes)}`;

  function statsHTML(run) {
    const occ = occupancy(run);
    return `<div class="stat"><dt>Distancia</dt><dd>${kmLabel(run)}</dd></div>
      <div class="stat"><dt>Viento previsto</dt><dd>${esc(windLabel(run.wind))} <small>nudos</small></dd></div>
      <div class="stat"><dt>Nivel</dt><dd>${(RUN_LEVELS[run.level] || RUN_LEVELS[2]).name}</dd></div>
      <div class="stat"><dt>Plazas</dt><dd>${occ.inside.length} / ${run.max}</dd></div>`;
  }

  function orgToolsHTML(run) {
    return `<p class="eyebrow">Herramientas de organizador</p>
      <div class="org-tools">
        <button type="button" class="btn btn--secondary" data-action="edit-run">${icon("pencil")}Editar run</button>
        ${run.status !== "confirmed" ? `<button type="button" class="btn btn--secondary" data-action="status" data-status="confirmed">${icon("check")}Confirmar</button>` : ""}
        ${run.status === "confirmed" ? `<button type="button" class="btn btn--secondary" data-action="status" data-status="pending">${icon("wind")}Volver a pendiente</button>` : ""}
        ${run.status !== "cancelled" ? `<button type="button" class="btn btn--danger" data-action="cancel-run">Cancelar run</button>` : ""}
        <button type="button" class="btn btn--danger" data-action="delete-run">${icon("trash")}Eliminar</button>
      </div>`;
  }

  const backLink = () => `<a class="back" href="#runs">${icon("arrowLeft")}Todos los runs</a>`;

  function renderRun(id) {
    const run = store.run(id);
    if (!run) {
      app.innerHTML = `<div class="wrap">
        ${demoNote()}
        ${bar(backLink())}
        <div class="empty">
          <h3 class="display">Este run ya no está</h3>
          <p>Puede que se haya eliminado, que ya haya pasado o que el enlace esté mal escrito.</p>
          <a class="btn btn--secondary" href="#runs">Ver los próximos runs</a>
        </div>
      </div>`;
      return;
    }
    const me = store.me;
    app.innerHTML = `<div class="wrap" data-run="${esc(run.id)}">
      ${demoNote()}
      ${bar(backLink())}
      <header class="detail-head">
        <div class="pills" id="head-pills">${headPillsHTML(run)}</div>
        <h1 class="display">${routeTitle(run)}</h1>
        <p class="when"><b>${esc(longDate(run.date))}</b> · quedada a las ${esc(run.time)}</p>
      </header>
      <div class="detail">
        <div class="col col--main">
          <section class="card panel p-route" aria-labelledby="route-title">
            <h2 id="route-title" class="display">La ruta</h2>
            <div class="route-grid">
              <div>
                <div class="route-map">${routeMap(run)}</div>
                <p class="map-note">Esquema orientativo de la costa este. No vale para navegar.</p>
              </div>
              <div>
                <div class="route-ends">
                  <div class="route-end"><i class="dot"></i><div><strong>${esc(spotName(run.startId))}</strong><span>Salida</span></div></div>
                  <div class="route-end"><i class="dot"></i><div><strong>${esc(spotName(run.endId))}</strong><span>Llegada</span></div></div>
                </div>
                <dl class="stats" id="stats">${statsHTML(run)}</dl>
                <p class="hint">${esc((RUN_LEVELS[run.level] || RUN_LEVELS[2]).text)}</p>
              </div>
            </div>
          </section>
          <section class="card panel p-plan" aria-labelledby="plan-title">
            <h2 id="plan-title" class="display">El plan</h2>
            <ul class="plan">
              <li><span class="ico">${icon("clock", "icon--lg")}</span><div><strong>Quedada</strong><p>${esc(run.time)} · ${esc(run.meet || "Punto por confirmar")}</p></div></li>
              <li><span class="ico">${icon("car", "icon--lg")}</span><div><strong>Coches</strong><p>${esc(run.logistics || "Se cuadra en el chat del run.")}</p></div></li>
              <li><span class="ico">${icon("lifebuoy", "icon--lg")}</span><div><strong>Material</strong><p>${esc(gearText(run))}</p></div></li>
              ${run.notes ? `<li><span class="ico">${icon("bell", "icon--lg")}</span><div><strong>Nota de los organizadores</strong><p>${esc(run.notes)}</p></div></li>` : ""}
            </ul>
          </section>
          <section class="card panel chat p-chat" aria-labelledby="chat-title">
            <div class="panel-head">
              <h2 id="chat-title" class="display">Chat del run</h2>
              <span id="chat-count">${chatCount(run)}</span>
            </div>
            <div class="chat-log" id="chat-log" role="log" aria-label="Mensajes del run" tabindex="0">${chatLogHTML(run)}</div>
            <form class="chat-form" id="chat-form">
              <label class="sr-only" for="chat-input">Escribe un mensaje</label>
              <input class="field" id="chat-input" name="text" type="text" maxlength="600" autocomplete="off" placeholder="Escribe al grupo…">
              <button class="btn btn--primary" type="submit" aria-label="Enviar mensaje">${icon("send")}<span class="sr-only">Enviar</span></button>
            </form>
          </section>
          ${me.role === "organizer" ? `<section class="panel p-org" id="p-org" style="border: 2px dashed var(--ink); border-radius: 1rem">${orgToolsHTML(run)}</section>` : ""}
        </div>
        <div class="col col--side">
          <section class="card panel join p-join" id="p-join" aria-live="polite">${joinHTML(run)}</section>
          <section class="card panel p-who" id="p-who">${whoHTML(run)}</section>
        </div>
      </div>
    </div>`;
    const log = $("#chat-log");
    log.scrollTop = log.scrollHeight;
  }

  // Cuando cambian los datos estando en un run, se actualizan las piezas sin tocar lo que el rider está escribiendo
  function refreshRun(id) {
    const run = store.run(id);
    const shell = $("[data-run]");
    if (!run || !shell || shell.dataset.run !== id) return renderRun(id);
    $("#head-pills").innerHTML = headPillsHTML(run);
    $("#stats").innerHTML = statsHTML(run);
    const join = $("#p-join");
    if (!join.contains(root.activeElement) || !$("#join-form")) join.innerHTML = joinHTML(run);
    $("#p-who").innerHTML = whoHTML(run);
    const org = $("#p-org");
    if (org) org.innerHTML = orgToolsHTML(run);
    const log = $("#chat-log");
    const atBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 48;
    log.innerHTML = chatLogHTML(run);
    if (atBottom) log.scrollTop = log.scrollHeight;
    $("#chat-count").textContent = chatCount(run);
  }

  // ---------- Diálogos ----------

  function openDialog(title, body, { narrow = false } = {}) {
    dlg.classList.toggle("is-narrow", narrow);
    dlg.innerHTML = `<div class="dialog-head">
        <h2 class="display" id="dlg-title">${esc(title)}</h2>
        <button type="button" class="close" data-action="close-dialog" aria-label="Cerrar">${icon("x", "icon--lg")}</button>
      </div>
      <div class="dialog-body">${body}</div>`;
    dlg.setAttribute("aria-labelledby", "dlg-title");
    if (!dlg.open) dlg.showModal();
  }

  const closeDialog = () => dlg.open && dlg.close();

  function confirmDialog({ title, text, confirm, danger = false }) {
    return new Promise((resolve) => {
      openDialog(
        title,
        `<p>${esc(text)}</p>
        <div class="dialog-actions" style="margin-top: 1.25rem">
          <button type="button" class="btn btn--ghost" data-confirm="no">Mejor no</button>
          <button type="button" class="btn ${danger ? "btn--danger" : "btn--primary"}" data-confirm="yes">${esc(confirm)}</button>
        </div>`,
        { narrow: true },
      );
      const done = (value) => {
        dlg.removeEventListener("click", onClick);
        dlg.removeEventListener("close", onClose);
        closeDialog();
        resolve(value);
      };
      const onClick = (e) => {
        const b = e.target.closest("[data-confirm]");
        if (b) done(b.dataset.confirm === "yes");
      };
      const onClose = () => done(false);
      dlg.addEventListener("click", onClick);
      dlg.addEventListener("close", onClose);
    });
  }

  function profileDialog() {
    const me = store.me;
    openDialog(
      "Tu perfil",
      `<div class="profile-top">
        ${avatar(me)}
        <div><strong>${esc(me.name)}</strong><p>${esc(prettyPhone(me.phone))}</p></div>
      </div>
      <form class="form" id="profile-form" novalidate>
        <div>
          <label class="label" for="pf-name">Nombre</label>
          <input class="field" id="pf-name" name="name" type="text" maxlength="40" value="${esc(me.name)}" required>
          <p class="error" data-error-for="name" hidden></p>
        </div>
        <fieldset>
          <legend class="label">Qué modalidad haces</legend>
          <div class="chips">
            ${MODES.map((m) => `<label class="chip"><input type="checkbox" name="modes" value="${m}" ${me.modes.includes(m) ? "checked" : ""}><span>${m}</span></label>`).join("")}
          </div>
          <p class="error" data-error-for="modes" hidden></p>
        </fieldset>
        <div>
          <label class="label" for="pf-level">Tu nivel</label>
          <select class="field" id="pf-level" name="level">
            ${[1, 2, 3].map((n) => `<option value="${n}" ${me.level === n ? "selected" : ""}>${RIDER_LEVELS[n].long}</option>`).join("")}
          </select>
        </div>
        <label class="check"><input type="checkbox" name="showPhone" ${me.showPhone ? "checked" : ""}><span>Mostrar mi WhatsApp a los riders que compartan run conmigo, para cuadrar coches.</span></label>
        ${
          store.demo
            ? `<div class="demo-box">
                <p class="eyebrow">Solo en la demo</p>
                <label class="check"><input type="checkbox" name="organizer" ${me.role === "organizer" ? "checked" : ""}><span>Verlo como organizador: crear, confirmar y cancelar runs.</span></label>
                <p class="hint"><button type="button" class="link" data-action="reset-demo">Borrar mis datos y volver a los runs de ejemplo</button></p>
              </div>`
            : ""
        }
        <div class="form-alert" data-form-alert hidden></div>
        <div class="dialog-actions">
          <button type="button" class="btn btn--ghost" data-action="logout">${icon("logout")}Cerrar sesión</button>
          <button type="submit" class="btn btn--primary">Guardar</button>
        </div>
      </form>`,
    );
  }

  function runDialog(run) {
    const r = run || {
      date: nextDow(6), time: "10:30", startId: "burrero", endId: "pozo", level: 2, modes: [...MODES], max: 10, status: "pending",
      wind: { dir: "NE", min: 20, max: 26 }, meet: "", logistics: "", notes: "", km: null,
    };
    const spotOptions = (sel) => SPOTS.map((s) => `<option value="${s.id}" ${s.id === sel ? "selected" : ""}>${esc(s.name)}</option>`).join("");
    openDialog(
      run ? "Editar run" : "Nuevo run",
      `<form class="form" id="run-form" novalidate data-id="${esc(run?.id || "")}">
        <div class="form-row form-row--2">
          <div>
            <label class="label" for="rf-date">Día</label>
            <input class="field" id="rf-date" name="date" type="date" min="${todayISO()}" value="${esc(r.date)}" required>
            <p class="error" data-error-for="date" hidden></p>
          </div>
          <div>
            <label class="label" for="rf-time">Hora de quedada</label>
            <input class="field" id="rf-time" name="time" type="time" value="${esc(r.time)}" required>
            <p class="error" data-error-for="time" hidden></p>
          </div>
        </div>
        <div class="form-row form-row--2">
          <div>
            <label class="label" for="rf-start">Salida</label>
            <select class="field" id="rf-start" name="startId">${spotOptions(r.startId)}</select>
          </div>
          <div>
            <label class="label" for="rf-end">Llegada</label>
            <select class="field" id="rf-end" name="endId">${spotOptions(r.endId)}</select>
            <p class="error" data-error-for="endId" hidden></p>
          </div>
        </div>
        <div class="form-row form-row--2">
          <div>
            <label class="label" for="rf-level">Nivel</label>
            <select class="field" id="rf-level" name="level">
              ${[1, 2, 3].map((n) => `<option value="${n}" ${r.level === n ? "selected" : ""}>${RUN_LEVELS[n].name}</option>`).join("")}
            </select>
          </div>
          <div>
            <label class="label" for="rf-max">Plazas</label>
            <input class="field" id="rf-max" name="max" type="number" inputmode="numeric" min="2" max="40" value="${esc(r.max)}" required>
            <p class="error" data-error-for="max" hidden></p>
          </div>
        </div>
        <fieldset>
          <legend class="label">Modalidades</legend>
          <div class="chips">
            ${MODES.map((m) => `<label class="chip"><input type="checkbox" name="modes" value="${m}" ${r.modes.includes(m) ? "checked" : ""}><span>${m}</span></label>`).join("")}
          </div>
          <p class="error" data-error-for="modes" hidden></p>
        </fieldset>
        <div class="form-row form-row--3">
          <div>
            <label class="label" for="rf-dir">Viento</label>
            <select class="field" id="rf-dir" name="dir">${WIND_DIRS.map((d) => `<option ${r.wind.dir === d ? "selected" : ""}>${d}</option>`).join("")}</select>
          </div>
          <div>
            <label class="label" for="rf-min">Nudos mín.</label>
            <input class="field" id="rf-min" name="min" type="number" inputmode="numeric" min="5" max="60" value="${esc(r.wind.min)}">
          </div>
          <div>
            <label class="label" for="rf-wmax">Nudos máx.</label>
            <input class="field" id="rf-wmax" name="wmax" type="number" inputmode="numeric" min="5" max="60" value="${esc(r.wind.max)}">
            <p class="error" data-error-for="wmax" hidden></p>
          </div>
        </div>
        <div>
          <label class="label" for="rf-km">Distancia en km <span style="text-transform: none; font-weight: 500">(opcional)</span></label>
          <input class="field" id="rf-km" name="km" type="number" inputmode="decimal" min="1" max="80" step="0.1" placeholder="Si la dejas vacía, se calcula aproximada" value="${esc(r.km || "")}">
          <p class="error" data-error-for="km" hidden></p>
        </div>
        <div>
          <label class="label" for="rf-meet">Punto de encuentro</label>
          <input class="field" id="rf-meet" name="meet" type="text" maxlength="120" placeholder="Aparcamiento de la playa de Pozo Izquierdo (llegada)" value="${esc(r.meet)}" required>
          <p class="error" data-error-for="meet" hidden></p>
        </div>
        <div>
          <label class="label" for="rf-log">Coches</label>
          <textarea class="field" id="rf-log" name="logistics" maxlength="300" placeholder="Dejamos coches en la llegada y subimos juntos a la salida.">${esc(r.logistics)}</textarea>
        </div>
        <div>
          <label class="label" for="rf-notes">Nota para los riders</label>
          <textarea class="field" id="rf-notes" name="notes" maxlength="400" placeholder="Dónde reagrupamos, qué pasa si el parte cambia…">${esc(r.notes)}</textarea>
        </div>
        <fieldset>
          <legend class="label">Estado</legend>
          <div class="chips">
            <label class="chip"><input type="radio" name="status" value="pending" ${r.status !== "confirmed" ? "checked" : ""}><span>Pendiente de parte</span></label>
            <label class="chip"><input type="radio" name="status" value="confirmed" ${r.status === "confirmed" ? "checked" : ""}><span>Confirmado</span></label>
          </div>
        </fieldset>
        <div class="form-alert" data-form-alert hidden></div>
        <div class="dialog-actions">
          <button type="button" class="btn btn--ghost" data-action="close-dialog">Cancelar</button>
          <button type="submit" class="btn btn--primary">${run ? "Guardar cambios" : "Publicar run"}</button>
        </div>
      </form>`,
    );
  }

  async function onRunForm(form) {
    const f = new FormData(form);
    const errors = {};
    const date = String(f.get("date") || "");
    const time = String(f.get("time") || "").slice(0, 5);
    const max = Number(f.get("max"));
    const modes = f.getAll("modes");
    const min = Number(f.get("min"));
    const wmax = Number(f.get("wmax"));
    const meet = String(f.get("meet") || "").trim();
    const kmRaw = String(f.get("km") || "").trim();
    const km = kmRaw ? Number(kmRaw.replace(",", ".")) : null;
    if (kmRaw && !(km >= 1 && km <= 80)) errors.km = "Pon una distancia entre 1 y 80 km, o déjala vacía.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.date = "Elige el día del run.";
    else if (date < todayISO()) errors.date = "Ese día ya ha pasado. Elige hoy o una fecha futura.";
    if (!/^\d{2}:\d{2}$/.test(time)) errors.time = "Pon la hora de quedada.";
    if (f.get("startId") === f.get("endId")) errors.endId = "La llegada tiene que ser distinta de la salida.";
    if (!Number.isInteger(max) || max < 2 || max > 40) errors.max = "Pon entre 2 y 40 plazas.";
    if (!modes.length) errors.modes = "Marca al menos una modalidad.";
    if (!(min > 0) || !(wmax >= min)) errors.wmax = "El máximo no puede ser menor que el mínimo.";
    if (meet.length < 3) errors.meet = "Di dónde quedáis, para que nadie se pierda.";
    if (!setErrors(form, errors)) return;
    await withBusy(form, async () => {
      const id = form.dataset.id || undefined;
      const prev = id ? store.run(id) : null;
      const run = await store.saveRun({
        id, date, time, startId: String(f.get("startId")), endId: String(f.get("endId")), level: Number(f.get("level")), modes, max,
        status: prev?.status === "cancelled" ? "cancelled" : String(f.get("status")),
        wind: { dir: String(f.get("dir")), min, max: wmax }, meet, km,
        logistics: String(f.get("logistics") || "").trim(), notes: String(f.get("notes") || "").trim(),
      });
      closeDialog();
      toast(id ? "Run actualizado." : "Run publicado. Ya se puede apuntar la gente.");
      if (!id) navigate(`#run-${run.id}`);
      else render();
    });
  }

  // ---------- Pintado general y eventos ----------

  function render() {
    const me = store.me;
    if (!me) {
      renderAuth();
      return;
    }
    const r = parseHash(state.hash);
    if (r.view === "run") {
      renderRun(r.id);
      // Chat y teléfonos compartidos del run. Al llegar, el aviso de cambio repinta solo esas piezas.
      Promise.resolve(store.loadRun(r.id)).catch((err) => toast(err.message || "No se ha podido cargar el chat.", "warning"));
    } else {
      renderRuns();
    }
  }

  let lastSession = null;

  store.onChange(() => {
    const me = store.me;
    const sessionChanged = (me?.id || null) !== lastSession;
    lastSession = me?.id || null;
    if (sessionChanged || !me) return render();
    const r = parseHash(state.hash);
    if (r.view === "run") return refreshRun(r.id);
    if ($("#runs-list")) {
      $("#runs-bar").innerHTML = runsBarHTML();
      $("#runs-head").innerHTML = runsHeadHTML();
      $("#runs-list").innerHTML = runsListHTML();
    } else {
      render();
    }
  });

  const currentRunId = () => parseHash(state.hash).id;

  const actions = {
    "auth-tab": (el) => {
      state.authTab = el.dataset.tab;
      render();
      $(`#auth-box [name="${state.authTab === "login" ? "phone" : "name"}"]`)?.focus();
    },
    "toggle-pass": (el) => {
      const input = el.parentElement.querySelector("input");
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      el.textContent = show ? "Ocultar" : "Ver";
      el.setAttribute("aria-pressed", String(show));
    },
    forgot: () => {
      $("#forgot-note").hidden = false;
    },
    "demo-login": async () => {
      const user = await store.demoLogin();
      afterLogin(user, false);
    },
    profile: () => profileDialog(),
    "close-dialog": closeDialog,
    logout: async () => {
      closeDialog();
      state.authTab = "login";
      state.hash = "#runs";
      await store.logout();
      toTop();
      toast("Sesión cerrada.");
    },
    "reset-demo": async () => {
      const ok = await confirmDialog({
        title: "Reiniciar la demo",
        text: "Se borran las cuentas, runs y mensajes creados en este navegador y vuelven los de ejemplo.",
        confirm: "Reiniciar",
        danger: true,
      });
      if (!ok) return;
      state.hash = "#runs";
      await store.resetDemo();
      toast("Demo reiniciada.");
    },
    "filter-all": () => {
      state.filter = "all";
      render();
    },
    "new-run": () => runDialog(null),
    "edit-run": () => runDialog(store.run(currentRunId())),
    status: async (el) => {
      await store.setStatus(currentRunId(), el.dataset.status);
      toast(el.dataset.status === "confirmed" ? "Run confirmado. Queda avisado en el chat." : "Run en pendiente de parte.");
    },
    "cancel-run": async () => {
      const ok = await confirmDialog({
        title: "Cancelar el run",
        text: "El run seguirá visible como cancelado y se avisa en el chat. Los apuntados no se borran.",
        confirm: "Cancelar run",
        danger: true,
      });
      if (!ok) return;
      await store.setStatus(currentRunId(), "cancelled");
      toast("Run cancelado.", "warning");
    },
    "delete-run": async () => {
      const ok = await confirmDialog({
        title: "Eliminar el run",
        text: "Se borra el run con sus apuntados y su chat. No se puede deshacer.",
        confirm: "Eliminar",
        danger: true,
      });
      if (!ok) return;
      const id = currentRunId();
      state.hash = "#runs";
      await store.deleteRun(id);
      navigate("#runs");
      toast("Run eliminado.");
    },
    "edit-join": () => {
      state.editJoin = true;
      $("#p-join").innerHTML = joinHTML(store.run(currentRunId()));
    },
    "cancel-edit-join": () => {
      state.editJoin = false;
      $("#p-join").innerHTML = joinHTML(store.run(currentRunId()));
    },
    leave: async () => {
      const ok = await confirmDialog({
        title: "Borrarte del run",
        text: "Tu plaza queda libre para el siguiente de la lista de espera. Puedes volver a apuntarte si queda sitio.",
        confirm: "Borrarme",
        danger: true,
      });
      if (!ok) return;
      await store.leave(currentRunId());
      toast("Te has borrado del run.");
    },
  };

  // Dentro del shadow root los eventos conservan su origen real, así que se escuchan aquí y no en document
  root.addEventListener("click", (e) => {
    const actionEl = e.target.closest("[data-action]");
    if (actionEl) {
      e.preventDefault();
      Promise.resolve(actions[actionEl.dataset.action]?.(actionEl)).catch((err) =>
        toast(err.message || "Algo ha fallado. Inténtalo de nuevo.", "warning"),
      );
      return;
    }
    const link = e.target.closest('a[href^="#"]');
    if (link) {
      e.preventDefault();
      navigate(link.getAttribute("href"));
    }
  });

  // Clic fuera de la ventana: se cierra
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) closeDialog();
  });

  root.addEventListener("change", (e) => {
    if (e.target.name === "filter") {
      state.filter = e.target.value;
      $("#runs-list").innerHTML = runsListHTML();
    }
  });

  root.addEventListener("submit", async (e) => {
    const form = e.target;
    e.preventDefault();
    if (form.id === "login-form") return onLogin(form);
    if (form.id === "register-form") return onRegister(form);
    if (form.id === "run-form") return onRunForm(form);

    if (form.id === "join-form") {
      const f = new FormData(form);
      const runId = currentRunId();
      const wasIn = store.signups(runId).some((s) => s.userId === store.me.id);
      await withBusy(form, async () => {
        await store.join(runId, { mode: String(f.get("mode")), seats: Number(f.get("seats")) });
        state.editJoin = false;
        const run = store.run(runId);
        if (!run) return;
        $("#p-join").innerHTML = joinHTML(run);
        const occ = occupancy(run);
        toast(wasIn ? "Cambios guardados." : occ.mineWaiting ? `Estás en lista de espera, puesto ${occ.waitPos}.` : "Estás dentro. Nos vemos en la quedada.");
      });
      return;
    }

    if (form.id === "chat-form") {
      const input = form.elements.text;
      const text = input.value;
      if (!text.trim()) return;
      input.value = "";
      try {
        await store.send(currentRunId(), text);
        const log = $("#chat-log");
        if (log) log.scrollTop = log.scrollHeight;
      } catch (err) {
        input.value = text;
        toast(err.message || "No se ha podido enviar el mensaje.", "warning");
      }
      input.focus();
      return;
    }

    if (form.id === "profile-form") {
      const f = new FormData(form);
      const errors = {};
      const name = String(f.get("name") || "").trim();
      const modes = f.getAll("modes");
      if (name.length < 2) errors.name = "Escribe tu nombre.";
      if (!modes.length) errors.modes = "Marca al menos una modalidad.";
      if (!setErrors(form, errors)) return;
      await withBusy(form, async () => {
        const patch = { name, modes, level: Number(f.get("level")), showPhone: !!f.get("showPhone") };
        if (store.demo) patch.role = f.get("organizer") ? "organizer" : "rider";
        await store.updateProfile(patch);
        closeDialog();
        render();
        toast("Perfil guardado.");
      });
    }
  });

  window.addEventListener("hashchange", () => {
    if (location.hash === state.hash) return;
    state.hash = location.hash || "#runs";
    state.editJoin = false;
    render();
    toTop();
  });

  // Al volver a la pestaña (o desbloquear el móvil) se piden de nuevo los datos, por si se perdió algún aviso
  document.addEventListener("visibilitychange", () => {
    if (document.hidden || !store.me) return;
    Promise.resolve(store.refresh?.())
      .then(() => {
        const r = parseHash(state.hash);
        if (r.view === "run") return store.loadRun(r.id);
      })
      .catch(() => {});
  });

  // ---------- Arranque ----------

  state.hash = location.hash || "#runs";
  store.ready.then(
    () => {
      lastSession = store.me?.id || null;
      if (!store.me && parseHash(state.hash).view === "run") state.pendingHash = state.hash;
      render();
    },
    (err) => {
      app.innerHTML = `<div class="wrap"><div class="empty">
        <h3 class="display">No hemos podido cargar los runs</h3>
        <p>${esc(err?.message || "Comprueba tu conexión y vuelve a intentarlo.")}</p>
        <a class="btn btn--secondary" href="">Volver a intentarlo</a>
      </div></div>`;
    },
  );
}
