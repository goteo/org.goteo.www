-- Persistent sessions table for auth
CREATE TABLE IF NOT EXISTS sessions (
    id         TEXT PRIMARY KEY,
    token_type TEXT    NOT NULL DEFAULT 'Bearer',
    scope      TEXT,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    user_id    TEXT,
    user_email TEXT,
    user_name  TEXT
);

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id   ON sessions(user_id);
