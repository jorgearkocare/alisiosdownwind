// Textos en español (idioma principal). Los demás idiomas copian esta misma estructura.

const es = {
  meta: {
    title: "Alisios DW · Comunidad de downwind foil en Gran Canaria",
    description:
      "Comunidad de downwind foil en Gran Canaria. Runs abiertos de SUP foil, parawing y wing foil por la costa de la isla, en grupo y con la logística resuelta.",
    ogAlt: "Logo de Alisios DW, comunidad de downwind foil en Gran Canaria",
    skip: "Saltar al contenido",
  },
  nav: {
    label: "Principal",
    home: "Alisios DW, ir al inicio",
    items: {
      "por-que": "Por qué",
      modalidades: "Modalidades",
      "como-funciona": "Cómo funciona",
      merch: "Merch",
      faq: "Preguntas",
    },
    join: "Únete",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    language: "Idioma",
  },
  hero: {
    sticker: "Gran Canaria · Downwind foil",
    title: ["Haz el downwind", "con los alisios."],
    titleAccent: "Nunca solo.",
    lead: "Somos una comunidad de riders de SUP foil, parawing y wing foil que organiza runs abiertos por la costa de Gran Canaria. Avisamos cuando entra el viento, cuadramos coches entre salida y llegada y hacemos el downwind juntos.",
    cta: "Apúntate al próximo downwind",
    free: "Gratis y sin cuotas",
    proof: "Iballa Ruano, Foil Only, Moritz Mauch y Miguel Chapuis ya han hecho downwind con la comunidad. Lo vas viendo en",
    logoAlt: "Logo de Alisios DW: un pez con cresta volando sobre un foil, dentro de una explosión azul y amarilla",
    alertLabel: "Así llega un aviso al grupo",
    alert:
      "Mañana entra el alisio. Quedamos a las 10:30 en la llegada para dejar coches y subimos juntos a la salida. Nivel intermedio, quedan 3 plazas.",
  },
  marquee: {
    top: ["SUP foil", "Parawing", "Wing foil", "Gran Canaria", "Runs abiertos"],
    bottom: ["Únete al grupo", "Runs gratis", "Nunca solo", "Alisio del nordeste"],
  },
  why: {
    sticker: "Por qué en grupo",
    title: "Hacer downwind solo tiene tres problemas. En grupo, ninguno.",
    alone: "Si vas solo",
    group: "En grupo",
    items: [
      {
        title: "Logística",
        problem: "Un downwind empieza en un sitio y termina en otro. Sin un segundo coche esperando en la llegada, no hay run.",
        solution: "Cuadramos coches en el grupo: dejamos unos en la llegada y subimos juntos a la salida.",
      },
      {
        title: "Seguridad",
        problem: "Si rompes un foil o te quedas sin piernas a mitad de ruta, estás solo frente a kilómetros de costa.",
        solution: "Salimos juntos, con la ruta compartida y riders que conocen cada entrada y salida del mar.",
      },
      {
        title: "Progresión",
        problem: "Aprender a leer el swell a base de prueba y error lleva temporadas enteras.",
        solution: "Haces el run al lado de riders con más horas, ves su línea y copias lo que funciona.",
      },
    ],
  },
  tagline: {
    label: "Lo que nos mueve",
    lines: [
      { text: "En Gran Canaria", accent: false },
      { text: "el viento no falta.", accent: false },
      { text: "Lo que faltaba", accent: false },
      { text: "era con quién hacer downwind.", accent: true },
    ],
  },
  modes: {
    sticker: "Modalidades",
    title: "Tres maneras de hacer downwind con el mismo viento",
    lead: "En cada aviso indicamos para qué modalidades es la ruta. Muchos runs juntan riders de las tres.",
    needs: "Qué necesitas",
    items: [
      {
        name: "SUP foil",
        text: "La más pura. Despegas a remo sobre el choppy y encadenas bumps sin más tracción que la del mar.",
        needs: ["Tabla de downwind, foil y pala", "Despegar a remo con choppy"],
      },
      {
        name: "Parawing",
        text: "Un ala sin botavara que te da el empujón para despegar y que recoges para surfear el swell.",
        needs: ["Tabla, foil y parawing", "Soltura navegando con ala"],
      },
      {
        name: "Wing foil",
        text: "Tracción constante para enlazar swells y volver a despegar si te caes a mitad de ruta.",
        needs: ["Tabla, foil y wing", "Navegar a favor del viento"],
      },
    ],
  },
  how: {
    sticker: "Cómo funciona",
    title: "Del sofá a la llegada en tres pasos",
    steps: [
      { title: "Únete a la comunidad", text: "Déjanos tu email y entra al grupo de WhatsApp. Ahí se mueve todo." },
      {
        title: "Recibe el aviso",
        text: "Cuando el parte confirma viento anunciamos ruta, hora, punto de encuentro y nivel, normalmente con uno o dos días de margen.",
      },
      {
        title: "Haz el run en grupo",
        text: "Dejamos coches en la llegada, subimos juntos a la salida y hacemos el run con el alisio a la espalda.",
      },
    ],
  },
  community: {
    sticker: "La comunidad",
    title: "Empezamos unos pocos amigos. Ahora vienen hasta los pros.",
    lead: "Alisios nació para no hacer downwind solos. Hoy es un grupo abierto de riders de toda la isla, y cada run lo contamos en Instagram.",
    instagram: "Ver",
    ridersLabel: "Han hecho downwind con nosotros",
    roles: {
      "Iballa Ruano": "Rider profesional de Gran Canaria",
      "Foil Only": "Escuela y comunidad de foil de Tenerife",
    } as Record<string, string>,
    photos: [
      {
        caption: "En el agua",
        alt: "Dos riders de SUP foil en pleno downwind sobre el mar azul, uno con chaleco rosa remando y otro saludando",
      },
      { caption: "Antes del run", alt: "Selfie del grupo junto a la furgoneta con las tablas y los foils preparados antes de salir" },
      { caption: "Después del run", alt: "El grupo celebrando en la llegada con una tabla de downwind morada y cervezas en la mano" },
    ],
  },
  team: {
    sticker: "Detrás del proyecto",
    title: "Cuatro amigos enganchados al downwind",
    lead: "Alisios lo empezamos cuatro amigos que no podíamos parar de hacer downwind. Queríamos divertirnos con más gente y compartir esa adrenalina de enlazar bumps con el alisio empujando por detrás.",
    role: "Equipo Alisios",
    profile: "Ver perfil de",
  },
  merch: {
    sticker: "Colección 2026",
    title: "Merch de la comunidad",
    lead: "Primera tirada limitada y en preventa: solo se fabrica lo que se reserva.",
    cta: "Avísame de la preventa",
    tag: "Preventa pronto",
    sketchOf: "Boceto de",
    note: "Bocetos provisionales. Colores y prendas definitivas en la preventa.",
    items: [
      { name: "Camiseta Pez Volador", detail: "El logo completo en el pecho" },
      { name: "Gorra Nordeste", detail: "Trucker con parche bordado del pez" },
      { name: "Sudadera Bump", detail: "Para la espera en la llegada cuando refresca" },
    ],
  },
  coming: {
    sticker: "Lo que viene",
    title: "Cursos, pro runs y filmación",
    lead: "Lo estamos preparando como club, con seguro y monitores titulados. Marca lo que te interesa al apuntarte y te avisamos antes que a nadie.",
    soon: "Próximamente",
    items: [
      { title: "Rescate y buenas prácticas", text: "Autorescate, remolque, señales y plan de ruta. Teoría y agua en una mañana." },
      {
        title: "Iniciación a SUP foil",
        text: "Despegar a remo con choppy y enlazar tus primeros bumps, con un coach para cada dos riders.",
      },
      { title: "Clases de parawing", text: "Para pasar del wing al parawing con alguien al lado que ya ha recorrido ese camino." },
      { title: "Runs con paradas", text: "Tramos cortos en grupo, con paradas para corregir técnica sobre la marcha." },
      { title: "Pro run", text: "Un rider profesional hace el downwind contigo de punta a punta y te enseña su línea." },
      { title: "Filmación de tu run", text: "Te grabamos desde el agua o desde moto de agua para que veas qué corregir." },
    ],
  },
  faq: {
    sticker: "Preguntas frecuentes",
    title: "Lo que nos preguntáis antes del primer downwind",
    items: [
      {
        q: "¿Cuánto cuesta venir a un downwind?",
        a: "Los runs de la comunidad son gratis. Cada rider trae su material y, si compartimos coche, la gasolina se reparte entre quienes van.",
      },
      {
        q: "¿Qué nivel necesito?",
        a: "Para los runs abiertos tienes que despegar sin ayuda y aguantar sesiones largas en el agua. Si todavía no despegas con choppy, apúntate igualmente: te avisamos cuando abramos las sesiones de iniciación.",
      },
      {
        q: "¿Qué material hace falta?",
        a: "Tu tabla y tu foil, chaleco o impact vest, leash y el móvil en una funda estanca. Recomendamos casco. Para parawing y wing foil, tu ala.",
      },
      {
        q: "¿Por dónde son los runs?",
        a: "Elegimos la ruta según la dirección y la fuerza del alisio y el estado del mar. La ruta, el punto de encuentro y el nivel se anuncian en el grupo antes de cada salida.",
      },
      {
        q: "¿Cómo me entero de la próxima?",
        a: "Por el grupo de WhatsApp y por Instagram. Avisamos en cuanto el parte confirma viento, normalmente con uno o dos días de margen.",
      },
      {
        q: "¿Puedo venir si estoy de paso por la isla?",
        a: "Sí. Escríbenos con unos días de antelación y te decimos qué runs encajan con tu nivel y si queda sitio en algún coche.",
      },
      {
        q: "¿Alquiláis material?",
        a: "Todavía no. Si lo necesitas, te recomendamos tiendas de la isla con las que tenemos contacto.",
      },
      {
        q: "¿Quién se hace responsable en el agua?",
        a: "En los runs abiertos cada rider sale bajo su propia responsabilidad y decide según su nivel y el estado del mar. Los cursos y actividades guiadas que lancemos tendrán seguro y monitores titulados.",
      },
      {
        q: "¿Cuándo empiezan los cursos?",
        a: "Los estamos preparando. Marca la opción de cursos al apuntarte y te avisamos antes de abrir plazas.",
      },
      {
        q: "¿Qué hacéis con mis datos?",
        a: "Solo los usamos para avisarte de runs y novedades de la comunidad. No los compartimos con nadie y puedes darte de baja cuando quieras.",
      },
    ],
  },
  join: {
    title: "Apúntate al próximo downwind",
    lead: "Te avisamos por email de cada downwind y te pasamos el grupo de WhatsApp donde se cuadra todo.",
    perks: ["Gratis y sin cuotas", "Te das de baja con un clic", "Sin spam: solo runs y novedades"],
    name: "Nombre",
    namePlaceholder: "Nayra",
    email: "Email",
    emailPlaceholder: "nayra@correo.com",
    modes: "Qué modalidad haces",
    level: "Tu nivel",
    levelPlaceholder: "Elige una opción",
    levels: {
      aprendiendo: "Estoy aprendiendo a despegar",
      choppy: "Despego y navego con choppy",
      soltura: "Hago downwind con soltura",
    },
    interests: "Qué te interesa",
    interestLabels: {
      runs: "Runs abiertos",
      cursos: "Cursos y clínics",
      "pro-run-filmacion": "Pro runs y filmación",
      merch: "Merch",
    },
    honeypot: "No rellenes este campo",
    consentBefore: "He leído la",
    consentLink: "política de privacidad",
    consentAfter: "y acepto que me escribáis sobre la comunidad.",
    successTitle: "Estás dentro.",
    successText: "Te escribimos en cuanto haya downwind. Mientras tanto, entra al grupo, que es donde se cuadra todo.",
    whatsapp: "Entrar al grupo de WhatsApp",
    follow: "Seguir",
  },
  client: {
    nameRequired: "Escribe tu nombre.",
    emailRequired: "Escribe tu email.",
    emailInvalid: "Este email no parece válido. Revisa que tenga @ y dominio.",
    levelRequired: "Elige tu nivel para saber qué runs te encajan.",
    consentRequired: "Necesitamos tu permiso para escribirte.",
    review: "Revisa los campos marcados.",
    sending: "Enviando…",
    submit: "Apúntate al próximo downwind",
    sendError: "No hemos podido enviar el formulario. Inténtalo de nuevo o escríbenos a",
    mailtoTitle: "Ya casi está.",
    mailtoText: "Hemos abierto tu correo con los datos ya escritos. Envíalo y te añadimos a la lista.",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
  },
  footer: {
    blurb: "Comunidad de downwind foil en Gran Canaria. Runs abiertos de SUP foil, parawing y wing foil.",
    contact: "¿Dudas? Escríbenos y te contestamos en cuanto salgamos del agua.",
    community: "Comunidad",
    whatsapp: "Grupo de WhatsApp",
    legal: "Legal",
    privacy: "Política de privacidad",
    legalNotice: "Aviso legal y cookies",
    legalLangNote: "",
    madeIn: "Hecho en Gran Canaria, con el alisio de espalda",
  },
};

export default es;
