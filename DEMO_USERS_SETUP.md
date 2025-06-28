# Demo Users Setup Instructions

After running the migration, you need to manually create the authentication users in your Supabase dashboard:

## Step 1: Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users

## Step 2: Create Demo Users

### Admin User
- **Email**: `admin@propertipro.id`
- **Password**: `admin123`
- **User ID**: `11111111-1111-1111-1111-111111111111`
- **Email Confirmed**: Yes

### Super Admin User
- **Email**: `superadmin@propertipro.id`
- **Password**: `admin123`
- **User ID**: `22222222-2222-2222-2222-222222222222`
- **Email Confirmed**: Yes

### Test User (Optional)
- **Email**: `user@propertipro.id`
- **Password**: `user123`
- **User ID**: `33333333-3333-3333-3333-333333333333`
- **Email Confirmed**: Yes

### Agent User (Optional)
- **Email**: `agent@propertipro.id`
- **Password**: `agent123`
- **User ID**: `44444444-4444-4444-4444-444444444444`
- **Email Confirmed**: Yes

## Step 3: Manual Creation Process

1. Click "Add user" in the Supabase dashboard
2. Choose "Create a new user"
3. Enter the email and password
4. **Important**: Set the User ID to the specific UUID mentioned above
5. Make sure "Email confirmed" is checked
6. Click "Create user"

## Alternative: Using Supabase CLI (if available)

If you have Supabase CLI access, you can create users programmatically:

```sql
-- This would need to be run in the Supabase SQL editor or via API
-- Note: Direct auth.users insertion is not recommended in production
```

## Verification

After creating the users:
1. Try logging in with the demo credentials
2. Check that the user profiles are properly linked
3. Verify that the roles are correctly assigned

## Security Note

**Important**: These are demo credentials for development only. In production:
- Remove or change these default passwords
- Use strong, unique passwords
- Consider implementing additional security measures
- Remove this setup file from production deployments