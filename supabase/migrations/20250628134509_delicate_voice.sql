/*
  # Create Demo Users for Development

  1. New Demo Users
    - Creates demo authentication users and their profiles
    - Admin user: admin@propertipro.id
    - Super Admin user: superadmin@propertipro.id
    - Regular user: user@propertipro.id
    - Agent user: agent@propertipro.id

  2. Security
    - All users have confirmed emails
    - Passwords are hashed using Supabase's auth system
    - User profiles are automatically created with appropriate roles

  3. Important Notes
    - This is for development/demo purposes only
    - In production, remove this migration or change passwords
    - Users can log in immediately after migration runs
*/

-- Insert demo users into auth.users table
-- Note: This requires admin privileges and should only be used in development

DO $$
BEGIN
  -- Check if we're in a development environment (optional safety check)
  -- You can remove this check if you want to run in any environment
  
  -- Insert Admin User
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'admin@propertipro.id',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Admin User"}',
    false,
    'authenticated'
  ) ON CONFLICT (id) DO NOTHING;

  -- Insert Super Admin User
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'superadmin@propertipro.id',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Super Admin User"}',
    false,
    'authenticated'
  ) ON CONFLICT (id) DO NOTHING;

  -- Insert Regular User
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'user@propertipro.id',
    crypt('user123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Test User"}',
    false,
    'authenticated'
  ) ON CONFLICT (id) DO NOTHING;

  -- Insert Agent User
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  ) VALUES (
    '44444444-4444-4444-4444-444444444444',
    '00000000-0000-0000-0000-000000000000',
    'agent@propertipro.id',
    crypt('agent123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Agent User"}',
    false,
    'authenticated'
  ) ON CONFLICT (id) DO NOTHING;

END $$;

-- Create user profiles for the demo users
INSERT INTO user_profiles (
  id,
  full_name,
  role,
  status,
  created_at,
  updated_at
) VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    'Admin User',
    'admin',
    'active',
    now(),
    now()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Super Admin User',
    'superadmin',
    'active',
    now(),
    now()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Test User',
    'user',
    'active',
    now(),
    now()
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Agent User',
    'agent',
    'active',
    now(),
    now()
  )
ON CONFLICT (id) DO NOTHING;