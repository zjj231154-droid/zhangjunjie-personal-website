const SESSION_SCHEMA = `
  CREATE TABLE IF NOT EXISTS analytics_sessions (
    session_id TEXT PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    path TEXT NOT NULL DEFAULT '/',
    referrer TEXT NOT NULL DEFAULT 'direct',
    device TEXT NOT NULL DEFAULT 'unknown',
    screen_width INTEGER,
    user_agent TEXT,
    first_seen TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active_seconds INTEGER NOT NULL DEFAULT 0,
    page_views INTEGER NOT NULL DEFAULT 1,
    game_started INTEGER NOT NULL DEFAULT 0,
    action_count INTEGER NOT NULL DEFAULT 0
  )
`;

const ERROR_SCHEMA = `
  CREATE TABLE IF NOT EXISTS analytics_errors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    visitor_id TEXT NOT NULL,
    message TEXT NOT NULL,
    source TEXT,
    line INTEGER,
    column_number INTEGER,
    stack TEXT,
    user_agent TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

const EVENT_SCHEMA = `
  CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    visitor_id TEXT NOT NULL,
    event_name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`;

let initialized = false;

export async function ensureDatabase(db) {
  if (initialized) return;
  await db.batch([
    db.prepare(SESSION_SCHEMA),
    db.prepare(ERROR_SCHEMA),
    db.prepare(EVENT_SCHEMA),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_sessions_first_seen ON analytics_sessions(first_seen)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_sessions_visitor ON analytics_sessions(visitor_id)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_errors_created_at ON analytics_errors(created_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_events_created_at ON analytics_events(created_at)"),
  ]);
  initialized = true;
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}
