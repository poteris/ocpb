-- Add branding fields to organisations table
ALTER TABLE organisations 
ADD COLUMN logo_url TEXT,
ADD COLUMN primary_color VARCHAR(7) DEFAULT '#3B82F6',
ADD COLUMN secondary_color VARCHAR(7) DEFAULT '#F59E0B', 
ADD COLUMN accent_color VARCHAR(7) DEFAULT '#EF4444';

-- Update default organisation with some example colors
UPDATE organisations 
SET 
    primary_color = '#2563EB',
    secondary_color = '#F59E0B',
    accent_color = '#EF4444'
WHERE id = 'default';


