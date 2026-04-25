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
  ('name',     'พญ.อุรารี พรวรนันท์'),
  ('name_en',  'Dr. Uraree Pornwranan'),
  ('title',    'นายแพทย์ชำนาญการ · Hematologist'),
  ('hospital', 'กลุ่มงานอายุรศาสตร์ โรงพยาบาลสงฆ์ กรมการแพทย์'),
  ('site_title', 'Portfolio — พญ.อุรารี พรวรนันท์'),
  ('site_title_en', 'Portfolio — Dr. Uraree Pornwranan'),
  ('cover_name', 'พญ.อุรารี พรวรนันท์'),
  ('cover_name_en', 'Dr. Uraree Pornwranan'),
  ('cover_subtitle', 'Hematologist · Clinical Digital Health Developer'),
  ('cover_subtitle_en', 'Hematologist · Clinical Digital Health Developer'),
  ('avatar_url', ''),
  ('booking_url', 'https://calendar.app.google/gekwdUmq2j6bfWW27'),
  ('header_name', 'พญ.อุรารี พรวรนันท์'),
  ('header_name_en', 'Dr. Uraree Pornwranan'),
  ('header_tagline', 'HEMATOLOGIST · DIGITAL HEALTH'),
  ('header_tagline_en', 'HEMATOLOGIST · DIGITAL HEALTH'),
  ('education', '• แพทยศาสตร์บัณฑิต (มหิดล)
• วุฒิบัตรอายุรศาสตร์
• อนุสาขาโลหิตวิทยา (ศิริราช)'),
  ('education_en', ''),
  ('work_history', '• นายแพทย์ชำนาญการ โรงพยาบาลสงฆ์ กรมการแพทย์
• Clinical Digital Health Developer (Health Tech Tools)'),
  ('work_history_en', ''),
  ('awards', '[{\"title\":\"ตัวอย่างผลงาน/รางวัล\",\"url\":\"https://example.com\",\"image\":\"\",\"tags\":[\"press\",\"publication\"]}]'),
  ('headline', 'Hematologist | Clinical Digital Health Developer | Health Tech Tools for Real-world Practice'),
  ('headline_en', 'Hematologist | Clinical Digital Health Developer | Health Tech Tools for Real-world Practice'),
  ('bio',      'แพทย์ผู้เชี่ยวชาญด้านโลหิตวิทยา จบแพทยศาสตร์บัณฑิตมหาวิทยาลัยมหิดล ฝึกอบรมเฉพาะทางโลหิตวิทยาที่โรงพยาบาลศิริราช ปัจจุบันดำรงตำแหน่งนายแพทย์ชำนาญการ โรงพยาบาลสงฆ์ กรมการแพทย์ กระทรวงสาธารณสุข'),
  ('bio_en',   ''),
  ('bio2',     'นอกจากงานคลินิก ยังพัฒนา web applications สำหรับการตัดสินใจทางคลินิก การศึกษา และการบริหารงานในโรงพยาบาล ตั้งแต่ Stroke AI tools, Anticoagulation suite, CML management platform จนถึงระบบ queue management สำหรับพระภิกษุสงฆ์'),
  ('bio2_en',  ''),
  ('bio3',     'กำลังศึกษาหลักสูตร DigiHealth Program จุฬาลงกรณ์มหาวิทยาลัย เพื่อพัฒนาความเชี่ยวชาญด้าน Health Technology อย่างเป็นระบบ'),
  ('bio3_en',  ''),
  ('email',    ''),
  ('linkedin', ''),
  ('github',   'prhdev222'),
  ('interest', 'สนใจโอกาสด้าน Clinical Digital Health, Health Tech Consulting และ Medical Informatics'),
  ('interest_en', 'Open to opportunities in Clinical Digital Health, Health Tech Consulting, and Medical Informatics');

-- ─── Seed: Projects ───
INSERT OR IGNORE INTO projects (title, url, description, tags, color, sort_order) VALUES
  ('Stroke Fast Track', 'https://stroke-prh.pages.dev',
   'ระบบ NIHSS assessment + Refer form อัตโนมัติ + LINE OA แจ้งเตือน Neurologist ลดเวลาเตรียมเอกสาร 67%',
   '["Clinical AI","React","Cloudflare"]', '#0C7B93', 1),
  ('Anticoagulation Hub', 'https://coagulant-hub.pages.dev',
   'Warfarin, Heparin, DOAC, Caprini VTE, 4Ts HIT scoring, blood product cards ตาม NBC Thailand Ed.3 2023',
   '["Hematology","Decision Support","Cloudflare"]', '#7C3AED', 2),
  ('CML Clinical Tools', '',
   'NCCN 2026-based wizard, BCR-ABL tracker, patient education เพื่อนร่วมทาง CML, LINE bot TKI reminders',
   '["Oncology","LINE Bot","Patient Ed"]', '#B45309', 3),
  ('Thalassemia CDSS', '',
   'Clinical Decision Support ตาม TIF 2021 / ASH guidelines สำหรับ thalassemia management',
   '["React","Guidelines","Hematology"]', '#BE185D', 4),
  ('Hematology Chemo Orders', '',
   'CODOX-M, Hyper-CVAD, myeloma/CLL regimens, Carboplatin AUC calculator ตาม Siriraj manual',
   '["React+Vite","MongoDB","Oncology"]', '#065F46', 5),
  ('Med-Converter', '',
   'Medication reconciliation converter with AI fallback chain: Workers AI → Gemini → Groq + 137 drug rules',
   '["AI Chain","Cloudflare D1","Pharmacy"]', '#1D4ED8', 6);
