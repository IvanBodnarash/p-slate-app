import Logo from "./Logo";
import LanguageToggle from "./LanguageToggle";
import Navigation from "./Navigation";
import { NavLink, useParams } from "react-router";

export default function Header() {
  const { lang = "en" } = useParams(); // "en" - default

  return (
    <div className="px-8 md:px-14 lg:px-28 py-4 flex flex-col md:flex-row items-center justify-between">
      <NavLink to={`/${lang}`} className="cursor-pointer">
        <Logo />
      </NavLink>

      <div className="flex flex-row items-center gap-4 p-1 md:p-0">
        {/* <Navigation /> */}
        <LanguageToggle />
      </div>
    </div>
  );
}
