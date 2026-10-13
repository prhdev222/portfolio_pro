-- Add AI Ethics & PDPA study notes to uraree.com/secondbrain.
DELETE FROM menu_links WHERE url = 'https://aipdpa.uraree.com';

INSERT INTO menu_links (title, url, description, category, keywords, favorite, visible, sort_order) VALUES
  ('AI Ethics & PDPA Notes', 'https://aipdpa.uraree.com', 'Study notes from two Digital Health lectures: AI ethics and governance for healthcare, and PDPA for digital health. Served from pi5-hermes.', 'Reference', '["ai governance","ethics","pdpa","privacy","digital health","lecture notes"]', 0, 1, 4);
