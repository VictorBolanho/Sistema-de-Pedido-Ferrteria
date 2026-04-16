BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'access_request_status') THEN
    CREATE TYPE access_request_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(200) NOT NULL,
  tax_id VARCHAR(50) NOT NULL UNIQUE,
  contact_name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  address TEXT NOT NULL,
  rut_file_url TEXT,
  chamber_file_url TEXT,
  id_file_url TEXT,
  status access_request_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests (status);
CREATE INDEX IF NOT EXISTS idx_access_requests_email ON access_requests (email);
CREATE INDEX IF NOT EXISTS idx_access_requests_created_at ON access_requests (created_at DESC);

COMMIT;
