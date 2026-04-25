-- Add English fields to articles
ALTER TABLE articles ADD COLUMN title_en TEXT DEFAULT '';
ALTER TABLE articles ADD COLUMN summary_en TEXT DEFAULT '';
ALTER TABLE articles ADD COLUMN content_en TEXT DEFAULT '';

