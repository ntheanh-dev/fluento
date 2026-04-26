CREATE TABLE IF NOT EXISTS paragraph_sentence_hints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    paragraph_sentence_id BIGINT NOT NULL,
    target_language VARCHAR(5) NOT NULL,
    hints_json JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_paragraph_sentence_hints_sentence
        FOREIGN KEY (paragraph_sentence_id) REFERENCES paragraph_sentences(id) ON DELETE CASCADE,
    CONSTRAINT uk_paragraph_sentence_hints_sentence_language
        UNIQUE (paragraph_sentence_id, target_language)
);

CREATE INDEX idx_paragraph_sentence_hints_sentence
    ON paragraph_sentence_hints(paragraph_sentence_id);

INSERT INTO paragraph_sentence_hints (paragraph_sentence_id, target_language, hints_json, created_at)
SELECT ps.id, 'EN', ps.hints, CURRENT_TIMESTAMP
FROM paragraph_sentences ps
WHERE ps.hints IS NOT NULL
  AND JSON_VALID(ps.hints)
  AND NOT EXISTS (
      SELECT 1
      FROM paragraph_sentence_hints psh
      WHERE psh.paragraph_sentence_id = ps.id
        AND psh.target_language = 'EN'
  );
