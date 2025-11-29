/**
 * This script runs SQL migrations against your Supabase database.
 * 
 * To use:
 * 1. Make sure you have the Supabase CLI installed
 * 2. Run: node scripts/run_migration.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables. Please check your .env file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Path to migrations
const MIGRATIONS_DIR = path.join(__dirname, '../src/integrations/supabase/migrations');

// Get all migration files
const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
  .filter(file => file.endsWith('.sql'))
  .sort(); // Sort to ensure proper order

if (migrationFiles.length === 0) {
  console.error('No migration files found in:', MIGRATIONS_DIR);
  process.exit(1);
}

console.log('Found migration files:');
migrationFiles.forEach(file => console.log(`- ${file}`));

// Run each migration
migrationFiles.forEach(file => {
  const filePath = path.join(MIGRATIONS_DIR, file);
  const sql = fs.readFileSync(filePath, 'utf-8');
  
  console.log(`\nRunning migration: ${file}`);
  
  try {
    // Create a temporary file
    const tempFile = path.join(__dirname, `temp_${Date.now()}.sql`);
    fs.writeFileSync(tempFile, sql);
    
    // Run the SQL against Supabase
    const command = `supabase db push --file ${tempFile} --db-url postgresql://postgres:${SUPABASE_SERVICE_KEY}@${SUPABASE_URL.replace('https://', '')}/postgres`;
    
    console.log('Executing command:', command.replace(SUPABASE_SERVICE_KEY, '***********'));
    execSync(command, { stdio: 'inherit' });
    
    // Clean up temp file
    fs.unlinkSync(tempFile);
    
    console.log(`Migration ${file} completed successfully!`);
  } catch (error) {
    console.error(`Error running migration ${file}:`, error.message);
    process.exit(1);
  }
});

console.log('\nAll migrations completed successfully!'); 