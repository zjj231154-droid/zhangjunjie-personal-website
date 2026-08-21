import { ensureDatabase, json } from "../_lib/database.js";

const text = (value, max = 500) => String(value ?? "").slice(0, max);
const allowedTypes = new Set(["session_start", "heartbeat", "session_end", "error", "game_event"]);
const allowedOrigins = new Set([
  "https://swq8h3p431v.feishuapp.com",
  "https://zhangjunjie-personal-website.pages.dev",
  "https://zjj231154-droid.github.io",
]);

const cors = (request) => {
  const origin = request.headers.get("origin");
  if (!origin || !allowedOrigins.has(origin)) return {};
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "Origin",
  };
};

export async function onRequestPost({ request, env }) {
  const corsHeaders = cors(request);
  if (!env.ANALYTICS_DB) return json({ ok: false, error: "analytics_unavailable" }, 503, corsHeaders);
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 16_384) return json({ ok: false, error: "payload_too_large" }, 413, corsHeaders);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400, corsHeaders);
  }

  const type = text(body.type, 32);
  const visitorId = text(body.visitorId, 80);
  const sessionId = text(body.sessionId, 80);
  if (!allowedTypes.has(type) || visitorId.length < 8 || sessionId.length < 8) {
    return json({ ok: false, error: "invalid_event" }, 400, corsHeaders);
  }

  await ensureDatabase(env.ANALYTICS_DB);
  const userAgent = text(request.headers.get("user-agent"), 500);
  const activeSeconds = Math.max(0, Math.min(86_400, Number(body.activeSeconds) || 0));

  if (type === "session_start") {
    await env.ANALYTICS_DB.prepare(`
      INSERT INTO analytics_sessions (
        session_id, visitor_id, path, referrer, device, screen_width, user_agent,
        first_seen, last_seen, active_seconds, page_views
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, 1)
      ON CONFLICT(session_id) DO UPDATE SET
        last_seen = CURRENT_TIMESTAMP,
        page_views = analytics_sessions.page_views + 1
    `).bind(
      sessionId,
      visitorId,
      text(body.path, 220) || "/",
      text(body.referrer, 220) || "direct",
      text(body.device, 20) || "unknown",
      Math.max(0, Math.min(10_000, Number(body.screenWidth) || 0)),
      userAgent,
    ).run();
  } else if (type === "heartbeat" || type === "session_end") {
    await env.ANALYTICS_DB.prepare(`
      UPDATE analytics_sessions
      SET active_seconds = MAX(active_seconds, ?), last_seen = CURRENT_TIMESTAMP
      WHERE session_id = ?
    `).bind(activeSeconds, sessionId).run();
  } else if (type === "game_event") {
    const eventName = text(body.eventName, 80) || "unknown";
    await env.ANALYTICS_DB.batch([
      env.ANALYTICS_DB.prepare(`
        INSERT INTO analytics_events (session_id, visitor_id, event_name)
        VALUES (?, ?, ?)
      `).bind(sessionId, visitorId, eventName),
      env.ANALYTICS_DB.prepare(`
        UPDATE analytics_sessions
        SET game_started = MAX(game_started, ?),
            action_count = action_count + ?,
            last_seen = CURRENT_TIMESTAMP
        WHERE session_id = ?
      `).bind(eventName === "game_start" ? 1 : 0, eventName === "action" ? 1 : 0, sessionId),
    ]);
  } else if (type === "error") {
    await env.ANALYTICS_DB.prepare(`
      INSERT INTO analytics_errors (
        session_id, visitor_id, message, source, line, column_number, stack, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      sessionId,
      visitorId,
      text(body.message, 500) || "Unknown error",
      text(body.source, 500),
      Number.isFinite(Number(body.line)) ? Number(body.line) : null,
      Number.isFinite(Number(body.column)) ? Number(body.column) : null,
      text(body.stack, 4000),
      userAgent,
    ).run();
  }

  return json({ ok: true }, 202, corsHeaders);
}

export function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: cors(request) });
}
