import { useEffect } from "react";
import { Outlet } from "react-router";
import { useTranslation } from "react-i18next";
import { useUserStore } from "../store/useUserStore";
import Header from "../components/header/Header";

export default function MainLayout() {
  const { i18n } = useTranslation();
  const lang = useUserStore((s) => s.lang);

  useEffect(() => {
    i18n.changeLanguage(lang);
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  }, [lang, i18n]);

  return (
    <div className="font-tajawal bg-[#F5F5F5] min-h-screen">
      <Header />
      <main
        className="px-6 md:px-14 lg:px-28 py-6"
      >
        <Outlet />
      </main>
    </div>
  );
}
