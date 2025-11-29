// Script to set up admin tables and user
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Replace with your Supabase URL and service role key (not the anon key)
const SUPABASE_URL = "https://ijfabvuypewvmbpumxer.supabase.co";
const SUPABASE_SERVICE_KEY = "your-service-role-key"; // Get this from Supabase dashboard

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupAdmin() {
  try {
    console.log('Setting up admin tables and user...');
    
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'supabase/migrations/20240317_admin_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error executing SQL:', error);
      return;
    }
    
    console.log('Admin tables and user set up successfully!');
    
    // Verify admin user exists
    const { data, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'ashutoshc1001@gmail.com');
    
    if (fetchError) {
      console.error('Error fetching admin user:', fetchError);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Admin user exists:', data[0].email);
    } else {
      console.log('Admin user not found. Creating...');
      
      // Create admin user if not exists
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({
          email: 'ashutoshc1001@gmail.com',
          firebase_uid: 'placeholder-uid',
          name: 'Admin User',
          created_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error creating admin user:', insertError);
      } else {
        console.log('Admin user created successfully!');
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

setupAdmin(); 