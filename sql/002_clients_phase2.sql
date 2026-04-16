BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_status') THEN
    CREATE TYPE client_status AS ENUM ('pendiente', 'activo', 'bloqueado');
  END IF;
END$$;

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS status client_status NOT NULL DEFAULT 'pendiente';

UPDATE clients
SET status = CASE
  WHEN is_validated = TRUE THEN 'activo'::client_status
  ELSE 'pendiente'::client_status
END
WHERE status IS NULL;

ALTER TABLE clients
ALTER COLUMN advisor_id SET NOT NULL;

CREATE TABLE IF NOT EXISTS historial_asesores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  advisor_id UUID NOT NULL REFERENCES advisors(id),
  assigned_by_user_id UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_historial_asesores_client_id ON historial_asesores(client_id);
CREATE INDEX IF NOT EXISTS idx_historial_asesores_advisor_id ON historial_asesores(advisor_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

COMMIT;

