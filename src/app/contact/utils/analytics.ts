type AnalyticsParams = Record<string, string | number | boolean | undefined>;

type AnalyticsWindow = Window & {
  dataLayer?: Record<string, unknown>[];
  gtag?: (command: string, event: string, params?: AnalyticsParams) => void;
};

const trackEvent = (event: string, params: AnalyticsParams = {}) => {
  if (typeof window === "undefined") return;

  const analyticsWindow = window as AnalyticsWindow;

  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  analyticsWindow.dataLayer.push({
    event,
    ...params,
  });

  if (typeof analyticsWindow.gtag === "function") {
    analyticsWindow.gtag("event", event, params);
  }
};

export const trackContactSubmit = () => {
  trackEvent("contact_submit", {
    page_path: "/contact",
  });
};
