import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: "en",
    fallbackLng: "en",
    ns: ["common", "planner"],
    defaultNS: "common",
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json", // IMPORTANT: absolute path
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    // debug: true, // Temporary
  });

export default i18n;
