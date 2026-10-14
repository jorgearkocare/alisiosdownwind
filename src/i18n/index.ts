// Idiomas de la web. El español vive en la raíz (/) y el resto en /en/, /fr/ y /de/.
import es from "./es";
import en from "./en";
import fr from "./fr";
import de from "./de";

export const languages = {
  es: "Español",
  en: "English",
  fr: "Français",
  de: "Deutsch",
} as const;

export type Lang = keyof typeof languages;
export const defaultLang: Lang = "es";
export const locales = Object.keys(languages) as Lang[];
export const translatedLocales = locales.filter((l) => l !== defaultLang);

export const ogLocale: Record<Lang, string> = { es: "es_ES", en: "en_GB", fr: "fr_FR", de: "de_DE" };

const dictionaries = { es, en, fr, de };

export function getLang(url: URL): Lang {
  const first = url.pathname.split("/")[1] ?? "";
  return (first in languages ? first : defaultLang) as Lang;
}

/** Textos y utilidades del idioma de la página actual */
export function useI18n(url: URL) {
  const lang = getLang(url);
  return { lang, t: dictionaries[lang], home: localizePath(lang) };
}

/** Ruta de la portada en un idioma: "/" para español, "/en/" para inglés... */
export function localizePath(lang: Lang) {
  return lang === defaultLang ? "/" : `/${lang}/`;
}

/** Misma página en otro idioma. Si la página solo existe en español (legales), lleva a la portada de ese idioma. */
export function switchLangPath(url: URL, target: Lang) {
  const rest = url.pathname.replace(/^\/(en|fr|de)(?=\/|$)/, "") || "/";
  const shared = rest === "/" || rest.startsWith("/report");
  if (!shared) return localizePath(target);
  const path = rest.endsWith("/") ? rest : `${rest}/`;
  return target === defaultLang ? path : `/${target}${path}`;
}
