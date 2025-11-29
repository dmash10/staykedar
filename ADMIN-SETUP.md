# Admin Dashboard Setup Guide

This guide will help you set up the admin dashboard for StayKedarnath.

## Prerequisites

- Supabase account with access to your project
- Firebase account with access to your project
- Node.js installed on your machine

## Setup Steps

### 1. Create Required Tables in Supabase

You can run the SQL migration script in the Supabase SQL Editor:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase/migrations/20240317_admin_tables.sql`
4. Run the SQL script

Alternatively, you can use the setup script:

```bash
# First, install dependencies
npm install

# Then run the setup script (after updating the service key)
node setup-admin.js
```

> Note: Make sure to update the `SUPABASE_SERVICE_KEY` in `setup-admin.js` with your actual service role key from Supabase.

### 2. Admin Access

The admin dashboard is configured to grant access to:

1. The email address `ashutoshc1001@gmail.com` (hardcoded in the application)
2. Any user listed in the `admin_users` table in Supabase

When you log in with the admin email, you will be automatically redirected to the admin dashboard.

### 3. Security Features

The admin dashboard includes several security features:

- Email verification is required for admin access
- Admin status is checked both client-side and server-side
- Row-level security policies in Supabase restrict access to admin-only tables
- Firebase UID verification ensures the user is who they claim to be

### 4. Admin Dashboard Features

The admin dashboard includes:

1. **Blog Manager**: Create, edit, and publish blog posts with a rich text editor
2. **User Manager**: View and manage users, grant or revoke admin privileges
3. **Site Content Manager**: Manage site content like titles, descriptions, etc.
4. **Admin Settings**: Manage admin account settings

## Troubleshooting

If you're having issues accessing the admin dashboard:

1. Make sure your email is verified in Firebase
2. Check that your email is either `ashutoshc1001@gmail.com` or listed in the `admin_users` table
3. Check the browser console for any error messages
4. Verify that the Supabase tables and policies are set up correctly

## Security Best Practices

- Never share your admin credentials
- Regularly review the list of admin users in the `admin_users` table
- Monitor the admin dashboard access logs
- Keep your Firebase and Supabase credentials secure 