-- First, ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('organization-assets', 'organization-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
DROP POLICY IF EXISTS "Organization Upload" ON storage.objects;
DROP POLICY IF EXISTS "Organization Update" ON storage.objects;
DROP POLICY IF EXISTS "Organization Delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read for organization assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert for organization assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update for organization assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete for organization assets" ON storage.objects;

-- Create policies that allow service role to do everything
CREATE POLICY "Service role can do everything" ON storage.objects
FOR ALL USING (true);

-- Allow public read access for displaying logos
CREATE POLICY "Public can read organization assets" ON storage.objects
FOR SELECT USING (bucket_id = 'organization-assets');
