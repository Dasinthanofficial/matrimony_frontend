// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import your translation files
import en from "./locales/en/translation.json";
import si from "./locales/si/translation.json";
import ta from "./locales/ta/translation.json";

export const SUPPORTED = ["en", "si", "ta"];

// ✅ MISSING FUNCTION 1: Normalizes language string (e.g., "en-US" becomes "en")
export const normalizeLang = (lang) => {
  if (!lang) return "en";
  const shortLang = lang.split("-")[0].toLowerCase();
  return SUPPORTED.includes(shortLang) ? shortLang : "en";
};

// ✅ MISSING FUNCTION 2: Persists language to localStorage and updates HTML tag
export const persistLanguage = (lang) => {
  const validLang = normalizeLang(lang);
  localStorage.setItem("i18nextLng", validLang);
  document.documentElement.lang = validLang;
  
  // Set text direction based on language (en, si, ta are all LTR)
  document.documentElement.dir = "ltr"; 
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      si: { translation: si },
      ta: { translation: ta },
    },
    supportedLngs: SUPPORTED,
    fallbackLng: "en",
    load: "languageOnly",
    
    // ⚠️ DO NOT ADD `keySeparator: false` HERE, it breaks nested JSON keys
    
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
    interpolation: { 
      escapeValue: false // React already safe from XSS
    },
  });

export default i18n;