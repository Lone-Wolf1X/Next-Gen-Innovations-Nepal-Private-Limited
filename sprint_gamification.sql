ALTER TABLE daily_sprints
ADD COLUMN invite_code VARCHAR(50) NULL AFTER model_set_id,
ADD COLUMN unlock_threshold INT DEFAULT 10 AFTER invite_code,
ADD COLUMN is_unlocked TINYINT(1) DEFAULT 0 AFTER unlock_threshold;

CREATE TABLE IF NOT EXISTS sprint_participants (
    id VARCHAR(36) PRIMARY KEY,
    sprint_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sprint_id) REFERENCES daily_sprints(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_sprint (sprint_id, user_id)
);
