import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import so from "./so.json";
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    so: { translation: so },
  },
  lng: localStorage.getItem("defaultLanguage.state.defaultLanguage") || "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
