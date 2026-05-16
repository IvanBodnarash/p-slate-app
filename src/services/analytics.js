const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const CONSENT_KEY = "cookie_consent";

const hasWindow = typeof window !== "undefined";

export const getCookieConsent = () => {
  if (!hasWindow) return null;

  return localStorage.getItem(CONSENT_KEY);
};

export const setCookieConsent = (value) => {
  if (!hasWindow) return;

  localStorage.setItem(CONSENT_KEY, value);
};

export const hasAcceptedCookies = () => {
  return getCookieConsent() === "accepted";
};

export const hasRejectedCookies = () => {
  return getCookieConsent() === "rejected";
};

const createDataLayer = () => {
  if (!hasWindow) return;

  window.dataLayer = window.dataLayer || [];

  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };
};

export const initConsentMode = () => {
  if (!hasWindow) return;

  createDataLayer();

  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
};

export const updateConsent = (isAccepted) => {
  if (!hasWindow || !window.gtag) return;

  window.gtag("consent", "update", {
    analytics_storage: isAccepted ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
};

export const loadGoogleAnalytics = () => {
  if (!hasWindow || !GA_MEASUREMENT_ID) return;

  const existingScript = document.querySelector(
    `script[src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`,
  );

  if (existingScript) return;

  createDataLayer();

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());

  window.gtag("config", GA_MEASUREMENT_ID, {
    send_page_view: false,
  });
};

export const enableAnalytics = () => {
  updateConsent(true);
  loadGoogleAnalytics();
};

export const disableAnalytics = () => {
  updateConsent(false);
};

export const trackPageView = (path) => {
  if (!hasWindow || !window.gtag || !GA_MEASUREMENT_ID || !hasAcceptedCookies()) {
    return;
  }

  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
};

export const trackEvent = (eventName, params = {}) => {
  if (!hasWindow || !window.gtag || !GA_MEASUREMENT_ID || !hasAcceptedCookies()) {
    return;
  }

  window.gtag("event", eventName, params);
};
