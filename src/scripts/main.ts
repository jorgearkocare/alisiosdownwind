// Interacciones de la web: menú, apariciones al hacer scroll, frase palabra a palabra,
// navegación activa y formulario. Sin listeners de scroll: todo con IntersectionObserver.

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Textos del idioma de la página (los escribe Layout.astro desde src/i18n)
type ClientText = Record<
  | "required" | "nameRequired" | "emailRequired" | "emailInvalid" | "levelRequired" | "consentRequired"
  | "review" | "sending" | "submit" | "sendError" | "mailtoTitle" | "mailtoText" | "openMenu" | "closeMenu",
  string
>;
let text = {} as ClientText;
try {
  text = JSON.parse(document.getElementById("i18n-client")?.textContent ?? "{}");
} catch {
  // Sin textos se usan los valores por defecto del HTML
}

/* ---------- Menú móvil (isla flotante) ---------- */
const header = document.querySelector<HTMLElement>("[data-nav]");
const toggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
const menuLinks = document.querySelectorAll<HTMLAnchorElement>("[data-menu-link]");

function setMenu(open: boolean) {
  if (!header || !toggle) return;
  header.dataset.open = String(open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? text.closeMenu : text.openMenu);
  document.documentElement.style.overflow = open ? "hidden" : "";
  if (open) window.setTimeout(() => menuLinks[0]?.focus({ preventScroll: true }), 300);
}

toggle?.addEventListener("click", () => setMenu(header?.dataset.open !== "true"));
menuLinks.forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && header?.dataset.open === "true") {
    setMenu(false);
    toggle?.focus();
  }
});
window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => {
  if (e.matches) setMenu(false);
});

/* ---------- Aparición al entrar en pantalla ---------- */
const revealEls = document.querySelectorAll<HTMLElement>("[data-reveal]");
if (reduceMotion || !("IntersectionObserver" in window)) {
  revealEls.forEach((el) => el.classList.add("is-in"));
} else {
  const revealIO = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealIO.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );
  revealEls.forEach((el) => revealIO.observe(el));
}

/* ---------- Frase grande: palabra a palabra en orden de lectura ---------- */
const words = Array.from(document.querySelectorAll<HTMLElement>("[data-word]"));
if (words.length) {
  if (reduceMotion || !("IntersectionObserver" in window)) {
    words.forEach((w) => w.classList.add("is-lit"));
  } else {
    const order = new Map(words.map((w, i) => [w, i]));
    const wordIO = new IntersectionObserver(
      (entries) => {
        const entering = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement)
          .sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
        entering.forEach((w, i) => {
          w.style.transitionDelay = `${i * 90}ms`;
          w.classList.add("is-lit");
        });
        // Si la palabra vuelve a quedar por debajo de la línea de activación, se apaga
        entries
          .filter((e) => !e.isIntersecting && e.boundingClientRect.top > 0)
          .forEach((e) => {
            const w = e.target as HTMLElement;
            w.style.transitionDelay = "0ms";
            w.classList.remove("is-lit");
          });
      },
      { rootMargin: "0px 0px -35% 0px", threshold: 1 },
    );
    words.forEach((w) => wordIO.observe(w));
  }
}

/* ---------- Navegación activa según la sección visible ---------- */
const spyLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-spy]"));
const spySections = spyLinks
  .map((a) => document.getElementById(a.dataset.spy ?? ""))
  .filter((s): s is HTMLElement => s !== null);
if (spySections.length && "IntersectionObserver" in window) {
  const spyIO = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        spyLinks.forEach((a) => a.setAttribute("aria-current", String(a.dataset.spy === entry.target.id)));
      }
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  spySections.forEach((s) => spyIO.observe(s));
}

