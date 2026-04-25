-- Add English fields to projects
ALTER TABLE projects ADD COLUMN title_en TEXT DEFAULT '';
ALTER TABLE projects ADD COLUMN description_en TEXT DEFAULT '';

