CREATE TABLE IF NOT EXISTS ai_chat_memory (
                                              id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                              conversation_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
