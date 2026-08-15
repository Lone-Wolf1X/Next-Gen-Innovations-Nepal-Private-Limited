-- Upsert Category
INSERT INTO exam_categories (id, name, description, icon, is_active, display_order) VALUES 
('cat-rbb', 'Rastriya Banijya Bank (Administration)', 'Syllabus and Model Sets for RBB Level 4 & 5', '🏦', true, 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Insert Subjects
INSERT INTO subjects (id, category_id, name, display_order) VALUES 
('sub-rbb-p1-1', 'cat-rbb', 'Paper I: Basic Economics', 1),
('sub-rbb-p1-2', 'cat-rbb', 'Paper I: Financial Market', 2),
('sub-rbb-p1-3', 'cat-rbb', 'Paper I: Financial Institutions in Nepal', 3),
('sub-rbb-p2-1', 'cat-rbb', 'Paper II: Banking Related Laws', 4),
('sub-rbb-p2-2', 'cat-rbb', 'Paper II: Other Related Laws', 5),
('sub-rbb-p2-3', 'cat-rbb', 'Paper II: Organizational Behavior', 6),
('sub-rbb-p2-4', 'cat-rbb', 'Paper II: Organizational Role', 7)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, display_order = EXCLUDED.display_order;

