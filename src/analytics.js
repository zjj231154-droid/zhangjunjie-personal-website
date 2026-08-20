const ANALYTICS_HOST = "https://zhangjunjie-personal-website.pages.dev";
const ANALYTICS_ENDPOINT = location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname.endsWith("pages.dev")
  ? "/api/track"
  : `${ANALYTICS_HOST}/api/track`;
const VISITOR_KEY = "mystery_visitor_id";
const SESSION_KEY = "mystery_session_id";

const makeId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

const getStoredId = (storage, key) => {
  try {
    const existing = storage.getItem(key);
    if (existing) return existing;
    const id = makeId();
    storage.setItem(key, id);
    return id;
  } catch {
    return makeId();
  }
};

const deviceType = () => {
  const agent = navigator.userAgent.toLowerCase();
  if (/ipad|tablet/.test(agent) || (navigator.maxTouchPoints > 1 && innerWidth >= 700)) return "tablet";
  if (/mobile|iphone|android/.test(agent) || innerWidth < 700) return "mobile";
  return "desktop";
};

const safeReferrer = () => {
  if (!document.referrer) return "direct";
  try {
    const url = new URL(document.referrer);
    return `${url.hostname}${url.pathname === "/" ? "" : url.pathname.slice(0, 80)}`;
  } catch {
    return "unknown";
  }
};

export function initAnalytics() {
  if (typeof window === "undefined" || window.__mysteryAnalyticsStarted) return;
  window.__mysteryAnalyticsStarted = true;

  const visitorId = getStoredId(localStorage, VISITOR_KEY);
  const sessionId = getStoredId(sessionStorage, SESSION_KEY);
  const startedAt = Date.now();
  let activeSeconds = 0;
  let lastInteraction = Date.now();
  let lastSent = 0;

  const base = {
    visitorId,
    sessionId,
    path: location.pathname,
    referrer: safeReferrer(),
    device: deviceType(),
    screenWidth: Math.round(innerWidth),
  };

  const send = (type, details = {}, beacon = false) => {
    const payload = JSON.stringify({ ...base, type, activeSeconds, ...details });
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon(ANALYTICS_ENDPOINT, new Blob([payload], { type: "application/json" }));
      return;
    }
    fetch(ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  };

  const markActive = () => { lastInteraction = Date.now(); };
  ["pointerdown", "keydown", "scroll", "touchstart"].forEach((eventName) => {
    addEventListener(eventName, markActive, { passive: true });
  });

  send("session_start", { startedAt: new Date(startedAt).toISOString() });

  const timer = window.setInterval(() => {
    if (document.visibilityState === "visible" && Date.now() - lastInteraction < 60_000) activeSeconds += 1;
    if (activeSeconds - lastSent >= 15) {
      lastSent = activeSeconds;
      send("heartbeat");
    }
  }, 1000);

  const reportError = (details) => send("error", details);
  addEventListener("error", (event) => {
    reportError({
      message: String(event.message || "Unknown error").slice(0, 500),
      source: String(event.filename || location.href).slice(0, 500),
      line: event.lineno || null,
      column: event.colno || null,
      stack: String(event.error?.stack || "").slice(0, 4000),
    });
  });
  addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    reportError({
      message: String(reason?.message || reason || "Unhandled promise rejection").slice(0, 500),
      source: location.href,
      stack: String(reason?.stack || "").slice(0, 4000),
    });
  });

  const endSession = () => {
    clearInterval(timer);
    send("session_end", { durationSeconds: Math.round((Date.now() - startedAt) / 1000) }, true);
  };
  addEventListener("pagehide", endSession, { once: true });
}

export function trackGameEvent(name, details = {}) {
  const visitorId = getStoredId(localStorage, VISITOR_KEY);
  const sessionId = getStoredId(sessionStorage, SESSION_KEY);
  fetch(ANALYTICS_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      type: "game_event",
      visitorId,
      sessionId,
      path: location.pathname,
      eventName: String(name).slice(0, 80),
      details,
    }),
    keepalive: true,
  }).catch(() => {});
}
