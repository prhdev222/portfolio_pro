CREATE TABLE IF NOT EXISTS menu_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'Other',
  keywords TEXT DEFAULT '[]',
  favorite INTEGER DEFAULT 0,
  visible INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_menu_links_order
ON menu_links (favorite DESC, sort_order ASC, title ASC);
