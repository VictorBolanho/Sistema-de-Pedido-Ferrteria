BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_v2') THEN
    CREATE TYPE order_status_v2 AS ENUM (
      'pendiente',
      'en_proceso',
      'aprobado',
      'denegado',
      'reconsideracion'
    );
  END IF;
END$$;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS observations TEXT;

ALTER TABLE orders
ALTER COLUMN status DROP DEFAULT;

ALTER TABLE orders
ALTER COLUMN status TYPE order_status_v2
USING (
  CASE status::text
    WHEN 'draft' THEN 'pendiente'
    WHEN 'submitted' THEN 'pendiente'
    WHEN 'approved' THEN 'aprobado'
    WHEN 'rejected' THEN 'denegado'
    WHEN 'cancelled' THEN 'denegado'
    ELSE 'pendiente'
  END
)::order_status_v2;

ALTER TABLE orders
ALTER COLUMN status SET DEFAULT 'pendiente';

ALTER TABLE order_items
RENAME COLUMN line_total TO subtotal;

ALTER TABLE order_items
ALTER COLUMN subtotal TYPE NUMERIC(12, 2);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'order_items_line_total_check'
  ) THEN
    ALTER TABLE order_items DROP CONSTRAINT order_items_line_total_check;
  END IF;
END$$;

ALTER TABLE order_items
ADD CONSTRAINT order_items_subtotal_check CHECK (subtotal >= 0);

COMMIT;

