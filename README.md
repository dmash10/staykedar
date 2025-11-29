# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b26923f2-e735-488d-98dc-ef024dace9c7

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b26923f2-e735-488d-98dc-ef024dace9c7) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b26923f2-e735-488d-98dc-ef024dace9c7) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

## Database Setup

If you're experiencing issues with the "Failed to load available rooms" error or other database-related issues, follow these steps to set up the required database functions:

1. Log in to your Supabase dashboard: https://app.supabase.com/
2. Select your project
3. Go to the SQL Editor (in the left sidebar)
4. Create a new query
5. Copy the contents of the following file and paste it into the query editor:
   ```
   src/integrations/supabase/migrations/setup_functions.sql
   ```
6. Run the query

This will create or replace the following functions in your Supabase database:
- `check_room_availability`: Checks if a room is available for a given date range
- `find_available_rooms`: Finds available rooms based on search criteria
- `update_room_status`: Updates the status of a room and logs the change
- `create_booking`: Creates a new booking for a room

These functions are essential for the room search and booking functionality to work correctly.

### Troubleshooting

If you're still experiencing issues after running the SQL migrations:

1. Check that all tables are created correctly by looking at the Table Editor in Supabase
2. Make sure you have rooms with status set to 'available'
3. Check that the `uuid-ossp` extension is enabled in your database
4. Look for any errors in the browser console

For property owners, you can fix the status of your existing rooms by using the "Fix Status" button on the Property Management page.
