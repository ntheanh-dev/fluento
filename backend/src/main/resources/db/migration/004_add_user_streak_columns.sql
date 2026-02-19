ALTER TABLE users
    ADD COLUMN current_streak INT NOT NULL DEFAULT 0,
    ADD COLUMN longest_streak INT NOT NULL DEFAULT 0,
    ADD COLUMN last_practice_date DATE NULL;

