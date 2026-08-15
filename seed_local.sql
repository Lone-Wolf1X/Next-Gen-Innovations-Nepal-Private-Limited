-- Insert Category
INSERT IGNORE INTO exam_categories (id, name, description, icon, is_active, display_order) VALUES 
('cat-rbb', 'Rastriya Banijya Bank (Administration)', 'Syllabus and Model Sets for RBB Level 4 & 5', '🏦', 1, 1);

-- Insert Subjects
INSERT IGNORE INTO subjects (id, category_id, name, display_order) VALUES 
('sub-rbb-p1-1', 'cat-rbb', 'Paper I: Basic Economics', 1),
('sub-rbb-p1-2', 'cat-rbb', 'Paper I: Financial Market', 2),
('sub-rbb-p1-3', 'cat-rbb', 'Paper I: Financial Institutions in Nepal', 3),
('sub-rbb-p2-1', 'cat-rbb', 'Paper II: Banking Related Laws', 4),
('sub-rbb-p2-2', 'cat-rbb', 'Paper II: Other Related Laws', 5),
('sub-rbb-p2-3', 'cat-rbb', 'Paper II: Organizational Behavior', 6),
('sub-rbb-p2-4', 'cat-rbb', 'Paper II: Organizational Role', 7);

-- Insert Dummy Questions
INSERT IGNORE INTO questions (id, category_id, subject_id, question_text, options, correct_option, explanation, marks, negative_marks, status) VALUES 
('q1', 'cat-rbb', 'sub-rbb-p1-1', 'What is the central bank of Nepal?', '{"a":"Nepal Rastra Bank", "b":"Rastriya Banijya Bank", "c":"Nepal Bank Limited", "d":"Agriculture Development Bank"}', 'a', 'NRB is the central bank of Nepal established in 2013 BS.', 1.0, 0.2, 'published'),
('q2', 'cat-rbb', 'sub-rbb-p1-1', 'When was Rastriya Banijya Bank established?', '{"a":"2022 BS", "b":"2013 BS", "c":"1994 BS", "d":"2024 BS"}', 'a', 'Rastriya Banijya Bank was established on Magh 10, 2022 BS.', 1.0, 0.2, 'published'),
('q3', 'cat-rbb', 'sub-rbb-p2-1', 'Which accounting standard is followed in Nepal?', '{"a":"NFRS", "b":"IFRS", "c":"GAAP", "d":"NAS"}', 'a', 'Nepal Financial Reporting Standards (NFRS) are followed in Nepal.', 1.0, 0.2, 'published');

-- Insert Dummy Model Set
INSERT IGNORE INTO model_sets (id, title, description, category_id, question_ids, time_limit_minutes, total_marks, status) VALUES 
('mset-rbb-1', 'RBB Level 4 Pre-Test 1', 'A quick diagnostic test covering all major subjects of RBB Level 4.', 'cat-rbb', '["q1", "q2", "q3"]', 10, 3.00, 'published');