/* ---------- Formulario de alta ---------- */
const form = document.querySelector<HTMLFormElement>("[data-join-form]");
if (form) {
  const endpoint = form.dataset.endpoint ?? "";
  const contactEmail = form.dataset.email ?? "";
  const status = form.querySelector<HTMLElement>("[data-status]");
  const submit = form.querySelector<HTMLButtonElement>("[data-submit]");
  const submitLabel = form.querySelector<HTMLElement>("[data-submit-label]");
  const success = document.querySelector<HTMLElement>("[data-join-success]");
  const successText = document.querySelector<HTMLElement>("[data-success-text]");
  const successTitle = document.querySelector<HTMLElement>("[data-success-title]");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const messages: Record<string, (el: HTMLInputElement | HTMLSelectElement) => string> = {
    nombre: (el) => (el.value.trim() ? "" : text.nameRequired),
    email: (el) => {
      const v = el.value.trim();
      if (!v) return text.emailRequired;
      return emailPattern.test(v) ? "" : text.emailInvalid;
    },
    nivel: (el) => (el.value ? "" : text.levelRequired),
    privacidad: (el) => ((el as HTMLInputElement).checked ? "" : text.consentRequired),
  };

  const fieldEl = (name: string) => form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;

  function check(name: string): boolean {
    const el = fieldEl(name);
    const errorEl = form!.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    if (!el) return true;
    const msg = messages[name](el);
    el.setAttribute("aria-invalid", String(Boolean(msg)));
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.toggle("hidden", !msg);
    }
    return !msg;
  }

  // Validación al salir del campo y corrección en vivo una vez marcado el error
  Object.keys(messages).forEach((name) => {
    const el = fieldEl(name);
    el?.addEventListener("blur", () => check(name));
    el?.addEventListener("change", () => check(name));
    el?.addEventListener("input", () => {
      if (el.getAttribute("aria-invalid") === "true") check(name);
    });
  });

  function setLoading(loading: boolean) {
    if (!submit || !submitLabel) return;
    submit.disabled = loading;
    submit.setAttribute("aria-busy", String(loading));
    submitLabel.textContent = loading ? text.sending : text.submit;
  }

  function showSuccess(text?: string, title?: string) {
    if (!success) return;
    if (text && successText) successText.textContent = text;
    if (title && successTitle) successTitle.textContent = title;
    form!.hidden = true;
    success.hidden = false;
    successTitle?.focus();
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (status) status.textContent = "";

    const results = Object.keys(messages).map((name) => [name, check(name)] as const);
    const firstInvalid = results.find(([, ok]) => !ok);
    if (firstInvalid) {
      fieldEl(firstInvalid[0])?.focus();
      if (status) status.textContent = text.review;
      return;
    }

    const data = new FormData(form);
    // Si se desmarca "Cursos" o "Merch", no se envía lo elegido dentro de su desplegable
    const interests = data.getAll("interes");
    if (!interests.includes("cursos")) data.delete("actividad");
    if (!interests.includes("merch")) data.delete("prenda");
    // Trampa para bots: si se rellena el campo oculto, fingimos el envío y no hacemos nada
    if (String(data.get("_gotcha") ?? "")) {
      showSuccess();
      return;
    }

    // Sin endpoint configurado: se abre el correo del usuario con los datos ya escritos
    if (!endpoint) {
      const body = [
        `Nombre: ${data.get("nombre")}`,
        `Email: ${data.get("email")}`,
        `Modalidad: ${data.getAll("modalidad").join(", ") || "Sin indicar"}`,
        `Nivel: ${data.get("nivel")}`,
        `Me interesa: ${data.getAll("interes").join(", ") || "Sin indicar"}`,
        `Actividades: ${data.getAll("actividad").join(", ") || "-"}`,
        `Merch: ${data.getAll("prenda").join(", ") || "-"}`,
        `Idioma: ${data.get("idioma")}`,
      ].join("\n");
      window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent("Quiero unirme a Alisios Downwind")}&body=${encodeURIComponent(body)}`;
      showSuccess(text.mailtoText, text.mailtoTitle);
      return;
    }

    // Con Kit: se envía email y nombre, y cada opción marcada se convierte en una etiqueta del suscriptor
    let body: FormData = data;
    const tagMap = form.dataset.kitTags ? (JSON.parse(form.dataset.kitTags) as Record<string, number>) : null;
    if (tagMap) {
      body = new FormData();
      body.append("email_address", String(data.get("email") ?? "").trim());
      body.append("fields[first_name]", String(data.get("nombre") ?? "").trim());
      const keys = ["comunidad"];
      for (const name of ["nivel", "modalidad", "interes", "actividad", "prenda", "idioma"]) {
        data.getAll(name).forEach((value) => keys.push(`${name}:${value}`));
      }
      keys.forEach((key) => {
        if (tagMap[key]) body.append("tags[]", String(tagMap[key]));
      });
    }

    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(String(res.status));
      if (tagMap) {
        const json = await res.json().catch(() => ({}));
        if (json.status && json.status !== "success") throw new Error(String(json.status));
      }
      showSuccess();
    } catch {
      if (status) {
        status.textContent = `${text.sendError} ${contactEmail}.`;
      }
    } finally {
      setLoading(false);
    }
  });
}

/* ---------- Enlaces que preseleccionan un interés en el formulario ---------- */
document.querySelectorAll<HTMLAnchorElement>("[data-interest]").forEach((link) => {
  link.addEventListener("click", () => {
    const box = document.querySelector<HTMLInputElement>(`input[name="interes"][value="${link.dataset.interest}"]`);
    if (box) box.checked = true;
    // Además marca la actividad concreta dentro del desplegable de cursos
    const activity = document.querySelector<HTMLInputElement>(`input[name="actividad"][value="${link.dataset.activity}"]`);
    if (activity) activity.checked = true;
  });
});

/* ---------- Desplegable de idioma: se cierra al pulsar fuera o con Escape ---------- */
const pickers = document.querySelectorAll<HTMLDetailsElement>("[data-lang-picker]");
document.addEventListener("click", (e) => {
  pickers.forEach((p) => {
    if (p.open && !p.contains(e.target as Node)) p.open = false;
  });
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  pickers.forEach((p) => {
    if (p.open) {
      p.open = false;
      p.querySelector("summary")?.focus();
    }
  });
});

/* ---------- Formularios sencillos (newsletter y "Manda tu run") ---------- */
const simpleEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
document.querySelectorAll<HTMLFormElement>("[data-simple-form]").forEach((form) => {
  const wrap = form.closest<HTMLElement>("[data-simple-wrap]");
  const success = wrap?.querySelector<HTMLElement>("[data-simple-success]");
  const successText = wrap?.querySelector<HTMLElement>("[data-simple-success-text]");
  const status = form.querySelector<HTMLElement>("[data-status]");
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const label = button?.querySelector<HTMLElement>("[data-label]");
  const original = label?.textContent ?? "";
  const fields = Array.from(
    form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input[required], textarea[required], input[type='email']"),
  );

  const check = (el: HTMLInputElement | HTMLTextAreaElement) => {
    const value = el.value.trim();
    let msg = "";
    if (el.required && !value) msg = el.type === "email" ? text.emailRequired : text.required;
    else if (el.type === "email" && value && !simpleEmail.test(value)) msg = text.emailInvalid;
    el.setAttribute("aria-invalid", String(Boolean(msg)));
    const err = form.querySelector<HTMLElement>(`[data-error-for="${el.name}"]`);
    if (err) {
      err.textContent = msg;
      err.classList.toggle("hidden", !msg);
    }
    return !msg;
  };

  fields.forEach((el) => {
    el.addEventListener("blur", () => check(el));
    el.addEventListener("input", () => {
      if (el.getAttribute("aria-invalid") === "true") check(el);
    });
  });

  const done = (message?: string) => {
    if (message && successText) successText.textContent = message;
    form.hidden = true;
    if (success) {
      success.hidden = false;
      success.focus();
    }
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (status) status.textContent = "";
    const invalid = fields.filter((el) => !check(el));
    if (invalid.length) {
      invalid[0].focus();
      if (status) status.textContent = text.review;
      return;
    }

    const data = new FormData(form);
    if (String(data.get("_gotcha") ?? "")) {
      done();
      return;
    }
    data.delete("_gotcha");

    const endpoint = form.dataset.endpoint ?? "";
    if (!endpoint) {
      const body = Array.from(data.entries())
        .filter(([key, value]) => !key.startsWith("_") && String(value).trim())
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");
      window.location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(form.dataset.subject ?? "")}&body=${encodeURIComponent(body)}`;
      done(form.dataset.mailtoText);
      return;
    }

    if (button && label) {
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
      label.textContent = text.sending;
    }
    try {
      // Kit (antes ConvertKit): su formulario espera el campo "email_address" y no permite leer la respuesta
      // desde otra web, así que se envía en modo "no-cors" y se da por recibido
      const host = new URL(endpoint).hostname;
      if (/(^|\.)(kit\.com|convertkit\.com)$/.test(host)) {
        const email = data.get("email");
        if (email) {
          data.delete("email");
          data.set("email_address", String(email));
        }
        await fetch(endpoint, { method: "POST", body: data, mode: "no-cors" });
        done();
        return;
      }
      const res = await fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(String(res.status));
      // FormSubmit responde {"success": "true"} o {"success": "false", "message": ...}
      const json = await res.json().catch(() => ({}));
      if (json.success === "false" || json.success === false) throw new Error(String(json.message ?? "error"));
      // Casilla "Suscríbeme también": se da de alta en Kit con sus etiquetas, sin frenar el mensaje de éxito
      const kitEndpoint = form.dataset.kitEndpoint;
      if (kitEndpoint && data.get("suscribir")) {
        const sub = new FormData();
        sub.append("email_address", String(data.get("email") ?? "").trim());
        sub.append("fields[first_name]", String(data.get("nombre") ?? "").trim());
        (form.dataset.kitTags ?? "").split(",").filter(Boolean).forEach((id) => sub.append("tags[]", id));
        fetch(kitEndpoint, { method: "POST", body: sub, mode: "no-cors" }).catch(() => {});
      }
      done();
    } catch {
      if (status) status.textContent = `${text.sendError} ${form.dataset.email}.`;
    } finally {
      if (button && label) {
        button.disabled = false;
        button.setAttribute("aria-busy", "false");
        label.textContent = original;
      }
    }
  });
});
