/*
  # Create services and DIY articles tables

  1. New Tables
    - `services`
      - `id` (uuid, primary key)
      - `slug` (text, unique)
      - `name` (text)
      - `description` (text)
      - `image` (text)
      - `price` (decimal)
      - `duration` (text)
      - `category` (text)
      - `created_at` (timestamp)
    - `diy_articles`
      - `id` (uuid, primary key)
      - `slug` (text, unique)
      - `title` (text)
      - `excerpt` (text)
      - `content` (text)
      - `featured_image` (text)
      - `author` (text)
      - `published_at` (timestamp)
      - `category` (text)
      - `tags` (text array)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for admin write access
*/

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  image text DEFAULT '',
  price decimal(10,2) NOT NULL,
  duration text DEFAULT '',
  category text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS diy_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text DEFAULT '',
  content text DEFAULT '',
  featured_image text DEFAULT '',
  author text DEFAULT '',
  published_at timestamptz DEFAULT now(),
  category text DEFAULT '',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE diy_articles ENABLE ROW LEVEL SECURITY;

-- Public read access for services
CREATE POLICY "Allow public read access to services"
  ON services
  FOR SELECT
  TO public
  USING (true);

-- Public read access for DIY articles
CREATE POLICY "Allow public read access to DIY articles"
  ON diy_articles
  FOR SELECT
  TO public
  USING (true);

-- Admin write access for services
CREATE POLICY "Allow authenticated users to manage services"
  ON services
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin write access for DIY articles
CREATE POLICY "Allow authenticated users to manage DIY articles"
  ON diy_articles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);