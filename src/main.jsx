import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./i18n.js";

import AppRoutes from "./routes/AppRoutes.jsx";
import "./styles/index.css";
import { enableAnalytics, hasAcceptedCookies, initConsentMode } from "./services/analytics.js";

initConsentMode();

if (hasAcceptedCookies()) {
  enableAnalytics();
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>
);
