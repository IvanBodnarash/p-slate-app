import { useEffect } from "react";
import { trackPageView } from "../../services/analytics";
import { useLocation } from "react-router";

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname + location.search;
    trackPageView(path);
  }, [location.pathname, location.search]);

  return null;
}
