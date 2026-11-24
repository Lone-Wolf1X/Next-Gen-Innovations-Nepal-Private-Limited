-- ========================================================
-- GyanBazi Live Database Schema 
-- (For Categories, Exams, Sets, and Questions)
-- ========================================================

-- 1. Categories Table (e.g., Government, Banking, Security)
CREATE TABLE IF NOT EXISTS `gb_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Exams Table (formerly vacancies)
CREATE TABLE IF NOT EXISTS `gb_exams` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `emoji_icon` VARCHAR(10) DEFAULT '🇳🇵',
  `color_hex` VARCHAR(10) DEFAULT '#173B7A',
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `gb_categories`(`id`) ON DELETE CASCADE
);

-- 3. MCQ Sets Table (For daily sets or specific chapters)
CREATE TABLE IF NOT EXISTS `gb_mcq_sets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `exam_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `set_date` DATE NOT NULL,
  `time_limit_minutes` INT DEFAULT 25,
  `status` ENUM('DRAFT', 'UNDER_REVIEW', 'PUBLISHED') DEFAULT 'DRAFT',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`exam_id`) REFERENCES `gb_exams`(`id`) ON DELETE CASCADE
);

-- 4. Questions Table (The actual MCQs)
CREATE TABLE IF NOT EXISTS `gb_questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `set_id` INT NOT NULL,
  `question_text` TEXT NOT NULL,
  `option_a` VARCHAR(255) NOT NULL,
  `option_b` VARCHAR(255) NOT NULL,
  `option_c` VARCHAR(255) NOT NULL,
  `option_d` VARCHAR(255) NOT NULL,
  `correct_option` ENUM('A', 'B', 'C', 'D') NOT NULL,
  `explanation` TEXT,
  `exam_tip` VARCHAR(255),
  `is_verified` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`set_id`) REFERENCES `gb_mcq_sets`(`id`) ON DELETE CASCADE
);

-- ========================================================
-- Seed Initial Data (Mock values for testing UI)
-- ========================================================

INSERT INTO `gb_categories` (`name`, `description`) VALUES 
('Government (Lok Sewa)', 'Civil service exams'),
('Banking', 'RBB, NRB, ADBL'),
('Security Forces', 'Nepal Police, Army');

INSERT INTO `gb_exams` (`category_id`, `title`, `emoji_icon`, `color_hex`) VALUES 
(1, 'Kharidar', '📝', '#173B7A'),
(1, 'Nayab Subba', '🇳🇵', '#F59E0B'),
(2, 'Rastriya Banijya Bank', '🏦', '#16A34A');

INSERT INTO `gb_mcq_sets` (`exam_id`, `title`, `set_date`, `status`) VALUES 
(1, 'Constitution Basics', CURDATE(), 'PUBLISHED'),
(1, 'Daily Mission - Set 2', CURDATE(), 'UNDER_REVIEW');

INSERT INTO `gb_questions` (`set_id`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `explanation`, `exam_tip`, `is_verified`) VALUES 
(1, 'नेपालको संविधानमा मौलिक हक कति वटा छन्?', '25', '31', '35', '37', 'B', 'नेपालको संविधानको भाग ३ मा ३१ वटा मौलिक हक सम्बन्धी व्यवस्था गरिएको छ।', 'यो topic Lok Sewa मा frequently पूछिने topics मध्ये एक हो।', TRUE),
(1, 'What is the capital of Nepal?', 'Pokhara', 'Lumbini', 'Kathmandu', 'Chitwan', 'C', 'Kathmandu is the capital and largest city of Nepal.', 'Basic geography is always asked in section 1.', TRUE);
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