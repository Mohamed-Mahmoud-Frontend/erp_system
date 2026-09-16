-- IF NOT EXISTS supports installations with a manually added parsed_items.
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS parsed_items jsonb NOT NULL DEFAULT '{"products":[],"transportation_cost":0}'::jsonb;
ALTER TABLE public.quotations
  ADD COLUMN share_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE;

-- The old route did not persist shipping alongside these arrays.
UPDATE public.quotations
SET parsed_items = jsonb_build_object('products', parsed_items, 'transportation_cost', 0)
WHERE jsonb_typeof(parsed_items) = 'array';
UPDATE public.quotations
SET parsed_items = '{"products":[],"transportation_cost":0}'::jsonb
WHERE parsed_items IS NULL;
ALTER TABLE public.quotations
  ALTER COLUMN parsed_items SET DEFAULT '{"products":[],"transportation_cost":0}'::jsonb,
  ALTER COLUMN parsed_items SET NOT NULL;

-- A bearer token grants SELECT on exactly one row, even for an unfiltered
-- list query. Knowing an id alone grants nothing. This grants no writes.
CREATE POLICY "Read quotation with its share token"
ON public.quotations FOR SELECT TO anon
USING (
  share_token::text = nullif(
    nullif(current_setting('request.headers', true), '')::jsonb ->> 'x-quotation-token', ''
  )
);

-- Visitors can request quotes but cannot set prices, share tokens or internal links.
DROP POLICY "Allow anon insert on quotations" ON public.quotations;
CREATE POLICY "Allow anon insert on quotations"
ON public.quotations FOR INSERT TO anon
WITH CHECK (
  status = 'draft' AND client_id IS NULL AND factory_id IS NULL
  AND converted_order_id IS NULL AND pdf_url IS NULL
  AND parsed_items = '{"products":[],"transportation_cost":0}'::jsonb
);
REVOKE INSERT, UPDATE, DELETE ON public.quotations FROM anon;
GRANT INSERT (guest_name, guest_phone, details, status) ON public.quotations TO anon;
GRANT SELECT ON public.quotations TO anon;

COMMENT ON COLUMN public.quotations.share_token IS
  'Private bearer capability for read-only sharing of this one quotation. Do not publish or index.';
