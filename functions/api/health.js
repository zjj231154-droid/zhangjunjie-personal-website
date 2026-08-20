import { json } from "../_lib/database.js";

export async function onRequestGet({ env }) {
  let database = "unavailable";
  try {
    if (env.ANALYTICS_DB) {
      await env.ANALYTICS_DB.prepare("SELECT 1 AS ok").first();
      database = "ok";
    }
  } catch {
    database = "error";
  }
  return json({ ok: database === "ok", database, timestamp: new Date().toISOString() }, database === "ok" ? 200 : 503);
}
