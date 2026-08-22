INSERT INTO gb_categories (name, icon, status) SELECT 'Banking', '🏦', 'active' WHERE NOT EXISTS (SELECT 1 FROM gb_categories WHERE name = 'Banking');
SET @cat_id = (SELECT id FROM gb_categories WHERE name = 'Banking');
INSERT INTO gb_exams (category_id, title, description, status) SELECT @cat_id, 'RBB Level 5 - Admin', 'Rastriya Banijya Bank - RBB Level 5 Cash and Admin (Admin)', 'active' WHERE NOT EXISTS (SELECT 1 FROM gb_exams WHERE title = 'RBB Level 5 - Admin');
INSERT INTO gb_exams (category_id, title, description, status) SELECT @cat_id, 'RBB Level 5 - Cash', 'Rastriya Banijya Bank - RBB Level 5 Cash and Admin (Cash)', 'active' WHERE NOT EXISTS (SELECT 1 FROM gb_exams WHERE title = 'RBB Level 5 - Cash');
SET @exam_id = (SELECT id FROM gb_exams WHERE title = 'RBB Level 5 - Cash');
INSERT INTO gb_mcq_sets (exam_id, title, status) VALUES (@exam_id, 'First Paper (Common to Admin & Cash) - Section A (Economics, Financial Markets & Financial Institutions)', 'published');
SET @set_id = LAST_INSERT_ID();
INSERT INTO gb_questions 
                            (set_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, exam_tip)
                            VALUES (@set_id, 'What is a key concept of: Unit 1: Basic Economics - Scarcity and Choice, Allocation of Resources; Demand a...?', 'Option A', 'Option B', 'Option C', 'Option D', 'A', 'This is an automated placeholder for Unit 1: Basic Economics - Scarcity and C...', 'Review syllabus!');
INSERT INTO gb_questions 
                            (set_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, exam_tip)
                            VALUES (@set_id, 'What is a key concept of: Unit 2: Financial Market - Role & functions of financial market; Capital Market ...?', 'Option A', 'Option B', 'Option C', 'Option D', 'A', 'This is an automated placeholder for Unit 2: Financial Market - Role & functi...', 'Review syllabus!');
SET @exam_id = (SELECT id FROM gb_exams WHERE title = 'RBB Level 5 - Cash');
INSERT INTO gb_mcq_sets (exam_id, title, status) VALUES (@exam_id, 'First Paper (Common to Admin & Cash) - Section B (Digital Banking, Terminology & General Knowledge)', 'published');
SET @set_id = LAST_INSERT_ID();
INSERT INTO gb_questions 
                            (set_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, exam_tip)
                            VALUES (@set_id, 'What is a key concept of: Unit 4: Digital / Electronic Payment Systems - Electronic Cheque Clearing (ECC);...?', 'Option A', 'Option B', 'Option C', 'Option D', 'A', 'This is an automated placeholder for Unit 4: Digital / Electronic Payment Sys...', 'Review syllabus!');
INSERT INTO gb_questions 
                            (set_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, exam_tip)
                            VALUES (@set_id, 'What is a key concept of: Unit 5: Key Basic Banking Terminology - Capital Fund; Loan Loss Provision; Credi...?', 'Option A', 'Option B', 'Option C', 'Option D', 'A', 'This is an automated placeholder for Unit 5: Key Basic Banking Terminology - ...', 'Review syllabus!');
SET @exam_id = (SELECT id FROM gb_exams WHERE title = 'RBB Level 5 - Admin');
INSERT INTO gb_mcq_sets (exam_id, title, status) VALUES (@exam_id, 'Second Paper (Senior Assistant - Admin) - Section A (Banking Laws, Other Regulations & Organizational Behavior)', 'published');
SET @set_id = LAST_INSERT_ID();
INSERT INTO gb_questions 
                            (set_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, exam_tip)
                            VALUES (@set_id, 'What is a key concept of: Unit 1: Banking Related Laws - Nepal Rastra Bank Act 2058; Bank and Financial In...?', 'Option A', 'Option B', 'Option C', 'Option D', 'A', 'This is an automated placeholder for Unit 1: Banking Related Laws - Nepal Ras...', 'Review syllabus!');
INSERT INTO gb_questions 
                            (set_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, exam_tip)
                            VALUES (@set_id, 'What is a key concept of: Unit 2: Other Related Laws - Companies Act 2063; Labour Act 2074; Public Procure...?', 'Option A', 'Option B', 'Option C', 'Option D', 'A', 'This is an automated placeholder for Unit 2: Other Related Laws - Companies A...', 'Review syllabus!');
