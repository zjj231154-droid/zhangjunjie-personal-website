import { requireAdmin } from "../../_lib/auth.js";
import { ensureDatabase, json } from "../../_lib/database.js";

export async function onRequestGet({ request, env }) {
  const unauthorized = requireAdmin(request, env);
  if (unauthorized) return unauthorized;
  if (!env.ANALYTICS_DB) return json({ ok: false, error: "analytics_unavailable" }, 503);
  await ensureDatabase(env.ANALYTICS_DB);

  const url = new URL(request.url);
  const days = Math.max(7, Math.min(30, Number(url.searchParams.get("days")) || 14));
  const interval = `-${days - 1} days`;

  const [overview, trend, sources, devices, errors] = await env.ANALYTICS_DB.batch([
    env.ANALYTICS_DB.prepare(`
      SELECT
        COUNT(DISTINCT CASE WHEN date(first_seen, '+8 hours') = date('now', '+8 hours') THEN visitor_id END) AS visitors_today,
        COALESCE(SUM(CASE WHEN date(first_seen, '+8 hours') = date('now', '+8 hours') THEN page_views ELSE 0 END), 0) AS views_today,
        COALESCE(ROUND(AVG(CASE WHEN date(first_seen, '+8 hours') = date('now', '+8 hours') THEN active_seconds END)), 0) AS avg_active_today,
        COUNT(DISTINCT visitor_id) AS visitors_total,
        COUNT(*) AS sessions_total,
        COALESCE(ROUND(100.0 * SUM(game_started) / NULLIF(COUNT(*), 0), 1), 0) AS start_rate,
        COALESCE(SUM(action_count), 0) AS actions_total,
        (SELECT COUNT(*) FROM analytics_errors WHERE status = 'new') AS open_errors
      FROM analytics_sessions
    `),
    env.ANALYTICS_DB.prepare(`
      SELECT
        date(first_seen, '+8 hours') AS day,
        COUNT(DISTINCT visitor_id) AS visitors,
        SUM(page_views) AS views,
        ROUND(AVG(active_seconds), 0) AS avg_active,
        (SELECT COUNT(*) FROM analytics_errors e WHERE date(e.created_at, '+8 hours') = date(s.first_seen, '+8 hours')) AS errors
      FROM analytics_sessions s
      WHERE date(first_seen, '+8 hours') >= date('now', '+8 hours', ?)
      GROUP BY date(first_seen, '+8 hours')
      ORDER BY day ASC
    `).bind(interval),
    env.ANALYTICS_DB.prepare(`
      SELECT referrer AS name, COUNT(*) AS sessions
      FROM analytics_sessions
      WHERE date(first_seen, '+8 hours') >= date('now', '+8 hours', ?)
      GROUP BY referrer ORDER BY sessions DESC LIMIT 8
    `).bind(interval),
    env.ANALYTICS_DB.prepare(`
      SELECT device AS name, COUNT(*) AS sessions
      FROM analytics_sessions
      WHERE date(first_seen, '+8 hours') >= date('now', '+8 hours', ?)
      GROUP BY device ORDER BY sessions DESC
    `).bind(interval),
    env.ANALYTICS_DB.prepare(`
      SELECT id, message, source, line, column_number, stack, status, created_at
      FROM analytics_errors ORDER BY created_at DESC LIMIT 30
    `),
  ]);

  return json({
    ok: true,
    generatedAt: new Date().toISOString(),
    days,
    overview: overview.results?.[0] || {},
    trend: trend.results || [],
    sources: sources.results || [],
    devices: devices.results || [],
    errors: errors.results || [],
  });
}
