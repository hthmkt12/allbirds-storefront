-- Seed data for Allbirds EmDash D1 Database

-- 1. Hero Blocks
INSERT OR REPLACE INTO hero_blocks (id, headline, body, cta_label, media, theme_swatch) VALUES
(1, 'Light on your feet. Easy on the planet.', 'Iconic comfort made with natural materials like ZQ Merino wool, eucalyptus tree fiber, and sugarcane.', 'Shop New Arrivals', '/allbirds-lifestyle-hero.png', '#e0dacf');

-- 2. Categories
INSERT OR REPLACE INTO categories (id, name, slug, cta, swatch, image) VALUES
(1, 'New Arrivals', 'new-arrivals', 'Shop Men / Shop Women', '#c8d3d8', '/allbirds-crop-top-left.png'),
(2, 'Mens', 'mens', 'Shop Men', '#4b4440', '/allbirds-lifestyle-hero.png'),
(3, 'Womens', 'womens', 'Shop Women', '#6c504c', '/allbirds-mvp-lifestyle.png'),
(4, 'Best Sellers', 'best-sellers', 'Shop Men / Shop Women', '#536054', '/allbirds-travel-promo.png');

-- 3. Products
INSERT OR REPLACE INTO products (id, name, price, fit, rating, tags, sizes, slug, description, label, color, swatch, image, colorways) VALUES
(1, 'Men''s Canvas Runner NZ', '$100', 'True to size', 4.7, '["Canvas","Lightweight"]', '[7,8,8.5,9,9.5,10,10.5,11,12]', 'mens-canvas-runner-nz', 'Everyday classic sneaker with lightweight canvas and bouncy all-day comfort.', 'New Color', 'Deep Navy Stripes', '#e0dacf', '/allbirds-crop-top-left.png', '[{"color":"Deep Navy Stripes","swatch":"#e0dacf","image":"/allbirds-crop-top-left.png"},{"color":"Sage Brush","swatch":"var(--sage)","image":"/allbirds-mvp-lifestyle.png"},{"color":"Pacific Blue","swatch":"var(--blue)","image":"/allbirds-travel-promo.png"}]'),
(2, 'Women''s Tree Glider', '$140', 'Runs narrow', 4.8, '["Tree Fiber","Breathable"]', '[7,8,8.5,9,9.5,10,10.5,11,12]', 'womens-tree-glider', 'Lightweight running and walking shoe crafted from breathable eucalyptus tree fiber.', 'New Color', 'Burlwood', '#d4d9cf', '/allbirds-crop-top-right.png', '[{"color":"Burlwood","swatch":"#d4d9cf","image":"/allbirds-crop-top-right.png"},{"color":"Sage Brush","swatch":"var(--sage)","image":"/allbirds-mvp-lifestyle.png"},{"color":"Pacific Blue","swatch":"var(--blue)","image":"/allbirds-travel-promo.png"}]'),
(3, 'Men''s Canvas Cruiser', '$75', 'Relaxed fit', 4.6, '["Canvas","Travel"]', '[7,8,8.5,9,9.5,10,10.5,11,12]', 'mens-canvas-cruiser', 'Low-profile slip-on casual deck shoe built for warmer days and travel.', NULL, 'Sea Spray', '#c8d3d8', '/allbirds-crop-bottom-left.png', '[{"color":"Sea Spray","swatch":"#c8d3d8","image":"/allbirds-crop-bottom-left.png"},{"color":"Sage Brush","swatch":"var(--sage)","image":"/allbirds-mvp-lifestyle.png"},{"color":"Pacific Blue","swatch":"var(--blue)","image":"/allbirds-travel-promo.png"}]'),
(4, 'Women''s Breezer Mary Jane', '$115', 'True to size', 4.5, '["Mary Jane","Breezy"]', '[7,8,8.5,9,9.5,10,10.5,11,12]', 'womens-breezer-mary-jane', 'Feminine silhouette with flexible, breathable knit and supportive footbed.', 'New Color', 'Dusty Pink', '#d1b0a4', '/allbirds-crop-bottom-right.png', '[{"color":"Dusty Pink","swatch":"#d1b0a4","image":"/allbirds-crop-bottom-right.png"},{"color":"Sage Brush","swatch":"var(--sage)","image":"/allbirds-mvp-lifestyle.png"},{"color":"Pacific Blue","swatch":"var(--blue)","image":"/allbirds-travel-promo.png"}]'),
(5, 'Men''s Dasher NZ', '$140', 'Performance fit', 4.9, '["Running","Cushioned"]', '[7,8,8.5,9,9.5,10,10.5,11,12]', 'mens-dasher-nz', 'Engineered for 5Ks, half marathons, and high-impact daily training sessions.', 'New Color', 'Seagrass', '#d4d9cf', '/allbirds-crop-top-right.png', '[{"color":"Seagrass","swatch":"#d4d9cf","image":"/allbirds-crop-top-right.png"},{"color":"Sage Brush","swatch":"var(--sage)","image":"/allbirds-mvp-lifestyle.png"},{"color":"Pacific Blue","swatch":"var(--blue)","image":"/allbirds-travel-promo.png"}]'),
(6, 'Women''s Varsity Strap', '$115', 'Adjustable strap', 4.6, '["Retro","Everyday"]', '[7,8,8.5,9,9.5,10,10.5,11,12]', 'womens-varsity-strap', 'Retro court shoe styling with an easy hook-and-loop adjustable strap design.', 'New Color', 'Burlwood', '#e0dacf', '/allbirds-crop-top-left.png', '[{"color":"Burlwood","swatch":"#e0dacf","image":"/allbirds-crop-top-left.png"},{"color":"Sage Brush","swatch":"var(--sage)","image":"/allbirds-mvp-lifestyle.png"},{"color":"Pacific Blue","swatch":"var(--blue)","image":"/allbirds-travel-promo.png"}]'),
(7, 'Men''s Cruiser Slip On Terry', '$110', 'Easy slip-on', 4.7, '["Terry","Travel"]', '[7,8,8.5,9,9.5,10,10.5,11,12]', 'mens-cruiser-slip-on-terry', 'Ultra-plush French terry upper designed for sockless resort and casual lounging.', 'New', 'Ochre / Warm White', '#d1b0a4', '/allbirds-crop-bottom-right.png', '[{"color":"Ochre / Warm White","swatch":"#d1b0a4","image":"/allbirds-crop-bottom-right.png"},{"color":"Sage Brush","swatch":"var(--sage)","image":"/allbirds-mvp-lifestyle.png"},{"color":"Pacific Blue","swatch":"var(--blue)","image":"/allbirds-travel-promo.png"}]'),
(8, 'Women''s Canvas Cruiser', '$75', 'Relaxed fit', 4.5, '["Canvas","Low Profile"]', '[7,8,8.5,9,9.5,10,10.5,11,12]', 'womens-canvas-cruiser', 'Lightweight canvas construction with classic stitch lines and durable grip outsole.', NULL, 'Stormy Lilac', '#c8d3d8', '/allbirds-crop-bottom-left.png', '[{"color":"Stormy Lilac","swatch":"#c8d3d8","image":"/allbirds-crop-bottom-left.png"},{"color":"Sage Brush","swatch":"var(--sage)","image":"/allbirds-mvp-lifestyle.png"},{"color":"Pacific Blue","swatch":"var(--blue)","image":"/allbirds-travel-promo.png"}]');

