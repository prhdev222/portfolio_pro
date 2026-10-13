-- Add ML Learning Hub to uraree.com/secondbrain.
DELETE FROM menu_links WHERE url = 'https://ml.uraree.com';

INSERT INTO menu_links (title, url, description, category, keywords, favorite, visible, sort_order) VALUES
  ('ML Learning Hub', 'https://ml.uraree.com', 'Machine learning practice hub on pi5-hermes: JupyterLab, MLflow, Mercury, Mage, and Postgres. Protected by Cloudflare Access.', 'Research', '["machine learning","jupyter","mlflow","mercury","mage","postgres","raspberry pi"]', 0, 1, 6);
