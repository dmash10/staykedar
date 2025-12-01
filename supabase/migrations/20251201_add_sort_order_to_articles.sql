-- Add sort_order column to help_articles table
ALTER TABLE help_articles ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
