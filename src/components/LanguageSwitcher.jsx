import React from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  const current = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];

  return (
    <div style={{ marginTop: 12, marginBottom: 12 }}>
      <label style={{ marginRight: 8 }}>{t("selectLanguage")}:</label>
      <select
        value={current}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
      >
        <option value="en">{t("language.en")}</option>
        <option value="si">{t("language.si")}</option>
        <option value="ta">{t("language.ta")}</option>
      </select>
    </div>
  );
}