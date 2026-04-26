-- ─── Portfolio Pro: D1 Schema ───
-- รัน: wrangler d1 execute portfolio-db --file=schema.sql

CREATE TABLE IF NOT EXISTS passwords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  hospital_name TEXT NOT NULL,
  role TEXT DEFAULT 'viewer',        -- 'admin' | 'viewer'
  note TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  last_access TEXT
);

CREATE TABLE IF NOT EXISTS profile (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  tags TEXT DEFAULT '[]',            -- JSON array
  color TEXT DEFAULT '#0C7B93',
  sort_order INTEGER DEFAULT 0,
  visible INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',           -- markdown / rich text
  summary TEXT DEFAULT '',
  published INTEGER DEFAULT 0,       -- 0=draft, 1=published
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ─── Seed: Admin password ───
INSERT OR IGNORE INTO passwords (code, hospital_name, role, note)
VALUES ('admin1234', 'Admin', 'admin', 'รหัส admin หลัก — เปลี่ยนทันทีหลัง deploy');

-- ─── Seed: Default profile ───
INSERT OR IGNORE INTO profile (key, value) VALUES
  ('name',     ''),
  ('name_en',  ''),
  ('site_title', 'Portfolio'),
  ('site_title_en', 'Portfolio'),
  ('cover_name', ''),
  ('cover_name_en', ''),
  ('cover_subtitle', ''),
  ('cover_subtitle_en', ''),
  ('avatar_url', ''),
  ('booking_url', ''),
  ('header_name', ''),
  ('header_name_en', ''),
  ('header_tagline', ''),
  ('header_tagline_en', ''),
  ('education', ''),
  ('education_en', ''),
  ('work_history', ''),
  ('work_history_en', ''),
  ('awards', '[]'),
  ('awards_en', '[]'),
  ('headline', ''),
  ('headline_en', ''),
  ('bio',      ''),
  ('bio_en',   ''),
  ('bio2',     ''),
  ('bio2_en',  ''),
  ('bio3',     ''),
  ('bio3_en',  ''),
  ('email',    ''),
  ('linkedin', ''),
  ('line_oa',  ''),
  ('github',   ''),
  ('interest', ''),
  ('interest_en', '');

-- ─── Seed: Projects ───
-- (optional) You can add projects later from the Admin UI.
