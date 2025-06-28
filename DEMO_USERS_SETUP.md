# Demo Users Setup Instructions

The demo users are now automatically created when you run the database migrations. No manual setup is required!

## Available Demo Users

After running the migration, you can log in with these credentials:

### Admin User
- **Email**: `admin@propertipro.id`
- **Password**: `admin123`
- **Role**: Admin
- **Access**: Can manage users, properties, and system settings

### Super Admin User
- **Email**: `superadmin@propertipro.id`
- **Password**: `admin123`
- **Role**: Super Admin
- **Access**: Full system access including admin management

### Test User
- **Email**: `user@propertipro.id`
- **Password**: `user123`
- **Role**: Regular User
- **Access**: Can create and manage their own property listings

### Agent User
- **Email**: `agent@propertipro.id`
- **Password**: `agent123`
- **Role**: Agent
- **Access**: Enhanced user permissions for property management

## How It Works

The demo users are created automatically through a database migration that:

1. **Creates Authentication Users**: Inserts users into Supabase's `auth.users` table with confirmed emails
2. **Creates User Profiles**: Automatically creates corresponding profiles with appropriate roles
3. **Sets Up Permissions**: Ensures users have the correct access levels based on their roles

## Verification

After running the migration:
1. Try logging in with any of the demo credentials above
2. Check that you can access the appropriate dashboard based on the user role
3. Verify that the user profiles are properly linked and roles are correctly assigned

## Security Notes

**Important**: These are demo credentials for development only. In production:

- **Remove or change these default passwords**
- **Use strong, unique passwords**
- **Consider implementing additional security measures**
- **Remove this setup file from production deployments**
- **Delete the demo users migration file before deploying to production**

## Troubleshooting

If login still fails after running the migration:

1. **Check Migration Status**: Ensure the migration ran successfully in your Supabase dashboard
2. **Verify Database Connection**: Make sure your `.env` file has the correct Supabase credentials
3. **Check Supabase Logs**: Look for any errors in the Supabase dashboard logs
4. **Clear Browser Cache**: Sometimes cached authentication data can cause issues

## Manual Verification (Optional)

You can verify the users were created by checking in your Supabase dashboard:
1. Go to Authentication > Users
2. You should see the four demo users listed
3. All should have "Email Confirmed" status