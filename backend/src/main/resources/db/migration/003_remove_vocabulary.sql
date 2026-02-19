-- Remove vocabulary_library table and related permissions

-- Drop vocabulary_library table
DROP TABLE IF EXISTS vocabulary_library;

-- Remove vocabulary permissions from role_permissions
DELETE FROM role_permissions WHERE permission_name IN ('READ_VOCABULARY', 'WRITE_VOCABULARY', 'DELETE_VOCABULARY');

-- Remove vocabulary permissions from permission table
DELETE FROM permission WHERE name IN ('READ_VOCABULARY', 'WRITE_VOCABULARY', 'DELETE_VOCABULARY');
