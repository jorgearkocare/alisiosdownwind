// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Cambia "site" por el dominio definitivo antes de publicar (se usa en canonical y og:image)
export default defineConfig({
  site: "https://alisiosdownwind.com",
  vite: {
    plugins: [tailwindcss()],
  },
});
