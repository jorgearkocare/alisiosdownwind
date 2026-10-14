// Números de El Pez Volador Report. Para publicar uno nuevo, añade un objeto al principio de la lista.
// Cada número tiene versión en español (es) y en inglés (en); francés y alemán muestran la inglesa.

export interface IssueContent {
  title: string;
  intro: string;
  blocks: { heading: string; body: string[] }[];
}

export interface Issue {
  slug: string;
  number: number;
  date: string; // AAAA-MM-DD
  es: IssueContent;
  en: IssueContent;
}

export const issues: Issue[] = [
  {
    slug: "00",
    number: 0,
    date: "2026-10-14",
    es: {
      title: "Así será El Pez Volador Report",
      intro:
        "Este es el número cero. Todavía no hay run de la quincena, pero sí hay plan: cada dos semanas os mandaremos cuatro bloques cortos sobre downwind, escritos desde Gran Canaria para cualquiera que lo viva en cualquier costa.",
      blocks: [
        {
          heading: "El run de la quincena",
          body: [
            "Cada número abre con un run: el mejor que hayamos hecho en la isla o el que nos mandéis vosotros desde cualquier parte del mundo.",
            "Spot, viento, distancia y quién estaba en el agua. Con fotos o vídeo siempre que haya.",
          ],
        },
        {
          heading: "Un consejo",
          body: [
            "Algo que puedas aplicar en tu próxima sesión: cómo leer el swell, qué hacer si rompes el leash a mitad de ruta o cómo elegir pala y ala según el viento.",
          ],
        },
        {
          heading: "Downwind en el mundo",
          body: [
            "Lo que se mueve fuera de Canarias: eventos, rutas míticas y riders que están empujando el deporte en otras costas.",
          ],
        },
        {
          heading: "Lo nuestro",
          body: ["Próximos runs abiertos, la preventa del merch, cursos y riders invitados en Gran Canaria."],
        },
        {
          heading: "¿Quieres salir en el próximo?",
          body: [
            "Manda tu run desde la web. Da igual si es en Gran Canaria, en Tarifa o en el Báltico: si tiene buena historia, tiene sitio aquí.",
          ],
        },
      ],
    },
    en: {
      title: "What El Pez Volador Report will be",
      intro:
        "This is issue zero. There is no run of the fortnight yet, but there is a plan: every two weeks we will send you four short blocks about downwind, written from Gran Canaria for anyone who lives it on any coast.",
      blocks: [
        {
          heading: "Run of the fortnight",
          body: [
            "Every issue opens with a run: the best one we did on the island, or one you send us from anywhere in the world.",
            "Spot, wind, distance and who was on the water. With photos or video whenever there are some.",
          ],
        },
        {
          heading: "One tip",
          body: [
            "Something you can use on your next session: how to read the swell, what to do if your leash breaks halfway, or how to pick a paddle and wing for the wind.",
          ],
        },
        {
          heading: "Downwind around the world",
          body: ["What is happening beyond the Canaries: events, legendary routes and riders pushing the sport on other coasts."],
        },
        {
          heading: "Our news",
          body: ["Upcoming open runs, the merch pre-order, courses and guest riders in Gran Canaria."],
        },
        {
          heading: "Want to be in the next one?",
          body: [
            "Send us your run from the website. Gran Canaria, Tarifa or the Baltic, it does not matter: if it has a good story, it has a place here.",
          ],
        },
      ],
    },
  },
];

/** Contenido del número en el idioma de la página (el español tiene su versión, el resto usa la inglesa) */
export function issueContent(issue: Issue, lang: string): IssueContent {
  return lang === "es" ? issue.es : issue.en;
}

/** Ruta del archivo o de un número en cada idioma */
export function reportPath(lang: string, slug?: string) {
  const base = lang === "es" ? "/report/" : `/${lang}/report/`;
  return slug ? `${base}${slug}/` : base;
}
