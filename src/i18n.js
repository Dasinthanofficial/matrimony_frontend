// src/i18n.js
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
    
    // ❌ DELETE THIS LINE:
    // keySeparator: false, 

    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng"
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false }
  });