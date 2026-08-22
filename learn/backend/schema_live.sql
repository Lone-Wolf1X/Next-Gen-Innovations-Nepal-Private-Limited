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
