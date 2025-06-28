/*
  # Create premium listings and plans tables

  1. New Tables
    - `premium_plans`
      - `id` (text, primary key) - Plan identifier
      - `name` (text) - Plan name
      - `price` (numeric) - Plan price
      - `currency` (text) - Currency code
      - `duration` (integer) - Duration in days
      - `description` (text) - Plan description
      - `features` (jsonb) - Plan features
      - `is_active` (boolean) - Whether plan is active
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `premium_listings`
      - `id` (uuid, primary key)
      - `property_id` (uuid) - Reference to listings table
      - `user_id` (uuid) - Reference to user_profiles table
      - `plan_id` (text) - Reference to premium_plans table
      - `status` (premium_status enum) - Listing status
      - `start_date` (timestamp) - When premium started
      - `end_date` (timestamp) - When premium expires
      - `payment_id` (uuid) - Reference to ad_payments table
      - Analytics fields for tracking performance
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own premium listings
    - Add policies for admins to manage all premium listings
    - Add policies for public to read active premium listings

  3. Indexes
    - Add indexes for performance on commonly queried fields
*/

-- Create premium_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS premium_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  price numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  duration integer NOT NULL,
  description text,
  features jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create premium_listings table if it doesn't exist
CREATE TABLE IF NOT EXISTS premium_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  user_id uuid NOT NULL,
  plan_id text NOT NULL,
  status premium_status NOT NULL DEFAULT 'pending',
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  payment_id uuid,
  analytics_views integer NOT NULL DEFAULT 0,
  analytics_inquiries integer NOT NULL DEFAULT 0,
  analytics_favorites integer NOT NULL DEFAULT 0,
  analytics_conversion_rate numeric(5,2) NOT NULL DEFAULT 0.00,
  analytics_daily_views jsonb,
  analytics_top_sources jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
  -- Add foreign key to listings table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_premium_property' 
    AND table_name = 'premium_listings'
  ) THEN
    ALTER TABLE premium_listings 
    ADD CONSTRAINT fk_premium_property 
    FOREIGN KEY (property_id) REFERENCES listings(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key to user_profiles table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_premium_user' 
    AND table_name = 'premium_listings'
  ) THEN
    ALTER TABLE premium_listings 
    ADD CONSTRAINT fk_premium_user 
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key to premium_plans table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_premium_plan' 
    AND table_name = 'premium_listings'
  ) THEN
    ALTER TABLE premium_listings 
    ADD CONSTRAINT fk_premium_plan 
    FOREIGN KEY (plan_id) REFERENCES premium_plans(id) ON DELETE RESTRICT;
  END IF;

  -- Add foreign key to ad_payments table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_premium_payment' 
    AND table_name = 'premium_listings'
  ) THEN
    ALTER TABLE premium_listings 
    ADD CONSTRAINT fk_premium_payment 
    FOREIGN KEY (payment_id) REFERENCES ad_payments(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_premium_listings_property_id ON premium_listings(property_id);
CREATE INDEX IF NOT EXISTS idx_premium_listings_user_id ON premium_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_listings_status ON premium_listings(status);
CREATE INDEX IF NOT EXISTS idx_premium_listings_dates ON premium_listings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_premium_listings_active ON premium_listings(status, end_date) WHERE status = 'active';

-- Enable RLS
ALTER TABLE premium_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_listings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for premium_plans
CREATE POLICY "Anyone can read active premium plans"
  ON premium_plans
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage premium plans"
  ON premium_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'superadmin')
    )
  );

-- RLS Policies for premium_listings
CREATE POLICY "Users can manage own premium listings"
  ON premium_listings
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all premium listings"
  ON premium_listings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Allow public read active premium listings"
  ON premium_listings
  FOR SELECT
  TO public
  USING (status = 'active' AND end_date > now());

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_premium_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_premium_listings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_premium_plans_updated_at'
  ) THEN
    CREATE TRIGGER update_premium_plans_updated_at
      BEFORE UPDATE ON premium_plans
      FOR EACH ROW
      EXECUTE FUNCTION update_premium_plans_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_premium_listings_updated_at'
  ) THEN
    CREATE TRIGGER update_premium_listings_updated_at
      BEFORE UPDATE ON premium_listings
      FOR EACH ROW
      EXECUTE FUNCTION update_premium_listings_updated_at();
  END IF;
END $$;

-- Insert default premium plan
INSERT INTO premium_plans (id, name, price, currency, duration, description, features, is_active)
VALUES (
  'premium-monthly',
  'Premium Listing',
  29.99,
  'USD',
  30,
  'Boost your property visibility with premium features',
  '[
    "Featured placement at top of search results",
    "Golden highlighted border", 
    "Larger photo gallery (up to 20 images)",
    "Extended listing duration (30 days)",
    "Virtual tour integration",
    "Detailed analytics dashboard",
    "Priority customer support",
    "Social media promotion"
  ]'::jsonb,
  true
)
ON CONFLICT (id) DO NOTHING;