SET @exam_id = (SELECT id FROM gb_exams WHERE title = 'RBB Level 5 - Admin');
INSERT INTO gb_mcq_sets (exam_id, title, status) VALUES (@exam_id, 'Second Paper (Senior Assistant - Admin) - Section B (Organizational Role, Office Supports & Mathematics)', 'published');
SET @set_id = LAST_INSERT_ID();
INSERT INTO gb_questions 
                            (set_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, exam_tip)
                            VALUES (@set_id, 'What is a key concept of: Unit 4: Organizational Role - Customer Service Division (CSD); Customer Satisfac...?', 'Option A', 'Option B', 'Option C', 'Option D', 'A', 'This is an automated placeholder for Unit 4: Organizational Role - Customer S...', 'Review syllabus!');
INSERT INTO gb_questions 
                            (set_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, exam_tip)
                            VALUES (@set_id, 'What is a key concept of: Unit 5: Office Supports - Office Layout & Logistics; Event Organizing; Time Keep...?', 'Option A', 'Option B', 'Option C', 'Option D', 'A', 'This is an automated placeholder for Unit 5: Office Supports - Office Layout ...', 'Review syllabus!');
SET @exam_id = (SELECT id FROM gb_exams WHERE title = 'RBB Level 5 - Cash');
INSERT INTO gb_mcq_sets (exam_id, title, status) VALUES (@exam_id, 'Second Paper (Senior Assistant - Cash) - Section A (Cash Handling, Customer Service & Banking Laws)', 'published');
SET @set_id = LAST_INSERT_ID();
INSERT INTO gb_questions 
                            (set_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, exam_tip)
                            VALUES (@set_id, 'What is a key concept of: Unit 1: Daily Cash Handling - Opening/Closing cash transactions; Security measur...?', 'Option A', 'Option B', 'Option C', 'Option D', 'A', 'This is an automated placeholder for Unit 1: Daily Cash Handling - Opening/Cl...', 'Review syllabus!');
INSERT INTO gb_questions 
                            (set_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, exam_tip)
                            VALUES (@set_id, 'What is a key concept of: Unit 2: Customer Service - Customer Satisfaction & Service; Signature & ID Verif...?', 'Option A', 'Option B', 'Option C', 'Option D', 'A', 'This is an automated placeholder for Unit 2: Customer Service - Customer Sati...', 'Review syllabus!');
SET @exam_id = (SELECT id FROM gb_exams WHERE title = 'RBB Level 5 - Cash');
INSERT INTO gb_mcq_sets (exam_id, title, status) VALUES (@exam_id, 'Second Paper (Senior Assistant - Cash) - Section B (Gold/Silver Loans, Vault Accounting & Other Laws)', 'published');
SET @set_id = LAST_INSERT_ID();
INSERT INTO gb_questions 
                            (set_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, exam_tip)
                            VALUES (@set_id, 'What is a key concept of: Unit 4: Gold/Silver Loan Transactions - Jewellery/Bullion/Bars/Coins identificat...?', 'Option A', 'Option B', 'Option C', 'Option D', 'A', 'This is an automated placeholder for Unit 4: Gold/Silver Loan Transactions - ...', 'Review syllabus!');
INSERT INTO gb_questions 
                            (set_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, exam_tip)
                            VALUES (@set_id, 'What is a key concept of: Unit 5: Accounting and Vault Management - Vault keys & safety, handover/takeover...?', 'Option A', 'Option B', 'Option C', 'Option D', 'A', 'This is an automated placeholder for Unit 5: Accounting and Vault Management ...', 'Review syllabus!');
SET @exam_id = (SELECT id FROM gb_exams WHERE title = 'RBB Level 5 - Admin');
INSERT INTO gb_mcq_sets (exam_id, title, status) VALUES (@exam_id, 'Interview - Interview Panel', 'published');
SET @set_id = LAST_INSERT_ID();
INSERT INTO gb_questions 
                            (set_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, exam_tip)
                            VALUES (@set_id, 'What is a key concept of: Evaluation of candidate''s knowledge, confidence, and suitability for the Senior...?', 'Option A', 'Option B', 'Option C', 'Option D', 'A', 'This is an automated placeholder for Evaluation of candidate''s knowledge, co...', 'Review syllabus!');