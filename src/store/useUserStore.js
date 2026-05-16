import { create } from "zustand";
import { persist } from "zustand/middleware";
import { trackEvent } from "../services/analytics";

export const SUPPORTED_LANGS = ["en", "ar"];

export const useUserStore = create(
  persist(
    (set, get) => ({
      lang: "en",
      studentGender: "",

      setLang: (lang) => {
        const nextLang = SUPPORTED_LANGS.includes(lang) ? lang : "en";

        set({ lang: nextLang });

        trackEvent("language_changed", {
          language: nextLang,
        });
      },

      toggleLang: () => {
        const currentLang = get().lang;
        const nextLang = currentLang === "en" ? "ar" : "en";

        set({ lang: nextLang });

        trackEvent("language_changed", {
          language: nextLang,
        });
      },

      setStudentGender: (studentGender) => {
        set({ studentGender });

        trackEvent("student_gender_selected", {
          has_value: Boolean(studentGender),
        });
      },
    }),
    { name: "pslate-user" },
  ),
);
