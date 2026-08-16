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
    daily_points INT DEFAULT 0,
    points_last_updated DATE NULL,
    last_login_date DATE NULL,
    last_checkin_date DATE NULL,
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

CREATE TABLE IF NOT EXISTS vacancies (
    id VARCHAR(36) PRIMARY KEY,
    category_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    application_open_date DATE,
    application_close_date DATE,
    double_fee_start_date DATE,
    double_fee_end_date DATE,
    exam_date DATE NULL,
    has_objective BOOLEAN DEFAULT TRUE,
    has_subjective BOOLEAN DEFAULT FALSE,
    roadmap_html LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES exam_categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS enrollments (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL,
    vacancy_id VARCHAR(36) NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, vacancy_id),
    FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE,
    FOREIGN KEY (vacancy_id) REFERENCES vacancies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subjective_topics (
    id VARCHAR(36) PRIMARY KEY,
    vacancy_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    display_order INT DEFAULT 0,
    FOREIGN KEY (vacancy_id) REFERENCES vacancies(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subjective_questions (
    id VARCHAR(36) PRIMARY KEY,
    topic_id VARCHAR(36) NOT NULL,
    question_text TEXT NOT NULL,
    writing_guide TEXT NOT NULL,
    sample_answer TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES subjective_topics(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS model_sets (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id VARCHAR(36) NOT NULL,
    vacancy_id VARCHAR(36) NULL,
    question_ids JSON NOT NULL,
    time_limit_minutes INT DEFAULT 60,
    total_marks DECIMAL(6,2) DEFAULT 100.00,
    status VARCHAR(50) DEFAULT 'draft',
    is_daily_live BOOLEAN DEFAULT FALSE,
    live_start_time DATETIME NULL,
    live_end_time DATETIME NULL,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES exam_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (vacancy_id) REFERENCES vacancies(id) ON DELETE SET NULL
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

CREATE TABLE IF NOT EXISTS daily_sprints (
    id VARCHAR(36) PRIMARY KEY,
    model_set_id VARCHAR(36) NOT NULL,
    sprint_date DATE NOT NULL UNIQUE,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

-- Insert Vacancies (Courses)
INSERT IGNORE INTO vacancies (id, category_id, title, description, application_open_date, application_close_date, double_fee_start_date, double_fee_end_date, exam_date, has_objective, has_subjective, roadmap_html) VALUES
('vac-rbb-4-5', 'cat-rbb', 'RBB Level 5 (Senior Assistant & Cash)', 'Comprehensive preparation course for Rastriya Banijaya Bank Level 5 (Senior Assistant - Admin & Cash) Koshi Pradesh. Includes both objective and subjective preparation.', '2026-07-03', '2026-07-23', '2026-07-24', '2026-07-30', NULL, TRUE, TRUE, '<div class="roadmap"><h3>Phase 1: Objective Focus (MCQs)</h3><p>Focus on Banking basics and General Knowledge. Practice daily live exams.</p><h3>Phase 2: Subjective Writing</h3><p>Start practicing answers. Follow our subjective writing guides.</p></div>'),
('vac-sanstha-4', 'cat-sanstha', 'Sangathit Sanstha Level 4', 'Preparation for Public Enterprises Level 4 Assistant. Objective only.', '2024-04-01', '2024-04-20', '2024-04-21', '2024-04-27', '2024-07-10', TRUE, FALSE, '<div class="roadmap"><h3>Phase 1: Core Subjects</h3><p>Study Public Admin & Finance basics.</p><h3>Phase 2: Intensive Practice</h3><p>Take as many mock tests as possible to increase accuracy.</p></div>');

-- Insert Subjective Topics
INSERT IGNORE INTO subjective_topics (id, vacancy_id, title, display_order) VALUES
('stopic-rbb-1', 'vac-rbb-4-5', 'Banking Laws & Regulations', 1),
('stopic-rbb-2', 'vac-rbb-4-5', 'Accounting & Financial Statement Analysis', 2);

-- Insert Subjective Questions (Study Guide)
INSERT IGNORE INTO subjective_questions (id, topic_id, question_text, writing_guide, sample_answer) VALUES
('sques-1', 'stopic-rbb-1', 'What are the main functions of the Central Bank (NRB) in Nepal?', '<h3>How to tackle this question:</h3><ul><li>Start with a brief introduction of NRB (established date, mandate).</li><li>Use bullet points to list functions: Note issue, monetary policy, foreign exchange regulation, banker to government.</li><li>End with a short concluding sentence about its role in economic stability.</li><li><strong>Boundary:</strong> Do not write about commercial bank functions. Keep it strict to NRB Act provisions.</li></ul>', 'The Nepal Rastra Bank (NRB), established in 2013 B.S., is the central bank of Nepal...'),
('sques-2', 'stopic-rbb-2', 'Explain the difference between Cash Basis and Accrual Basis of Accounting.', '<h3>How to tackle this question:</h3><ul><li>Create a comparison table if possible.</li><li>Highlight key differences: timing of recognition, legal compliance, matching principle.</li><li><strong>Boundary:</strong> Stick to the definitions. No need for complex journal entries.</li></ul>', 'Cash basis accounting recognizes revenue when cash is received... accrual recognizes when earned...');
