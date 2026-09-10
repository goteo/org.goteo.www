-- Home hero block managed from /admin/home/hero
-- Timestamps are milliseconds (Date.getTime()), matching the repository layer.
CREATE TABLE IF NOT EXISTS home_hero (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    title               TEXT    NOT NULL,
    content             TEXT    NOT NULL,
    primary_cta_text    TEXT,
    primary_cta_link    TEXT,
    secondary_cta_text  TEXT,
    secondary_cta_link  TEXT,
    media_url           TEXT,
    media_type          TEXT,
    starts_at           INTEGER NOT NULL,
    ends_at             INTEGER NOT NULL,
    date_created        INTEGER NOT NULL
);
