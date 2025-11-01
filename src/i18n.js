import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

const inlineResources = {
  en: {
    common: { toggleLabel: "ع", welcome: "Plan with ease" },
    planner: { planner: "Planner" },
  },
  ar: {
    common: { toggleLabel: "En", welcome: "خطط بسهولة" },
    planner: { planner: "المُخطِّط" },
  },
};

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: "en",
    fallbackLng: "en",
    ns: ["common", "planner"],
    defaultNS: "common",
    // resources: inlineResources, // temporary fallback
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json", // IMPORTANT: absolute path
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    // debug: true, // Temporary
  });

export default i18n;
