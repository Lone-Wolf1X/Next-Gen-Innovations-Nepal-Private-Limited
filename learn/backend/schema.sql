CREATE TABLE IF NOT EXISTS users (
    uid VARCHAR(128) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    nickname VARCHAR(100) NULL,
    phone_number VARCHAR(20) NULL,
    gender VARCHAR(10) NULL,
    avatar_url LONGTEXT NULL,
    photo_url TEXT,
    total_tests_attempted INT DEFAULT 0,
    total_tests_completed INT DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0.00,
    best_score DECIMAL(5,2) DEFAULT 0.00,
    subscription_tier VARCHAR(50) DEFAULT 'free',
    role VARCHAR(50) DEFAULT 'user',
    tests_taken_today INT DEFAULT 0,
    last_test_date DATE NULL,
    current_streak INT DEFAULT 0,
    total_points INT DEFAULT 0,
    last_login_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exam_categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(128)
);

CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(36) PRIMARY KEY,
    category_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES exam_categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(36) PRIMARY KEY,
    category_id VARCHAR(36) NOT NULL,
    subject_id VARCHAR(36) NOT NULL,
    question_text TEXT NOT NULL,
    options JSON NOT NULL,
    correct_option VARCHAR(255) NOT NULL,
    explanation TEXT,
    marks DECIMAL(5,2) DEFAULT 1.00,
    negative_marks DECIMAL(5,2) DEFAULT 0.25,
    status VARCHAR(50) DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES exam_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS model_sets (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id VARCHAR(36) NOT NULL,
    question_ids JSON NOT NULL,
    time_limit_minutes INT DEFAULT 60,
    total_marks DECIMAL(6,2) DEFAULT 100.00,
    status VARCHAR(50) DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES exam_categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS test_attempts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL,
    model_set_id VARCHAR(36) NOT NULL,
    status VARCHAR(50) DEFAULT 'in_progress',
    time_remaining_seconds INT NOT NULL,
    answers JSON,
    marked_for_review JSON,
    total_questions INT NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE,
    FOREIGN KEY (model_set_id) REFERENCES model_sets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS test_results (
    id VARCHAR(36) PRIMARY KEY,
    attempt_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(128) NOT NULL,
    model_set_id VARCHAR(36) NOT NULL,
    total_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    incorrect_answers INT NOT NULL,
    unattempted_questions INT NOT NULL,
    marks_obtained DECIMAL(6,2) NOT NULL,
    negative_marks DECIMAL(6,2) NOT NULL,
    final_score DECIMAL(6,2) NOT NULL,
    total_marks DECIMAL(6,2) NOT NULL,
    score_percentage DECIMAL(5,2) NOT NULL,
    accuracy DECIMAL(5,2) NOT NULL,
    time_taken_seconds INT NOT NULL,
    is_personal_best BOOLEAN DEFAULT FALSE,
    question_review JSON NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attempt_id) REFERENCES test_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE,
    FOREIGN KEY (model_set_id) REFERENCES model_sets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id VARCHAR(128) NOT NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    changes JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- SEED DATA: Exam Categories & Syllabus Subjects (Roadmap)
-- =========================================================

-- Insert RBB and Sangathit Sanstha Categories
INSERT IGNORE INTO exam_categories (id, name, description, icon, display_order) VALUES
('cat-rbb', 'Rastriya Banijya Bank', 'RBB Level 4 & 5 Preparation', '🏦', 1),
('cat-sanstha', 'Sangathit Sanstha', 'Public Enterprises & Corporations', '🏛️', 2);

-- Insert Detailed Syllabus Subjects (Roadmap) for RBB
INSERT IGNORE INTO subjects (id, category_id, name, display_order) VALUES
('sub-rbb-1', 'cat-rbb', 'Banking & Financial System', 1),
('sub-rbb-2', 'cat-rbb', 'Accounting & Auditing', 2),
('sub-rbb-3', 'cat-rbb', 'Management & IT', 3),
('sub-rbb-4', 'cat-rbb', 'Acts & Regulations (Banking Laws)', 4),
('sub-rbb-5', 'cat-rbb', 'General Knowledge & Economics', 5);

-- Insert Detailed Syllabus Subjects (Roadmap) for Sangathit Sanstha
INSERT IGNORE INTO subjects (id, category_id, name, display_order) VALUES
('sub-san-1', 'cat-sanstha', 'Public Administration & Management', 1),
('sub-san-2', 'cat-sanstha', 'Financial Management', 2),
('sub-san-3', 'cat-sanstha', 'General Knowledge (Nepal & World)', 3),
('sub-san-4', 'cat-sanstha', 'IT & Current Affairs', 4);
