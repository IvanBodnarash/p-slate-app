import { useLocation, useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useLocaleStore } from "../../store/useLocaleStore";

export default function LanguageToggle() {
  const { lang = "en" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const setLang = useLocaleStore((s) => s.setLang);
  const { t } = useTranslation();

  const next = lang === "en" ? "ar" : "en";

  const onToggle = () => {
    setLang(next);
    const newPath = location.pathname.replace(/^\/(en|ar)/, `/${next}`);
    navigate(
      { pathname: newPath, search: location.search, hash: location.hash },
      { replace: true }
    );
  };

  return (
    <button
      onClick={onToggle}
      className="text-white bg-blue-dark-ocean p-1 rounded-full size-8 md:size-12 md:text-2xl hover:text-sky-500 cursor-pointer"
      title={lang === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
    >
      {t("toggleLabel")}
    </button>
  );
}
