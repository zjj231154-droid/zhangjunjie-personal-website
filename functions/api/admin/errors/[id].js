import { requireAdmin } from "../../../_lib/auth.js";
import { ensureDatabase, json } from "../../../_lib/database.js";

export async function onRequestPatch({ request, env, params }) {
  const unauthorized = requireAdmin(request, env);
  if (unauthorized) return unauthorized;
  if (!env.ANALYTICS_DB) return json({ ok: false, error: "analytics_unavailable" }, 503);
  await ensureDatabase(env.ANALYTICS_DB);

  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }
  const status = body.status === "resolved" ? "resolved" : "new";
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) return json({ ok: false, error: "invalid_id" }, 400);

  await env.ANALYTICS_DB.prepare("UPDATE analytics_errors SET status = ? WHERE id = ?").bind(status, id).run();
  return json({ ok: true, id, status });
}
