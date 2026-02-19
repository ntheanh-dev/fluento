-- Fluento Database Initialization Script
-- This script creates the complete database schema for Fluento application

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS fluento CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fluento;

-- ==============================================
-- 1. PERMISSIONS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS permission (
    name VARCHAR(255) PRIMARY KEY,
    description TEXT
);

-- ==============================================
-- 2. ROLES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS role (
    name VARCHAR(255) PRIMARY KEY,
    description TEXT
);

-- ==============================================
-- 3. ROLE_PERMISSIONS JUNCTION TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS role_permissions (
    role_name VARCHAR(255),
    permission_name VARCHAR(255),
    PRIMARY KEY (role_name, permission_name),
    FOREIGN KEY (role_name) REFERENCES role(name) ON DELETE CASCADE,
    FOREIGN KEY (permission_name) REFERENCES permission(name) ON DELETE CASCADE
);

-- ==============================================
-- 4. USERS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255),
    url_avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- 5. USER_ROLES JUNCTION TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT,
    role_name VARCHAR(255),
    PRIMARY KEY (user_id, role_name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_name) REFERENCES role(name) ON DELETE CASCADE
);

-- ==============================================
-- 6. INVALIDATED_TOKENS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS invalidated_token (
    id VARCHAR(255) PRIMARY KEY,
    expiry_time TIMESTAMP
);

-- ==============================================
-- 7. LEVELS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS levels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(10) NOT NULL UNIQUE,
    description TEXT
);

-- ==============================================
-- 8. TONES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS tones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    description TEXT
);

-- ==============================================
-- 9. TOPIC_GROUP TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS topic_group (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- ==============================================
-- 10. TOPICS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS topics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    topic_group_id BIGINT NOT NULL,
    FOREIGN KEY (topic_group_id) REFERENCES topic_group(id) ON DELETE CASCADE
);

-- ==============================================
-- 11. SENTENCE_COUNT TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS sentence_count (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    size INT NOT NULL UNIQUE
);

-- ==============================================
-- 12. WRITINGS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS writings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT,
    tone_id BIGINT,
    topic_id BIGINT,
    level_id BIGINT,
    sentence_count_id BIGINT,
    vietnamese_paragraph TEXT,
    translated_paragraph TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (tone_id) REFERENCES tones(id) ON DELETE SET NULL,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL,
    FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE SET NULL,
    FOREIGN KEY (sentence_count_id) REFERENCES sentence_count(id) ON DELETE SET NULL
);

-- ==============================================
-- 13. SENTENCES TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS sentences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vietnamese TEXT NOT NULL,
    english_translation TEXT NOT NULL,
    writing_id BIGINT NOT NULL,
    order_index INT NOT NULL,
    score INT NOT NULL DEFAULT 0,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (writing_id) REFERENCES writings(id) ON DELETE CASCADE
);

-- ==============================================
-- 15. SPRING AI CHAT MEMORY TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS spring_ai_chat_memory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    timestamp DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_conversation_id_timestamp (conversation_id, timestamp)
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_writings_user_id ON writings(user_id);
CREATE INDEX IF NOT EXISTS idx_writings_conversation_id ON writings(conversation_id);
CREATE INDEX IF NOT EXISTS idx_sentences_writing_id ON sentences(writing_id);
CREATE INDEX IF NOT EXISTS idx_topics_topic_group_id ON topics(topic_group_id);

-- ==============================================
-- INITIAL DATA INSERTION
-- ==============================================

-- Insert default permissions
INSERT IGNORE INTO permission (name, description) VALUES
('READ_USER', 'Read user information'),
('WRITE_USER', 'Create and update user information'),
('DELETE_USER', 'Delete user'),
('READ_WRITING', 'Read writing content'),
('WRITE_WRITING', 'Create and update writing content'),
('DELETE_WRITING', 'Delete writing content');

-- Insert default roles
INSERT IGNORE INTO role (name, description) VALUES
('USER', 'Regular user with basic permissions'),
('ADMIN', 'Administrator with full permissions');

-- Assign permissions to roles
INSERT IGNORE INTO role_permissions (role_name, permission_name) VALUES
('USER', 'READ_USER'),
('USER', 'WRITE_USER'),
('USER', 'READ_WRITING'),
('USER', 'WRITE_WRITING'),
('ADMIN', 'READ_USER'),
('ADMIN', 'WRITE_USER'),
('ADMIN', 'DELETE_USER'),
('ADMIN', 'READ_WRITING'),
('ADMIN', 'WRITE_WRITING'),
('ADMIN', 'DELETE_WRITING');

-- Insert default levels
INSERT IGNORE INTO levels (name, description) VALUES
('A1', 'Beginner level - Basic vocabulary and simple sentences'),
('A2', 'Elementary level - Common expressions and routine tasks'),
('B1', 'Intermediate level - Clear standard input on familiar matters'),
('B2', 'Upper-intermediate level - Complex text on concrete and abstract topics'),
('C1', 'Advanced level - Complex text with implicit meaning'),
('C2', 'Proficiency level - Effortless understanding of virtually everything');

-- Insert default tones
INSERT IGNORE INTO tones (name, description) VALUES
('Formal', 'Trang trọng, lịch sự'),
('Informal', 'Thân mật, đời thường'),
('Friendly', 'Thân thiện, ấm áp'),
('Professional', 'Chuyên nghiệp, chuẩn mực');

-- Insert default sentence counts
INSERT IGNORE INTO sentence_count (size) VALUES
(5), (10), (15), (20);

-- Insert default topic groups
INSERT IGNORE INTO topic_group (name) VALUES
('Giao tiếp hàng ngày'),
('Công việc và học tập'),
('Du lịch và giải trí'),
('Sức khỏe và thể thao'),
('Công nghệ và khoa học');

-- Insert default topics
INSERT IGNORE INTO topics (name, description, topic_group_id) VALUES
-- Giao tiếp hàng ngày
('life', 'Cuộc sống', 1),
('health', 'Sức khỏe', 1),
('education', 'Giáo dục', 1),
('environment', 'Môi trường', 1),
('culture', 'Văn hóa', 1),
('technology', 'Công nghệ', 1),
('travel', 'Du lịch', 1),
('food', 'Ẩm thực', 1),
('family', 'Gia đình', 1),
('friendship', 'Tình bạn', 1),

-- Công việc và học tập
('work', 'Công việc', 2),
('study', 'Học tập', 2),
('career', 'Nghề nghiệp', 2),
('business', 'Kinh doanh', 2),
('finance', 'Tài chính', 2),
('science', 'Khoa học', 2),
('research', 'Nghiên cứu', 2),

-- Du lịch và giải trí
('vacation', 'Kỳ nghỉ', 3),
('entertainment', 'Giải trí', 3),
('sports', 'Thể thao', 3),
('music', 'Âm nhạc', 3),
('movies', 'Phim ảnh', 3),
('books', 'Sách', 3),
('art', 'Nghệ thuật', 3),

-- Sức khỏe và thể thao
('fitness', 'Thể dục', 4),
('medicine', 'Y tế', 4),
('mental_health', 'Sức khỏe tinh thần', 4),
('nutrition', 'Dinh dưỡng', 4),

-- Công nghệ và khoa học
('artificial_intelligence', 'Trí tuệ nhân tạo', 5),
('programming', 'Lập trình', 5),
('internet', 'Internet', 5),
('innovation', 'Đổi mới', 5),
('future', 'Tương lai', 5);

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================
SELECT 'Fluento database schema initialized successfully!' as message;
