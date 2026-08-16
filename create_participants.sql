CREATE TABLE IF NOT EXISTS sprint_participants (
    id VARCHAR(36) NOT NULL,
    sprint_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_user_sprint (sprint_id, user_id),
    CONSTRAINT fk_sprint_part FOREIGN KEY (sprint_id) REFERENCES daily_sprints(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
