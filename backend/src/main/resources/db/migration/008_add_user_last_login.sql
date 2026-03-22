-- Thời điểm đăng nhập thành công gần nhất
ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL;
