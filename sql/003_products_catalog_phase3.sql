BEGIN;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0);

ALTER TABLE products
ADD COLUMN IF NOT EXISTS category VARCHAR(120) NOT NULL DEFAULT 'general';

ALTER TABLE products
ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE products
SET active = is_active
WHERE active IS DISTINCT FROM is_active;

ALTER TABLE products
DROP COLUMN IF EXISTS is_active;

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

COMMIT;

