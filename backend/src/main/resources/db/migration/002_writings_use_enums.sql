-- Replace topic_id, tone_id, level_id, sentence_count_id with enum columns in writings

-- Add new enum columns
ALTER TABLE writings ADD COLUMN tone VARCHAR(50) NULL;
ALTER TABLE writings ADD COLUMN topic VARCHAR(50) NULL;
ALTER TABLE writings ADD COLUMN level VARCHAR(50) NULL;
ALTER TABLE writings ADD COLUMN sentence_count VARCHAR(50) NULL;

-- Migrate existing data from FK tables
UPDATE writings w
LEFT JOIN tones t ON w.tone_id = t.id
SET w.tone = t.name
WHERE t.name IS NOT NULL;

UPDATE writings w
LEFT JOIN topics tp ON w.topic_id = tp.id
SET w.topic = UPPER(REPLACE(tp.name, '-', '_'))
WHERE tp.name IS NOT NULL;

UPDATE writings w
LEFT JOIN levels l ON w.level_id = l.id
SET w.level = l.name
WHERE l.name IS NOT NULL;

UPDATE writings w
LEFT JOIN sentence_count sc ON w.sentence_count_id = sc.id
SET w.sentence_count = CASE sc.size
    WHEN 5 THEN 'FIVE'
    WHEN 10 THEN 'TEN'
    WHEN 15 THEN 'FIFTEEN'
    WHEN 20 THEN 'TWENTY'
    ELSE NULL END
WHERE sc.size IS NOT NULL;

-- Drop foreign keys (MySQL auto-generated names; adjust if your schema differs)
ALTER TABLE writings DROP FOREIGN KEY writings_ibfk_2;
ALTER TABLE writings DROP FOREIGN KEY writings_ibfk_3;
ALTER TABLE writings DROP FOREIGN KEY writings_ibfk_4;
ALTER TABLE writings DROP FOREIGN KEY writings_ibfk_5;

ALTER TABLE writings DROP COLUMN tone_id;
ALTER TABLE writings DROP COLUMN topic_id;
ALTER TABLE writings DROP COLUMN level_id;
ALTER TABLE writings DROP COLUMN sentence_count_id;

-- Drop lookup tables
DROP TABLE IF EXISTS topics;
DROP TABLE IF EXISTS topic_group;
DROP TABLE IF EXISTS tones;
DROP TABLE IF EXISTS levels;
DROP TABLE IF EXISTS sentence_count;
