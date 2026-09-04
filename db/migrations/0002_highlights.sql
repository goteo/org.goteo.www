CREATE TABLE IF NOT EXISTS highlights (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    type            TEXT    NOT NULL DEFAULT 'recent',
    layout          TEXT    NOT NULL DEFAULT '2x3',
    date_created    INTEGER NOT NULL DEFAULT (unixepoch()),
    date_updated    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS highlight_slots (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    highlight_id    INTEGER NOT NULL REFERENCES highlights(id) ON DELETE CASCADE,
    position        INTEGER NOT NULL,
    project_slug    TEXT    NOT NULL,
    UNIQUE(highlight_id, position)
);
