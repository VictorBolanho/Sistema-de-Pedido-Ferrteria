INSERT INTO products (name, sku, category, price, stock, image_url, active) VALUES
('Piso Ceramico Trafico 45x45 Arena Caja 2.03 m2', 'PIS-CER-4545-ARENA', 'valdosas', 76900, 120, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', true),
('Pared Blanca Brillante 30x60 Caja 1.62 m2', 'PIS-PAR-3060-BLANCA', 'valdosas', 72400, 95, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80', true),
('Baldosa Antideslizante Exterior Gris 33x33 Caja 1.52 m2', 'PIS-EXT-3333-GRIS', 'valdosas', 64800, 88, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', true),
('Porcelanato Marmol Beige 60x60 Caja 1.44 m2', 'POR-6060-MARMOL', 'valdosas', 118900, 64, 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80', true),

('Pegacor Gris Tipo 1 x 25 kg', 'PEG-T1-GRIS-25', 'pegantes', 29800, 180, 'https://images.unsplash.com/photo-1604014056132-45777a0944c2?auto=format&fit=crop&w=1200&q=80', true),
('Pegacor Blanco Para Porcelanato x 25 kg', 'PEG-BLANCO-PORC', 'pegantes', 43800, 140, 'https://images.unsplash.com/photo-1617104551722-3b2d513664c9?auto=format&fit=crop&w=1200&q=80', true),
('Boquilla Con Color Marfil x 2 kg', 'BOQ-MARFIL-2KG', 'pegantes', 7900, 210, 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=80', true),
('Silicona Sanitaria Blanca 280 ml', 'SIL-SAN-BLANCA', 'pegantes', 18900, 160, 'https://images.unsplash.com/photo-1581147036324-c1c0a95f4c2b?auto=format&fit=crop&w=1200&q=80', true),

('Combo Sanitario One Piece Blanco', 'BAN-SAN-ONEPIECE', 'banos', 529000, 18, 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80', true),
('Lavamanos de Sobreponer Oval Blanco', 'BAN-LAV-OVAL', 'banos', 184900, 35, 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1200&q=80', true),
('Griferia Monocontrol Lavamanos Cromo', 'BAN-GRI-MONO', 'banos', 149900, 46, 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80', true),
('Cabina de Ducha Vidrio Templado 6 mm', 'BAN-CAB-VIDRIO', 'banos', 1199000, 9, 'https://images.unsplash.com/photo-1629079447777-1e605162dc8d?auto=format&fit=crop&w=1200&q=80', true),

('Lavaplatos Empotrar Inox 80x50', 'COC-LAV-INOX', 'cocinas', 249900, 27, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', true),
('Mezclador Cocina Cuello Flexible Negro', 'COC-MEZ-FLEX', 'cocinas', 229900, 22, 'https://images.unsplash.com/photo-1576698483491-8c43f086254f?auto=format&fit=crop&w=1200&q=80', true),
('Impermeabilizante Fachada Blanco 4 kg', 'OBR-IMP-FACH-4', 'acabados', 58900, 58, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80', true),
('Pintura Interior Lavable Marfil 1 Galon', 'OBR-PIN-MARFIL', 'acabados', 68900, 44, 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80', true)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  stock = EXCLUDED.stock,
  image_url = EXCLUDED.image_url,
  active = EXCLUDED.active,
  updated_at = NOW();
