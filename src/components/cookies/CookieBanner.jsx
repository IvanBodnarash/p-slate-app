import { useState } from "react";
import { enableAnalytics, disableAnalytics, getCookieConsent, setCookieConsent } from "../../services/analytics";

import { LiaCookieSolid } from "react-icons/lia";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(() => !getCookieConsent());

  if (!isVisible) return null;

  const handleAccept = () => {
    setCookieConsent("accepted");
    enableAnalytics();
    setIsVisible(false);
  };

  const handleReject = () => {
    setCookieConsent("rejected");
    disableAnalytics();
    setIsVisible(false);
  };

  return (
    <div className="fixed font-tajawal bottom-4 left-4 right-4 z-50 rounded-md border border-slate-300 bg-white p-4 shadow-xl md:left-auto md:max-w-md">
      <div className="flex items-center gap-2 mb-2 text-slate-900">
        <h2 className="text-lg font-semibold">Cookies</h2>
        <LiaCookieSolid size={24} />
      </div>

      <p className="mb-3 text-sm text-slate-600">
        We use analytics cookies to understand how visitors use this website and improve the experience.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleReject}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 cursor-pointer"
        >
          Reject
        </button>

        <button
          type="button"
          onClick={handleAccept}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 cursor-pointer"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
