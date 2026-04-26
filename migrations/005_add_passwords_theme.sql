-- Add theme fields per hospital/password
ALTER TABLE passwords ADD COLUMN theme_preset TEXT DEFAULT 'confident';
ALTER TABLE passwords ADD COLUMN theme_overrides TEXT DEFAULT '';

