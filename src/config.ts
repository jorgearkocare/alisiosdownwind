// Datos de la comunidad. Todo lo que cambie (enlaces, email, formulario) se edita aquí.

export const site = {
  name: "Alisios Downwind",
  // PENDIENTE: dominio definitivo (debe coincidir con "site" en astro.config.mjs)
  url: "https://alisiosdownwind.com",
  description:
    "Comunidad de downwind foil en Gran Canaria. Runs abiertos de SUP foil, parawing y wing foil por la costa de la isla, en grupo y con la logística resuelta.",
  instagram: "https://www.instagram.com/alisios.downwind/",
  instagramHandle: "@alisios.downwind",
  // PENDIENTE: enlace de invitación al grupo de WhatsApp (https://chat.whatsapp.com/...). Si se deja vacío se muestra Instagram.
  whatsappGroup: "",
  // PENDIENTE: email de contacto real
  email: "hola@alisiosdownwind.com",
  // PENDIENTE: endpoint del formulario (Formspree, Web3Forms, Basin...). Si se deja vacío, el formulario abre el correo del usuario con los datos.
  formEndpoint: "",
  // PENDIENTE: datos del titular para aviso legal y privacidad (cuando exista el club o asociación)
  legal: {
    owner: "Alisios Downwind (comunidad en proceso de constitución como club deportivo)",
    taxId: "Pendiente de alta",
    address: "Gran Canaria, Islas Canarias, España",
  },
} as const;

// Secciones del menú (los textos de cada idioma están en src/i18n)
export const nav = [
  { id: "por-que" },
  { id: "modalidades" },
  { id: "como-funciona" },
  { id: "merch" },
  { id: "faq" },
] as const;
