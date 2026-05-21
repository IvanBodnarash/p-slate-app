const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

const hasWindow = typeof window !== "undefined";

const createDataLayer = () => {
  if (!hasWindow) return;

  window.dataLayer = window.dataLayer || [];

  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };
};

export const initAnalytics = () => {
  if (!hasWindow || !GA_MEASUREMENT_ID) return;

  const existingScript = document.querySelector(
    `script[src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`
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

export const trackPageView = (path) => {
  if (!hasWindow || !window.gtag || !GA_MEASUREMENT_ID) return;

  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
};

export const trackEvent = (eventName, params = {}) => {
  if (!hasWindow || !window.gtag || !GA_MEASUREMENT_ID) return;

  window.gtag("event", eventName, params);
};