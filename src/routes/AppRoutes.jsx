import {
  Routes,
  Route,
  useParams,
  Navigate,
} from "react-router";
import { useEffect } from "react";

import { SUPPORTED_LANGS, useUserStore } from "../store/useUserStore.js";

import MainLayout from "../layouts/MainLayout.jsx";
import HomePage from "../pages/HomePage.jsx";
import PlannerPage from "../pages/PlannerPage.jsx";

function WithLocale() {
  const { lang } = useParams();
  const setLang = useUserStore((s) => s.setLang);

  useEffect(() => {
    if (SUPPORTED_LANGS.includes(lang)) setLang(lang);
  }, [lang, setLang]);

  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* <Route index element={<HomePage />} /> */}
        <Route index element={<PlannerPage />} />
      </Route>
      <Route path="*" element={<Navigate to={`/${lang}`} replace />} />
    </Routes>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/en" replace />} />
      <Route path="/:lang/*" element={<WithLocale />} />
      <Route path="*" element={<Navigate to="/en" replace />} />
    </Routes>
  );
}
