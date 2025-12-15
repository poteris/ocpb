-- Remove secondary and accent color columns from organisations table
ALTER TABLE organisations 
DROP COLUMN secondary_color,
DROP COLUMN accent_color;
