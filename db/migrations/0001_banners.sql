-- Home/platform banners managed from /admin/comm
CREATE TABLE IF NOT EXISTS banners (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    description TEXT    NOT NULL,
    cta_text    TEXT    NOT NULL,
    cta_link    TEXT    NOT NULL,
    starts_at   INTEGER NOT NULL,
    ends_at     INTEGER NOT NULL,
    created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Per-column, per-locale overrides for any table. The base row always holds the
-- default locale (es), so rows here only exist for the remaining locales.
CREATE TABLE IF NOT EXISTS translations (
    table_name  TEXT NOT NULL,
    row_id      INTEGER NOT NULL,
    column_name TEXT NOT NULL,
    locale      TEXT NOT NULL,
    value       TEXT NOT NULL,
    PRIMARY KEY (table_name, row_id, column_name, locale)
);
