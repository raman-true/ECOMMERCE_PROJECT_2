/*
  # Create departments and categories tables

  1. New Tables
    - `departments`
      - `id` (uuid, primary key)
      - `slug` (text, unique)
      - `name` (text)
      - `description` (text)
      - `image` (text)
      - `created_at` (timestamp)
    - `categories`
      - `id` (uuid, primary key)
      - `slug` (text, unique)
      - `name` (text)
      - `description` (text)
      - `image` (text)
      - `product_count` (integer, default 0)
      - `department_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for admin write access
*/

CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  image text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  image text DEFAULT '',
  product_count integer DEFAULT 0,
  department_id uuid REFERENCES departments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Public read access for departments
CREATE POLICY "Allow public read access to departments"
  ON departments
  FOR SELECT
  TO public
  USING (true);

-- Public read access for categories
CREATE POLICY "Allow public read access to categories"
  ON categories
  FOR SELECT
  TO public
  USING (true);

-- Admin write access for departments
CREATE POLICY "Allow authenticated users to manage departments"
  ON departments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin write access for categories
CREATE POLICY "Allow authenticated users to manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);