import { create } from "zustand";
import { persist } from "zustand/middleware";

export const SUPPORTED_LANGS = ["en", "ar"];

export const useUserStore = create(
  persist(
    (set) => ({
      lang: "en",
      studentGender: "",

      setLang: (lang) =>
        set({ lang: SUPPORTED_LANGS.includes(lang) ? lang : "en" }),
      toggleLang: () => set((s) => ({ lang: s.lang === "en" ? "ar" : "en" })),
      setStudentGender: (studentGender) => set({ studentGender }),
    }),
    { name: "pslate-user" }
  )
);
