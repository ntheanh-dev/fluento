-- Change users.credits from BIGINT to INT
ALTER TABLE users MODIFY COLUMN credits INT NOT NULL DEFAULT 0;
