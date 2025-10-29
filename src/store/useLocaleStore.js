import { create } from "zustand";
import { persist } from "zustand/middleware";

export const SUPPORTED_LANGS = ["en", "ar"];

export const useLocaleStore = create(
  persist(
    (set) => ({
      lang: "en",
      setLang: (lang) =>
        set({ lang: SUPPORTED_LANGS.includes(lang) ? lang : "en" }),
      toggleLang: () => set((s) => ({ lang: s.lang === "en" ? "ar" : "en" })),
    }),
    { name: "pslate-lang" }
  )
);
