import { json } from "./database.js";

function equalSafe(left, right) {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) result |= a[index] ^ b[index];
  return result === 0;
}

export function requireAdmin(request, env) {
  const configured = env.ADMIN_KEY;
  const header = request.headers.get("authorization") || "";
  const supplied = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!configured || !supplied || !equalSafe(String(configured), supplied)) {
    return json({ ok: false, error: "unauthorized" }, 401, { "www-authenticate": "Bearer" });
  }
  return null;
}
