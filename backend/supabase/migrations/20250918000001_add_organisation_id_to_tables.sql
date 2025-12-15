-- Add organisation_id to content tables (not prompts - they're shared)
ALTER TABLE scenarios ADD COLUMN organisation_id VARCHAR(255) DEFAULT 'default' NOT NULL;
ALTER TABLE personas ADD COLUMN organisation_id VARCHAR(255) DEFAULT 'default' NOT NULL;

-- Add foreign key constraints
ALTER TABLE scenarios ADD FOREIGN KEY (organisation_id) REFERENCES organisations(id);
ALTER TABLE personas ADD FOREIGN KEY (organisation_id) REFERENCES organisations(id);