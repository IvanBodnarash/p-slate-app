import { useTranslation } from "react-i18next";
import { NavLink, useParams } from "react-router";

export default function Navigation() {
  const { lang = "en" } = useParams(); // "en" - default
  const { t } = useTranslation();

  return (
    <nav className="text-amber-100 md:text-lg">
      <NavLink to={`/${lang}/planner`} className="hover:text-sky-500">
        {t("planner")}
      </NavLink>
    </nav>
  );
}
