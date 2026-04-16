BEGIN;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE INDEX IF NOT EXISTS idx_products_image ON products(image_url);

COMMIT;
