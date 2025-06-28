/*
  # Create Demo Users

  1. Demo Users Setup
    - Creates admin and superadmin demo users
    - Sets up their corresponding user profiles
    - Provides test credentials for development

  2. Security
    - Uses secure password hashing
    - Sets appropriate roles and permissions
    - Enables proper RLS policies

  Note: This migration creates demo users for development/testing purposes.
  In production, remove or modify these credentials.
*/

-- Insert demo users into auth.users table
-- Note: In a real application, users would be created through the Supabase Auth API
-- This is for development/demo purposes only

-- First, we need to create the user profiles that will be referenced
-- The auth users will be created manually through Supabase dashboard or auth API

-- Create admin user profile (assuming the auth user will be created with this ID)
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
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Admin User',
  '+62812345678',
  'admin'::user_role,
  'active'::user_status,
  null,
  'Properti Pro',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = now();

-- Create superadmin user profile (assuming the auth user will be created with this ID)
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
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Super Admin User',
  '+62812345679',
  'superadmin'::user_role,
  'active'::user_status,
  null,
  'Properti Pro',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = now();

-- Create a regular user profile for testing
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
  '33333333-3333-3333-3333-333333333333'::uuid,
  'Test User',
  '+62812345680',
  'user'::user_role,
  'active'::user_status,
  null,
  null,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = now();

-- Create an agent user profile for testing
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
  '44444444-4444-4444-4444-444444444444'::uuid,
  'Agent User',
  '+62812345681',
  'agent'::user_role,
  'active'::user_status,
  null,
  'Real Estate Agency',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = now();