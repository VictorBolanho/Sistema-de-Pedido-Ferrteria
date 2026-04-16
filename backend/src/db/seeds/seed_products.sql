-- Seed Products with Images
-- This script is IDEMPOTENT: can be run multiple times without errors
-- Uses ON CONFLICT to upsert products (insert new, update existing)

INSERT INTO products (name, sku, category, price, stock, image_url, active) VALUES
-- Herramientas (Tools)
('Taladro Percutor 18V', 'TOOL-DRILL-001', 'herramientas', 89.99, 15, 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&q=80', true),
('Sierra Circular 7.25"', 'TOOL-SAW-001', 'herramientas', 65.50, 22, 'https://images.unsplash.com/photo-1536503842332-a4ad8b59d0bb?w=400&q=80', true),
('Destornillador Set 45 Piezas', 'TOOL-SCREWDRIVER-001', 'herramientas', 34.99, 30, 'https://images.unsplash.com/photo-1586864388619-7e12e2c21f32?w=400&q=80', true),
('Martillo de 16 oz', 'TOOL-HAMMER-001', 'herramientas', 19.99, 50, 'https://images.unsplash.com/photo-1609900881323-b9b02e22cb8e?w=400&q=80', true),

-- Accesorios (Accessories)
('Broca Set 18 Piezas', 'ACC-DRILL-BITS-001', 'accesorios', 22.50, 45, 'https://images.unsplash.com/photo-1612527131840-ef4df68a5a5f?w=400&q=80', true),
('Lija Assorted Grit Pack', 'ACC-SANDPAPER-001', 'accesorios', 12.99, 60, 'https://images.unsplash.com/photo-1605555927218-acf53f28f129?w=400&q=80', true),
('Cintas de Medición 25ft', 'ACC-TAPE-MEASURE-001', 'accesorios', 8.50, 40, 'https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=400&q=80', true),
('Nivel Laser Digital', 'ACC-LEVEL-LASER-001', 'accesorios', 45.00, 12, 'https://images.unsplash.com/photo-1577720643272-265f434ae3df?w=400&q=80', true),

-- Cerámicas (Ceramics)
('Baldosa Cerámica 30x30 Gris', 'CER-TILE-GRAY-001', 'ceramicas', 3.50, 500, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', true),
('Baldosa Cerámica 40x40 Blanco', 'CER-TILE-WHITE-001', 'ceramicas', 5.25, 350, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', true),
('Baldosa Cerámica Antideslizante', 'CER-TILE-ANTI-001', 'ceramicas', 6.99, 250, 'https://images.unsplash.com/photo-1584622181563-430f63602d4b?w=400&q=80', true),
('Zócalo Cerámica 10x30 Negro', 'CER-BASEBOARD-001', 'ceramicas', 2.75, 400, 'https://images.unsplash.com/photo-1589939705066-3ec3497f4794?w=400&q=80', true),

-- Pegantes (Adhesives)
('Pegante PVC 250ml', 'ADH-PVC-250-001', 'pegantes', 5.99, 100, 'https://images.unsplash.com/photo-1589939705066-3ec3497f4794?w=400&q=80', true),
('Silicona Blanca 310ml', 'ADH-SILICONE-WHITE-001', 'pegantes', 3.50, 80, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80', true),
('Pegante Poliuretano Profesional', 'ADH-POLYURETHANE-001', 'pegantes', 12.99, 50, 'https://images.unsplash.com/photo-1578788984921-03950022aaad?w=400&q=80', true),
('Masilla para Grietas 1kg', 'ADH-SPACKLING-001', 'pegantes', 8.50, 60, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80', true)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  stock = EXCLUDED.stock,
  image_url = EXCLUDED.image_url,
  active = EXCLUDED.active,
  updated_at = NOW();
