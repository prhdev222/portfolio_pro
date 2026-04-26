ALTER TABLE articles ADD COLUMN external_url TEXT DEFAULT '';
ALTER TABLE articles ADD COLUMN external_label TEXT DEFAULT '';
ALTER TABLE articles ADD COLUMN external_label_en TEXT DEFAULT '';
ALTER TABLE articles ADD COLUMN source_type TEXT DEFAULT 'website';
