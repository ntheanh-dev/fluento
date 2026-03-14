-- Allow api_keys.user_id to be NULL so "delete" only detaches the key from the user
-- (key row is kept; re-add reattaches with existing credit unchanged).
ALTER TABLE api_keys MODIFY COLUMN user_id BIGINT NULL;
