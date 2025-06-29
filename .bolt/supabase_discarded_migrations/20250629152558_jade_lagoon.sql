/*
  # Add Demo Users for Testing

  1. New Users
    - Creates demo admin and superadmin users in auth.users table
    - Creates corresponding user profiles in user_profiles table
  
  2. Demo Credentials
    - Admin: admin@propertipro.id / admin123
    - Super Admin: superadmin@propertipro.id / admin123
  
  3. Security
    - Users are created with proper authentication setup
    - Profiles are linked correctly with appropriate roles
*/

-- Insert demo users into auth.users table
-- Note: In production, users should be created through the signup process
-- This is only for demo/testing purposes

-- Insert admin user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'admin@propertipro.id',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Insert superadmin user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'superadmin@propertipro.id',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Insert corresponding user profiles
INSERT INTO user_profiles (
  id,
  full_name,
  phone,
  role,
  status,
  avatar_url,
  company,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Admin User',
  '+62812345678',
  'admin',
  'active',
  null,
  'Properti Pro',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO user_profiles (
  id,
  full_name,
  phone,
  role,
  status,
  avatar_url,
  company,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Super Admin User',
  '+62812345679',
  'superadmin',
  'active',
  null,
  'Properti Pro',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;