CREATE TABLE IF NOT EXISTS vocabularies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    target_language VARCHAR(5) NOT NULL,
    text VARCHAR(255) NOT NULL,
    part_of_speech VARCHAR(100),
    meaning TEXT,
    pronunciation VARCHAR(255),
    example_sentence TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_vocabularies_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_vocabularies_user_language_text UNIQUE (user_id, target_language, text)
);

CREATE TABLE IF NOT EXISTS decks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    target_language VARCHAR(5) NOT NULL,
    name VARCHAR(150) NOT NULL,
    icon VARCHAR(64) NOT NULL DEFAULT 'book-open',
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_decks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_decks_user_language_name UNIQUE (user_id, target_language, name)
);

CREATE TABLE IF NOT EXISTS deck_vocabularies (
    deck_id BIGINT NOT NULL,
    vocabulary_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (deck_id, vocabulary_id),
    CONSTRAINT fk_deck_vocabularies_deck FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE,
    CONSTRAINT fk_deck_vocabularies_vocabulary FOREIGN KEY (vocabulary_id) REFERENCES vocabularies(id) ON DELETE CASCADE
);

CREATE INDEX idx_vocabularies_user_language ON vocabularies(user_id, target_language);
CREATE INDEX idx_decks_user_language ON decks(user_id, target_language);
CREATE INDEX idx_deck_vocabularies_vocabulary_id ON deck_vocabularies(vocabulary_id);
