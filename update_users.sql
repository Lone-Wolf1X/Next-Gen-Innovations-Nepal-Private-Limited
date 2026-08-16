ALTER TABLE users 
ADD COLUMN last_checkin_date DATE DEFAULT NULL,
ADD COLUMN points_last_updated DATE DEFAULT NULL,
ADD COLUMN daily_points INT DEFAULT 0,
ADD COLUMN total_points INT DEFAULT 0,
ADD COLUMN current_streak INT DEFAULT 0,
ADD COLUMN last_login_date DATE DEFAULT NULL,
ADD COLUMN tests_taken_today INT DEFAULT 0,
ADD COLUMN total_tests_completed INT DEFAULT 0;
