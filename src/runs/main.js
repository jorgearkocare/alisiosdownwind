// Arranque de la webapp de runs en /runs (src/pages/runs.astro).
// Con las claves de Supabase configuradas usa datos reales; sin ellas, la demo guardada en el navegador.

import { mountRunsApp } from "./app.js";
import { createDemoStore } from "./store-demo.js";

async function start(host) {
  const { supabaseUrl, supabaseKey, privacy = "/privacidad", whatsapp = "", logo = "" } = host.dataset;
  try {
    let store;
    if (supabaseUrl && supabaseKey) {
      const { createSupabaseStore } = await import("./store-supabase.js");
      store = await createSupabaseStore({ url: supabaseUrl, key: supabaseKey });
    } else {
      store = createDemoStore();
    }
    mountRunsApp(host, { store, links: { privacy, whatsapp, logo } });
  } catch (err) {
    console.error("[runs]", err);
    const note = host.querySelector("[data-runs-fallback]");
    if (note) note.textContent = "No hemos podido cargar los runs. Comprueba tu conexión y recarga la página.";
  }
}

const host = document.getElementById("runs-app");
if (host) start(host);
