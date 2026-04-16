BEGIN;

ALTER TABLE commissions
RENAME COLUMN commission_rate TO percentage;

ALTER TABLE commissions
RENAME COLUMN commission_amount TO value;

ALTER TABLE commissions
DROP COLUMN IF EXISTS calculated_at;

ALTER TABLE commissions
ALTER COLUMN percentage TYPE NUMERIC(5, 2);

ALTER TABLE commissions
ALTER COLUMN value TYPE NUMERIC(12, 2);

CREATE INDEX IF NOT EXISTS idx_commissions_advisor_id ON commissions(advisor_id);

COMMIT;

