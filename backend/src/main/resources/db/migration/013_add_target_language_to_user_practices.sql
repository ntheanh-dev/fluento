ALTER TABLE user_practices
    ADD COLUMN target_language VARCHAR(5) NOT NULL DEFAULT 'EN';

UPDATE user_practices
SET target_language = 'EN'
WHERE target_language IS NULL OR target_language = '';
