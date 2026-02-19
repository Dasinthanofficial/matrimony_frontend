import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en/translation.json";
import si from "./locales/si/translation.json";
import ta from "./locales/ta/translation.json";

export const SUPPORTED = ["en", "si", "ta"];

export function normalizeLang(lng) {
  const x = (lng || "").toLowerCase();
  if (x.startsWith("si")) return "si";
  if (x.startsWith("ta")) return "ta";
  if (x.startsWith("en")) return "en";
  return "en";
}

// ✅ convenience: keeps storage consistent with LanguageDetector
export function persistLanguage(lng) {
  const norm = normalizeLang(lng);
  localStorage.setItem("i18nextLng", norm);
  return norm;
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      si: { translation: si },
      ta: { translation: ta }
    },

    supportedLngs: SUPPORTED,
    fallbackLng: "en",

    load: "languageOnly",
    cleanCode: true,

    keySeparator: false,

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng"
    },

    interpolation: { escapeValue: false },
    react: { useSuspense: false }
  });

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = normalizeLang(lng);
});

export default i18n;