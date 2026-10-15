// Datos de la comunidad. Todo lo que cambie (enlaces, email, formulario) se edita aquí.

export const site = {
  name: "Alisios Downwind",
  // PENDIENTE: dominio definitivo (debe coincidir con "site" en astro.config.mjs)
  url: "https://alisiosdownwind.vercel.app",
  description:
    "Comunidad de downwind foil en Gran Canaria. Runs abiertos de SUP foil, parawing y wing foil por la costa de la isla, en grupo y con la logística resuelta.",
  instagram: "https://www.instagram.com/alisios.downwind/",
  instagramHandle: "@alisios.downwind",
  // PENDIENTE: enlace de invitación al grupo de WhatsApp (https://chat.whatsapp.com/...). Si se deja vacío se muestra Instagram.
  whatsappGroup: "https://chat.whatsapp.com/H6bp2U6VDbB1QXEuHy1s0r",
  email: "alisios.downwind@gmail.com",
  // Formulario "Quiero formar parte": se envía al mismo formulario de Kit que la newsletter y cada respuesta se guarda como etiqueta
  // (ver kitTags). Si se deja vacío, el formulario abre el correo del usuario con los datos.
  formEndpoint: "https://app.kit.com/forms/10043700/subscriptions",
  // PENDIENTE: URL del formulario de suscripción de la newsletter. Con Kit es la dirección "action" de su código
  // "Embed using HTML", algo como https://app.kit.com/forms/1234567/subscriptions. Si se deja vacío, abre el correo del usuario.
  newsletterEndpoint: "https://app.kit.com/forms/10043700/subscriptions",
  // "Cuéntalo en el Report": cada envío (run, experiencia u opinión) llega como email a esta dirección a través de FormSubmit.
  // La primera vez FormSubmit manda un email de activación a alisios.downwind@gmail.com que hay que confirmar.
  contributionEndpoint: "https://formsubmit.co/ajax/alisios.downwind@gmail.com",
  // PENDIENTE: datos del titular para aviso legal y privacidad (cuando exista el club o asociación)
  legal: {
    owner: "Alisios Downwind (comunidad en proceso de constitución como club deportivo)",
    taxId: "Pendiente de alta",
    address: "Calle Ciudad de Moguer, 35200 Gran Canaria, Las Palmas, España",
  },
} as const;

// Secciones del menú (los textos de cada idioma están en src/i18n, en nav.items y nav.moreItems)
export const nav = [{ id: "equipo" }, { id: "formar-parte" }, { id: "report" }, { id: "merch" }] as const;
// Resto de secciones, dentro del desplegable "Otros"
export const navMore = [
  { id: "por-que" },
  { id: "modalidades" },
  { id: "galeria" },
  { id: "comunidad" },
  { id: "lo-que-viene" },
  { id: "unete" },
  { id: "faq" },
] as const;

// Etiquetas de Kit que se ponen a cada persona según lo que marca en "Quiero formar parte".
// Clave: "campo:valor" del formulario. Valor: id de la etiqueta en Kit (Suscriptores > Etiquetas).
// En Kit, cada etiqueta muestra cuánta gente la tiene: así se sabe cuántos quieren cada curso o prenda.
export const kitTags: Record<string, number> = {
  comunidad: 24631037,
  newsletter: 24631147,
  colaborador: 24631148,
  "nivel:aprendiendo": 24631043,
  "nivel:choppy": 24631044,
  "nivel:soltura": 24631045,
  "modalidad:SUP foil": 24631046,
  "modalidad:Parawing": 24631047,
  "modalidad:Wing foil": 24631048,
  "interes:runs": 24631049,
  "interes:cursos": 24631050,
  "interes:merch": 24631052,
  "interes:embarcacion": 24648494,
  "actividad:rescate": 24631053,
  "actividad:iniciacion-sup-foil": 24631054,
  "actividad:parawing": 24631055,
  "actividad:runs-con-paradas": 24631056,
  "actividad:pro-run": 24631057,
  "actividad:filmacion": 24631058,
  "prenda:gorra-de-agua": 24631059,
  "prenda:trucker": 24631060,
  "prenda:lycra": 24631061,
  "prenda:camiseta": 24631062,
  "idioma:es": 24631063,
  "idioma:en": 24631064,
  "idioma:fr": 24631065,
  "idioma:de": 24631066,
};
