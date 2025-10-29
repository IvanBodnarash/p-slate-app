import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { useLocaleStore } from "../store/useLocaleStore";
import Header from "../components/layout/Header";

export default function MainLayout() {
  const { i18n } = useTranslation();
  const lang = useLocaleStore((s) => s.lang);
  const path = useLocation();

  // console.log(isHomePage);

  useEffect(() => {
    i18n.changeLanguage(lang);
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  }, [lang, i18n]);

  return (
    <div className="font-tajawal">
      <Header />
      <main
        className="px-6 md:px-14 lg:px-28 py-6"
      >
        <Outlet />
      </main>
    </div>
  );
}
