-- Add optional image URL to project cards
-- Safe to run once. If you already added the column, remove this migration or skip it.

ALTER TABLE projects ADD COLUMN image_url TEXT DEFAULT '';

