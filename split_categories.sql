UPDATE exam_categories 
SET name = 'RBB Level 5 (Admin)',
    description = 'RBB Level 5 Administration Preparation'
WHERE id = 'cat-rbb';

INSERT IGNORE INTO exam_categories (id, name, description, icon, is_active, display_order) 
VALUES ('cat-rbb-cash', 'RBB Level 5 (Cash)', 'RBB Level 5 Cash Preparation', '💰', 1, 3);

UPDATE vacancies 
SET category_id = 'cat-rbb-cash' 
WHERE id = 'vac-rbb-5-cash';
