-- Standalone documents; no invoice, payment, or stock mutation.
CREATE FUNCTION public.valid_delivery_items(items jsonb) RETURNS boolean
LANGUAGE plpgsql IMMUTABLE SET search_path=public AS $$
DECLARE item jsonb; qty numeric;
BEGIN
 IF jsonb_typeof(items) IS DISTINCT FROM 'array' THEN RETURN false; END IF;
 IF jsonb_array_length(items) NOT BETWEEN 1 AND 100 THEN RETURN false; END IF;
 FOR item IN SELECT value FROM jsonb_array_elements(items) LOOP
  IF jsonb_typeof(item) IS DISTINCT FROM 'object'
    OR jsonb_typeof(item->'description') IS DISTINCT FROM 'string'
    OR jsonb_typeof(item->'unit') IS DISTINCT FROM 'string'
    OR jsonb_typeof(item->'quantity') IS DISTINCT FROM 'number' THEN RETURN false; END IF;
  IF length(btrim(item->>'description')) NOT BETWEEN 1 AND 500
    OR length(btrim(item->>'unit')) NOT BETWEEN 1 AND 40 THEN RETURN false; END IF;
  qty := (item->>'quantity')::numeric;
  IF qty <= 0 OR qty > 1000000 OR qty <> round(qty,3) THEN RETURN false; END IF;
 END LOOP;
 RETURN true;
END;
$$;
CREATE TABLE public.delivery_notes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 note_number bigint GENERATED ALWAYS AS IDENTITY UNIQUE NOT NULL,
 delivery_date date NOT NULL CHECK(delivery_date BETWEEN DATE '0001-01-01' AND DATE '9999-12-31'),
 customer_name text NOT NULL CHECK(length(btrim(customer_name)) BETWEEN 1 AND 200),
 recipient_name text NOT NULL CHECK(length(btrim(recipient_name)) BETWEEN 1 AND 200),
 recipient_phone text NOT NULL DEFAULT '' CHECK(length(recipient_phone)<=40),
 delivery_address text NOT NULL DEFAULT '' CHECK(length(delivery_address)<=500),
 driver_name text NOT NULL DEFAULT '' CHECK(length(driver_name)<=200),
 vehicle_number text NOT NULL DEFAULT '' CHECK(length(vehicle_number)<=80),
 notes text NOT NULL DEFAULT '' CHECK(length(notes)<=2000),
 items jsonb NOT NULL CHECK(public.valid_delivery_items(items)),
 created_at timestamptz NOT NULL DEFAULT now(),
 created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id)
);
CREATE INDEX delivery_notes_date_idx ON public.delivery_notes(delivery_date DESC,note_number DESC);
ALTER TABLE public.delivery_notes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.delivery_notes FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.delivery_notes TO authenticated;
GRANT INSERT(id,delivery_date,customer_name,recipient_name,recipient_phone,delivery_address,driver_name,vehicle_number,notes,items) ON public.delivery_notes TO authenticated;
GRANT ALL ON public.delivery_notes TO service_role;
GRANT USAGE,SELECT ON SEQUENCE public.delivery_notes_note_number_seq TO authenticated,service_role;
CREATE POLICY delivery_read ON public.delivery_notes FOR SELECT TO authenticated
 USING(public.has_permission('sales') OR public.has_permission('production'));
CREATE POLICY delivery_insert ON public.delivery_notes FOR INSERT TO authenticated
 WITH CHECK((public.has_permission('sales') OR public.has_permission('production')) AND created_by=auth.uid());
