// Interacciones de la web: menú, apariciones al hacer scroll, frase palabra a palabra,
// navegación activa y formulario. Sin listeners de scroll: todo con IntersectionObserver.

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Menú móvil (isla flotante) ---------- */
const header = document.querySelector<HTMLElement>("[data-nav]");
const toggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
const menuLinks = document.querySelectorAll<HTMLAnchorElement>("[data-menu-link]");

function setMenu(open: boolean) {
  if (!header || !toggle) return;
  header.dataset.open = String(open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
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
    nombre: (el) => (el.value.trim() ? "" : "Escribe tu nombre."),
    email: (el) => {
      const v = el.value.trim();
      if (!v) return "Escribe tu email.";
      return emailPattern.test(v) ? "" : "Este email no parece válido. Revisa que tenga @ y dominio.";
    },
    nivel: (el) => (el.value ? "" : "Elige tu nivel para saber qué runs te encajan."),
    privacidad: (el) => ((el as HTMLInputElement).checked ? "" : "Necesitamos tu permiso para escribirte."),
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
    submitLabel.textContent = loading ? "Enviando…" : "Apúntate al próximo downwind";
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
      if (status) status.textContent = "Revisa los campos marcados.";
      return;
    }

    const data = new FormData(form);
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
      ].join("\n");
      window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent("Quiero unirme a Alisios Downwind")}&body=${encodeURIComponent(body)}`;
      showSuccess("Hemos abierto tu correo con los datos ya escritos. Envíalo y te añadimos a la lista.", "Ya casi está.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(String(res.status));
      showSuccess();
    } catch {
      if (status) {
        status.textContent = `No hemos podido enviar el formulario. Inténtalo de nuevo o escríbenos a ${contactEmail}.`;
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
  });
});
