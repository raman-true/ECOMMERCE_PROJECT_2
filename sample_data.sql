-- Sample Data for Ecommerce Platform
-- Run this in your Supabase SQL Editor to populate sample data

-- Insert Departments
INSERT INTO public.departments (id, slug, name, description, image) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'electronics', 'Electronics', 'Latest gadgets, computers, and electronic devices', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500'),
('550e8400-e29b-41d4-a716-446655440002', 'home-garden', 'Home & Garden', 'Everything for your home and garden needs', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500'),
('550e8400-e29b-41d4-a716-446655440003', 'clothing-fashion', 'Clothing & Fashion', 'Trendy clothes and fashion accessories', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500'),
('550e8400-e29b-41d4-a716-446655440004', 'sports-outdoors', 'Sports & Outdoors', 'Sports equipment and outdoor gear', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'),
('550e8400-e29b-41d4-a716-446655440005', 'automotive', 'Automotive', 'Car parts, accessories, and tools', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500');

-- Insert Categories for Electronics Department
INSERT INTO public.categories (id, slug, name, description, image, product_count, department_id) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'smartphones', 'Smartphones', 'Latest smartphones and mobile devices', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300', 0, '550e8400-e29b-41d4-a716-446655440001'),
('660e8400-e29b-41d4-a716-446655440002', 'laptops', 'Laptops', 'Laptops and notebooks for work and gaming', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300', 0, '550e8400-e29b-41d4-a716-446655440001'),
('660e8400-e29b-41d4-a716-446655440003', 'headphones', 'Headphones', 'Audio equipment and headphones', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300', 0, '550e8400-e29b-41d4-a716-446655440001'),
('660e8400-e29b-41d4-a716-446655440004', 'gaming', 'Gaming', 'Gaming consoles, accessories, and games', 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=300', 0, '550e8400-e29b-41d4-a716-446655440001');

-- Insert Categories for Home & Garden Department
INSERT INTO public.categories (id, slug, name, description, image, product_count, department_id) VALUES
('660e8400-e29b-41d4-a716-446655440005', 'furniture', 'Furniture', 'Home and office furniture', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300', 0, '550e8400-e29b-41d4-a716-446655440002'),
('660e8400-e29b-41d4-a716-446655440006', 'kitchen', 'Kitchen', 'Kitchen appliances and cookware', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300', 0, '550e8400-e29b-41d4-a716-446655440002'),
('660e8400-e29b-41d4-a716-446655440007', 'garden-tools', 'Garden Tools', 'Gardening equipment and tools', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300', 0, '550e8400-e29b-41d4-a716-446655440002'),
('660e8400-e29b-41d4-a716-446655440008', 'home-decor', 'Home Decor', 'Decorative items and accessories', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300', 0, '550e8400-e29b-41d4-a716-446655440002');

-- Insert Categories for Clothing & Fashion Department
INSERT INTO public.categories (id, slug, name, description, image, product_count, department_id) VALUES
('660e8400-e29b-41d4-a716-446655440009', 'mens-clothing', 'Men''s Clothing', 'Fashion for men', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', 0, '550e8400-e29b-41d4-a716-446655440003'),
('660e8400-e29b-41d4-a716-446655440010', 'womens-clothing', 'Women''s Clothing', 'Fashion for women', 'https://images.unsplash.com/photo-1494790108755-2616c27b1e27?w=300', 0, '550e8400-e29b-41d4-a716-446655440003'),
('660e8400-e29b-41d4-a716-446655440011', 'shoes', 'Shoes', 'Footwear for all occasions', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300', 0, '550e8400-e29b-41d4-a716-446655440003'),
('660e8400-e29b-41d4-a716-446655440012', 'accessories', 'Accessories', 'Fashion accessories and jewelry', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300', 0, '550e8400-e29b-41d4-a716-446655440003');

-- Insert Categories for Sports & Outdoors Department
INSERT INTO public.categories (id, slug, name, description, image, product_count, department_id) VALUES
('660e8400-e29b-41d4-a716-446655440013', 'fitness', 'Fitness', 'Fitness equipment and gear', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300', 0, '550e8400-e29b-41d4-a716-446655440004'),
('660e8400-e29b-41d4-a716-446655440014', 'outdoor-gear', 'Outdoor Gear', 'Camping and hiking equipment', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300', 0, '550e8400-e29b-41d4-a716-446655440004'),
('660e8400-e29b-41d4-a716-446655440015', 'team-sports', 'Team Sports', 'Equipment for team sports', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300', 0, '550e8400-e29b-41d4-a716-446655440004');

-- Insert Categories for Automotive Department
INSERT INTO public.categories (id, slug, name, description, image, product_count, department_id) VALUES
('660e8400-e29b-41d4-a716-446655440016', 'car-parts', 'Car Parts', 'Replacement parts and components', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300', 0, '550e8400-e29b-41d4-a716-446655440005'),
('660e8400-e29b-41d4-a716-446655440017', 'car-accessories', 'Car Accessories', 'Interior and exterior accessories', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300', 0, '550e8400-e29b-41d4-a716-446655440005'),
('660e8400-e29b-41d4-a716-446655440018', 'tools', 'Tools', 'Automotive tools and equipment', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=300', 0, '550e8400-e29b-41d4-a716-446655440005');

-- Insert Sample Products
-- Electronics Products
INSERT INTO public.products (id, slug, name, description, price, original_price, images, category_id, department_id, brand, rating, review_count, stock, specifications) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'iphone-15-pro', 'iPhone 15 Pro', 'Latest iPhone with advanced camera system and A17 Pro chip', 1199.00, 1299.00, ARRAY['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'], '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Apple', 4.8, 245, 50, '{"display": "6.1-inch Super Retina XDR", "storage": "128GB", "camera": "48MP Main", "chip": "A17 Pro"}'),

('770e8400-e29b-41d4-a716-446655440002', 'samsung-galaxy-s24', 'Samsung Galaxy S24', 'Premium Android smartphone with AI features', 899.00, 999.00, ARRAY['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500'], '660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Samsung', 4.6, 189, 75, '{"display": "6.2-inch Dynamic AMOLED", "storage": "256GB", "camera": "50MP Triple", "processor": "Snapdragon 8 Gen 3"}'),

('770e8400-e29b-41d4-a716-446655440003', 'macbook-pro-m3', 'MacBook Pro M3', 'Professional laptop with M3 chip for creative work', 1999.00, NULL, ARRAY['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'], '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Apple', 4.9, 156, 25, '{"display": "14-inch Liquid Retina XDR", "memory": "16GB", "storage": "512GB SSD", "chip": "Apple M3"}'),

('770e8400-e29b-41d4-a716-446655440004', 'sony-wh1000xm5', 'Sony WH-1000XM5', 'Industry-leading noise canceling headphones', 399.00, 449.00, ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'], '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Sony', 4.7, 312, 100, '{"type": "Over-ear", "battery": "30 hours", "features": "Active Noise Canceling", "connectivity": "Bluetooth 5.2"}'),

('770e8400-e29b-41d4-a716-446655440005', 'ps5-console', 'PlayStation 5', 'Next-gen gaming console with 4K gaming', 499.00, NULL, ARRAY['https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=500'], '660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Sony', 4.8, 428, 30, '{"storage": "825GB SSD", "resolution": "4K", "features": "Ray Tracing", "controller": "DualSense"}');

-- Home & Garden Products
INSERT INTO public.products (id, slug, name, description, price, original_price, images, category_id, department_id, brand, rating, review_count, stock, specifications) VALUES
('770e8400-e29b-41d4-a716-446655440006', 'ergonomic-office-chair', 'Ergonomic Office Chair', 'Comfortable office chair with lumbar support', 299.00, 399.00, ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500'], '660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Herman Miller', 4.5, 89, 40, '{"material": "Mesh", "adjustable": "Height, Arms, Lumbar", "weight_capacity": "300 lbs", "warranty": "12 years"}'),

('770e8400-e29b-41d4-a716-446655440007', 'stand-mixer', 'KitchenAid Stand Mixer', 'Professional stand mixer for baking', 379.00, NULL, ARRAY['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500'], '660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'KitchenAid', 4.8, 267, 60, '{"capacity": "5 quart", "speeds": "10", "attachments": "Dough hook, Wire whip, Flat beater", "power": "325 watts"}'),

('770e8400-e29b-41d4-a716-446655440008', 'garden-tool-set', 'Premium Garden Tool Set', 'Complete set of essential gardening tools', 89.00, 119.00, ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500'], '660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'Fiskars', 4.4, 156, 80, '{"pieces": "7", "material": "Stainless Steel", "handles": "Ergonomic", "includes": "Trowel, Pruner, Weeder, Cultivator"}');

-- Clothing & Fashion Products
INSERT INTO public.products (id, slug, name, description, price, original_price, images, category_id, department_id, brand, rating, review_count, stock, specifications) VALUES
('770e8400-e29b-41d4-a716-446655440009', 'mens-casual-shirt', 'Men''s Casual Cotton Shirt', 'Comfortable cotton shirt for everyday wear', 49.00, 69.00, ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500'], '660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', 'Ralph Lauren', 4.3, 78, 120, '{"material": "100% Cotton", "fit": "Regular", "care": "Machine Wash", "sizes": "S, M, L, XL, XXL"}'),

('770e8400-e29b-41d4-a716-446655440010', 'womens-dress', 'Women''s Summer Dress', 'Elegant summer dress for special occasions', 89.00, NULL, ARRAY['https://images.unsplash.com/photo-1494790108755-2616c27b1e27?w=500'], '660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', 'Zara', 4.6, 134, 95, '{"material": "Polyester blend", "length": "Midi", "style": "A-line", "sizes": "XS, S, M, L, XL"}'),

('770e8400-e29b-41d4-a716-446655440011', 'running-shoes', 'Running Shoes', 'High-performance running shoes with cushioning', 129.00, 159.00, ARRAY['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500'], '660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003', 'Nike', 4.7, 289, 150, '{"type": "Running", "cushioning": "Air Max", "upper": "Mesh", "sizes": "6-13"}');

-- Sports & Outdoors Products
INSERT INTO public.products (id, slug, name, description, price, original_price, images, category_id, department_id, brand, rating, review_count, stock, specifications) VALUES
('770e8400-e29b-41d4-a716-446655440012', 'adjustable-dumbbells', 'Adjustable Dumbbells Set', 'Space-saving adjustable dumbbells for home gym', 299.00, 349.00, ARRAY['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'], '660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', 'Bowflex', 4.5, 167, 45, '{"weight_range": "5-52.5 lbs", "adjustment": "Quick-change", "space_saving": "Yes", "warranty": "2 years"}'),

('770e8400-e29b-41d4-a716-446655440013', 'camping-tent', '4-Person Camping Tent', 'Waterproof tent for family camping trips', 159.00, 199.00, ARRAY['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500'], '660e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440004', 'Coleman', 4.4, 203, 70, '{"capacity": "4 person", "waterproof": "Yes", "setup_time": "15 minutes", "weight": "16.5 lbs"}');

-- Automotive Products
INSERT INTO public.products (id, slug, name, description, price, original_price, images, category_id, department_id, brand, rating, review_count, stock, specifications) VALUES
('770e8400-e29b-41d4-a716-446655440014', 'car-dash-cam', 'Car Dashboard Camera', 'HD dashboard camera with night vision', 79.00, 99.00, ARRAY['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500'], '660e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440005', 'Garmin', 4.3, 145, 85, '{"resolution": "1080p HD", "night_vision": "Yes", "storage": "MicroSD up to 64GB", "features": "Loop recording, G-sensor"}'),

('770e8400-e29b-41d4-a716-446655440015', 'socket-wrench-set', 'Socket Wrench Set', 'Professional 42-piece socket wrench set', 89.00, NULL, ARRAY['https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500'], '660e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440005', 'Craftsman', 4.6, 98, 65, '{"pieces": "42", "drive_size": "1/4 and 3/8 inch", "material": "Chrome Vanadium", "case": "Blow molded"});

-- Update product counts in categories
UPDATE public.categories SET product_count = (
  SELECT COUNT(*) FROM public.products WHERE category_id = categories.id
);