-- 4. Promo Tiles
INSERT OR REPLACE INTO promo_tiles (id, title, swatch, image) VALUES
(1, 'Spring Travel Essentials', '#e0dacf', '/allbirds-travel-promo.png'),
(2, 'New Arrivals', '#d4d9cf', '/allbirds-mvp-lifestyle.png'),
(3, 'Fresh Colors For Spring', '#c8d3d8', '/allbirds-crop-top-left.png');

-- 5. Materials
INSERT OR REPLACE INTO materials (id, name, impact_note, texture_image, source_region) VALUES
(1, 'Wear All Day Comfort', 'Lightweight, bouncy, and wildly comfortable shoes for any outing.', '/allbirds-crop-top-left.png', 'New Zealand'),
(2, 'Sustainability In Every Step', 'Materials, transport, and packaging are selected with lower impact in mind.', '/allbirds-crop-top-right.png', 'Global'),
(3, 'Materials From The Earth', 'Wool, tree fiber, and sugarcane replace petroleum-based synthetics where possible.', '/allbirds-crop-bottom-left.png', 'South Africa & Brazil');

-- 6. Reviews
INSERT OR REPLACE INTO reviews (id, quote, customer_name, detail) VALUES
(1, 'The lightest shoe I packed for a two-week trip. It still looked clean by the flight home.', 'Maya R.', 'Tree Glider, Burlwood'),
(2, 'Soft enough for errands, structured enough for the office commute.', 'Daniel K.', 'Canvas Runner NZ'),
(3, 'The colorways feel grown up. Easy to wear with everything.', 'Nina P.', 'Canvas Cruiser');
