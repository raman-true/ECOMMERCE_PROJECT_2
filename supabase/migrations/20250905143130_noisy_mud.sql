/*
  # Insert sample data for testing

  1. Sample Data
    - Insert departments and categories
    - Insert sample products
    - Insert sample services
    - Insert sample DIY articles

  2. Notes
    - This data matches the existing constants in the application
    - Use this for development and testing purposes
*/

-- Insert departments
INSERT INTO departments (id, slug, name, description, image) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'building-hardware', 'Building & Hardware', 'Essential building materials and hardware supplies', 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg'),
  ('550e8400-e29b-41d4-a716-446655440002', 'tools-equipment', 'Tools & Equipment', 'Professional tools for every job', 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg'),
  ('550e8400-e29b-41d4-a716-446655440003', 'garden-outdoor', 'Garden & Outdoor', 'Everything for your outdoor spaces', 'https://images.pexels.com/photos/296230/pexels-photo-296230.jpeg')
ON CONFLICT (slug) DO NOTHING;

-- Insert categories
INSERT INTO categories (id, slug, name, description, department_id, product_count) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', 'fasteners', 'Fasteners & Fixings', 'Screws, nails, bolts and more', '550e8400-e29b-41d4-a716-446655440001', 245),
  ('550e8400-e29b-41d4-a716-446655440012', 'timber', 'Timber & Lumber', 'Quality timber for all projects', '550e8400-e29b-41d4-a716-446655440001', 189),
  ('550e8400-e29b-41d4-a716-446655440013', 'power-tools', 'Power Tools', 'Professional grade power tools', '550e8400-e29b-41d4-a716-446655440002', 156),
  ('550e8400-e29b-41d4-a716-446655440014', 'hand-tools', 'Hand Tools', 'Essential hand tools', '550e8400-e29b-41d4-a716-446655440002', 298),
  ('550e8400-e29b-41d4-a716-446655440015', 'gardening', 'Gardening', 'Tools and supplies for gardening', '550e8400-e29b-41d4-a716-446655440003', 167),
  ('550e8400-e29b-41d4-a716-446655440016', 'outdoor-furniture', 'Outdoor Furniture', 'Furniture for outdoor living', '550e8400-e29b-41d4-a716-446655440003', 89)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (id, slug, name, description, price, original_price, images, category_id, department_id, brand, rating, review_count, stock, specifications) VALUES
  ('550e8400-e29b-41d4-a716-446655440021', 'concrete-mix-50kg', 'Premium Concrete Mix 50kg', 'High-strength concrete mix suitable for foundations, driveways, and general construction projects.', 12.95, 15.95, ARRAY['https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg'], '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'BuildPro', 4.5, 127, 45, '{"Weight": "50kg", "Coverage": "25L when mixed", "Setting Time": "2-4 hours", "Compressive Strength": "25MPa"}'),
  ('550e8400-e29b-41d4-a716-446655440022', 'cordless-drill-18v', '18V Cordless Drill with Battery', 'Professional cordless drill with lithium-ion battery and 13mm keyless chuck.', 149.99, NULL, ARRAY['https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg'], '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', 'PowerMax', 4.8, 89, 23, '{"Voltage": "18V", "Chuck Size": "13mm", "Battery Type": "Lithium-ion", "Torque Settings": "21", "Weight": "1.6kg"}'),
  ('550e8400-e29b-41d4-a716-446655440023', 'garden-hose-30m', '30m Heavy Duty Garden Hose', 'Durable garden hose with brass fittings and kink-resistant design.', 89.99, 109.99, ARRAY['https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg'], '550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440003', 'FlowPro', 4.3, 56, 18, '{"Length": "30m", "Diameter": "12mm", "Material": "Reinforced PVC", "Fittings": "Brass", "Warranty": "5 years"}')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample services
INSERT INTO services (id, slug, name, description, image, price, duration, category) VALUES
  ('550e8400-e29b-41d4-a716-446655440031', 'kitchen-installation', 'Kitchen Installation Service', 'Professional kitchen installation by certified tradespeople', 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg', 299.00, '1-2 days', 'Installation'),
  ('550e8400-e29b-41d4-a716-446655440032', 'garden-design', 'Garden Design Consultation', 'Expert garden design and landscaping advice', 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg', 150.00, '2-3 hours', 'Consultation')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample DIY articles
INSERT INTO diy_articles (id, slug, title, excerpt, content, featured_image, author, category, tags) VALUES
  ('550e8400-e29b-41d4-a716-446655440041', 'build-garden-deck', 'How to Build a Garden Deck', 'Step-by-step guide to building your own garden deck', 'A comprehensive guide to building a beautiful garden deck...', 'https://images.pexels.com/photos/1105325/pexels-photo-1105325.jpeg', 'BuildMart Team', 'Outdoor Projects', ARRAY['deck', 'garden', 'diy', 'outdoor']),
  ('550e8400-e29b-41d4-a716-446655440042', 'organize-garage-storage', 'Garage Storage Solutions', 'Maximize your garage space with smart storage ideas', 'Transform your cluttered garage into an organized space...', 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg', 'BuildMart Team', 'Storage', ARRAY['garage', 'storage', 'organization', 'diy'])
ON CONFLICT (slug) DO NOTHING;