-- Add Vaultwarden password manager to uraree.com/secondbrain.
DELETE FROM menu_links WHERE url = 'https://vault.uraree.com';

INSERT INTO menu_links (title, url, description, category, keywords, favorite, visible, sort_order) VALUES
  ('Vaultwarden', 'https://vault.uraree.com', 'Self-hosted Bitwarden-compatible password manager on pi5-hermes. Use the Bitwarden app with server URL vault.uraree.com.', 'Infrastructure', '["password","vaultwarden","bitwarden","security","credentials"]', 0, 1, 5);
