-- Migration: 0011_public_quotations.sql
-- Modify quotations table for public quote requests and add RLS

ALTER TABLE quotations
ALTER COLUMN client_id DROP NOT NULL,
ADD COLUMN guest_name text,
ADD COLUMN guest_phone text,
ADD COLUMN details text;

-- Enable RLS on quotations if not already enabled
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated full access on quotations"
ON quotations FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow anonymous users to ONLY insert
CREATE POLICY "Allow anon insert on quotations"
ON quotations FOR INSERT
TO anon
WITH CHECK (
  status = 'draft'
);
