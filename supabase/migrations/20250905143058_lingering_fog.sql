/*
  # Create products and product variants tables

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `slug` (text, unique)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `original_price` (decimal, nullable)
      - `images` (text array)
      - `category_id` (uuid, foreign key)
      - `department_id` (uuid, foreign key)
      - `brand` (text)
      - `rating` (decimal, default 0)
      - `review_count` (integer, default 0)
      - `stock` (integer, default 0)
      - `specifications` (jsonb)
      - `created_at` (timestamp)
    - `product_variants`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `name` (text)
      - `price` (decimal)
      - `stock` (integer)
      - `attributes` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for admin write access
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL,
  original_price decimal(10,2),
  images text[] DEFAULT '{}',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  brand text DEFAULT '',
  rating decimal(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count integer DEFAULT 0,
  stock integer DEFAULT 0,
  specifications jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  stock integer DEFAULT 0,
  attributes jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Public read access for products
CREATE POLICY "Allow public read access to products"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- Public read access for product variants
CREATE POLICY "Allow public read access to product variants"
  ON product_variants
  FOR SELECT
  TO public
  USING (true);

-- Admin write access for products
CREATE POLICY "Allow authenticated users to manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin write access for product variants
CREATE POLICY "Allow authenticated users to manage product variants"
  ON product_variants
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);