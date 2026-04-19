-- Remove per-user API key management; AI uses server-configured key.
ALTER TABLE users DROP COLUMN active_api_key_id;

DROP TABLE IF EXISTS api_keys;
