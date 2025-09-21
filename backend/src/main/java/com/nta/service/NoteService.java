package com.nta.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nta.dto.request.CreateNoteRequest;
import com.nta.dto.response.NoteResponse;
import com.nta.entity.*;
import com.nta.enums.ErrorCode;
import com.nta.exception.AppException;
import com.nta.repository.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NoteService {

    private final NoteRepository noteRepository;
    private final NoteFieldRepository noteFieldRepository;
    private final FieldRepository fieldRepository;
    private final DeckRepository deckRepository;
    private final NoteTypeRepository noteTypeRepository;
    private final CardRepository cardRepository;
    private final CardStatsRepository cardStatsRepository;
    private final FileUploadService fileUploadService;
    private final ObjectMapper objectMapper;

    public NoteResponse createNote(Long userId, CreateNoteRequest request) {
        // Verify deck exists and user has access
        Deck deck = deckRepository
                .findById(request.getDeckId())
                .orElseThrow(() -> new AppException(ErrorCode.DECK_NOT_FOUND));

        if (!deck.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        // Verify note type exists and user has access
        NoteType noteType = noteTypeRepository
                .findById(request.getNoteTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.NOTE_TYPE_NOT_FOUND));

        // Create note
        Note note = new Note();
        note.setNoteTypeId(request.getNoteTypeId());
        note.setDeckId(request.getDeckId());
        note.setUserId(userId);

        Note savedNote = noteRepository.save(note);

        // Create note fields
        List<Field> fields = fieldRepository.findByNoteTypeIdOrderByFieldOrder(request.getNoteTypeId());
        for (Field field : fields) {
            Object fieldValue = request.getFieldValues().get(field.getName());

            NoteField noteField = new NoteField();
            noteField.setNoteId(savedNote.getId());
            noteField.setFieldId(field.getId());

            // Handle different types of field values
            if (fieldValue instanceof String) {
                noteField.setContent((String) fieldValue);
            } else if (fieldValue instanceof MultipartFile) {
                // Handle file upload - save URL to content field
                MultipartFile file = (MultipartFile) fieldValue;
                try {
                    Map<String, Object> uploadResult = fileUploadService.uploadFile(file, "notes");
                    String imageUrl = (String) uploadResult.get("secure_url");
                    noteField.setContent(imageUrl);
                } catch (IOException e) {
                    throw new AppException(ErrorCode.ERROR_KEY_INVALID);
                }
            } else {
                // Handle other types or null
                noteField.setContent(fieldValue != null ? fieldValue.toString() : null);
            }

            noteFieldRepository.save(noteField);
        }

        // Create default card
        createDefaultCard(savedNote, noteType);

        return convertToResponse(savedNote);
    }

    @Transactional(readOnly = true)
    public List<NoteResponse> getNotesByDeck(Long deckId, Long userId) {
        List<Note> notes = noteRepository.findByDeckIdAndUserId(deckId, userId);
        return notes.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    public Page<NoteResponse> getNotesByDeckPaginated(
            Long deckId, Long userId, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Note> notes = noteRepository.findByDeckIdAndUserId(deckId, userId, pageable);

        return notes.map(this::convertToResponse);
    }

    @Transactional(readOnly = true)
    public NoteResponse getNoteById(Long noteId, Long userId) {
        Note note = noteRepository.findById(noteId).orElseThrow(() -> new AppException(ErrorCode.NOTE_NOT_FOUND));

        if (!note.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        return convertToResponse(note);
    }

    public NoteResponse updateNote(Long noteId, Long userId, CreateNoteRequest request) {
        Note note = noteRepository.findById(noteId).orElseThrow(() -> new AppException(ErrorCode.NOTE_NOT_FOUND));

        if (!note.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        // Update note fields
        List<NoteField> noteFields = noteFieldRepository.findByNoteId(noteId);
        for (NoteField noteField : noteFields) {
            Field field = fieldRepository
                    .findById(noteField.getFieldId())
                    .orElseThrow(() -> new AppException(ErrorCode.NOTE_NOT_FOUND));

            Object fieldValue = request.getFieldValues().get(field.getName());

            // Handle different types of field values
            if (fieldValue instanceof String) {
                noteField.setContent((String) fieldValue);
            } else if (fieldValue instanceof MultipartFile) {
                // Handle file upload - save URL to content field
                MultipartFile file = (MultipartFile) fieldValue;

                // Delete old file if exists
                String oldContent = noteField.getContent();
                if (oldContent != null && isCloudinaryUrl(oldContent)) {
                    String oldPublicId = extractPublicIdFromUrl(oldContent);
                    if (oldPublicId != null) {
                        try {
                            fileUploadService.deleteFile(oldPublicId);
                        } catch (IOException e) {
                            // Log error but continue with new upload
                            log.warn("Failed to delete old file from Cloudinary: {}", oldPublicId, e);
                        }
                    }
                }

                try {
                    Map<String, Object> uploadResult = fileUploadService.uploadFile(file, "notes");
                    String imageUrl = (String) uploadResult.get("secure_url");
                    noteField.setContent(imageUrl);
                } catch (IOException e) {
                    throw new AppException(ErrorCode.ERROR_KEY_INVALID);
                }
            } else {
                // Handle other types or null
                noteField.setContent(fieldValue != null ? fieldValue.toString() : null);
            }

            noteFieldRepository.save(noteField);
        }

        Note updatedNote = noteRepository.save(note);
        return convertToResponse(updatedNote);
    }

    public void deleteNote(Long noteId, Long userId) {
        Note note = noteRepository.findById(noteId).orElseThrow(() -> new AppException(ErrorCode.NOTE_NOT_FOUND));

        if (!note.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        // Delete files from Cloudinary before deleting the note
        deleteNoteFilesFromCloud(noteId);

        noteRepository.delete(note);
    }

    private void createDefaultCard(Note note, NoteType noteType) {
        List<Field> fields = fieldRepository.findByNoteTypeIdOrderByFieldOrder(noteType.getId());

        if (fields.size() >= 2) {
            Card card = new Card();
            card.setNoteId(note.getId());
            card.setCardType(Card.CardType.BASIC);
            card.setFrontTemplate("{{" + fields.get(0).getName() + "}}");
            card.setBackTemplate("{{" + fields.get(1).getName() + "}}");
            Card savedCard = cardRepository.save(card);

            // Create initial CardStats for the card
            createInitialCardStats(savedCard.getId(), note.getUserId());
        }
    }

    private NoteResponse convertToResponse(Note note) {
        NoteResponse response = new NoteResponse();
        response.setId(note.getId());
        response.setNoteTypeId(note.getNoteTypeId());
        response.setDeckId(note.getDeckId());
        response.setUserId(note.getUserId());
        response.setCreatedAt(note.getCreatedAt());
        response.setUpdatedAt(note.getUpdatedAt());

        // Get field values (includes both text and image URLs)
        List<NoteField> noteFields = noteFieldRepository.findByNoteIdOrderedByFieldOrder(note.getId());
        Map<String, String> fieldValues = new HashMap<>();

        for (NoteField noteField : noteFields) {
            Field field = fieldRepository
                    .findById(noteField.getFieldId())
                    .orElseThrow(() -> new AppException(ErrorCode.NOTE_NOT_FOUND));

            // Add content (can be text or image URL)
            if (noteField.getContent() != null) {
                fieldValues.put(field.getName(), noteField.getContent());
            }
        }

        response.setFieldValues(fieldValues);

        // Get cards
        List<Card> cards = cardRepository.findByNoteId(note.getId());
        response.setCards(cards.stream()
                .map(card -> {
                    NoteResponse.CardResponse cardResponse = new NoteResponse.CardResponse();
                    cardResponse.setId(card.getId());
                    cardResponse.setCardType(card.getCardType());
                    cardResponse.setFrontTemplate(card.getFrontTemplate());
                    cardResponse.setBackTemplate(card.getBackTemplate());
                    cardResponse.setCreatedAt(card.getCreatedAt());
                    return cardResponse;
                })
                .collect(Collectors.toList()));

        return response;
    }

    private void createInitialCardStats(Long cardId, Long userId) {
        CardStats stats = new CardStats();
        stats.setCardId(cardId);
        stats.setUserId(userId);
        stats.setEaseFactor(new java.math.BigDecimal("2.50")); // Initial ease factor
        stats.setIntervalDays(1); // Initial interval
        stats.setRepetitions(0);
        stats.setLapses(0);
        stats.setDueDate(LocalDateTime.now()); // Due immediately for new cards
        stats.setLastReviewedAt(null);

        cardStatsRepository.save(stats);
    }

    /**
     * Creates a note with support for file uploads.
     * Handles both text fields and image files.
     *
     * @param userId the user ID
     * @param noteTypeId the note type ID
     * @param deckId the deck ID
     * @param fieldValuesJson JSON string containing field values for text fields
     * @param fileFieldsJson JSON string containing field names that have files
     * @param files the uploaded files
     * @return created note response
     */
    public NoteResponse createNoteWithFiles(
            Long userId,
            Long noteTypeId,
            Long deckId,
            String fieldValuesJson,
            String fileFieldsJson,
            MultipartFile[] files) {

        try {
            // Parse JSON strings to maps
            Map<String, String> fieldValues = new HashMap<>();
            Map<String, String> fileFields = new HashMap<>();

            if (fieldValuesJson != null && !fieldValuesJson.trim().isEmpty()) {
                fieldValues = objectMapper.readValue(fieldValuesJson, new TypeReference<Map<String, String>>() {});
            }

            if (fileFieldsJson != null && !fileFieldsJson.trim().isEmpty()) {
                fileFields = objectMapper.readValue(fileFieldsJson, new TypeReference<Map<String, String>>() {});
            }

            // Verify deck exists and user has access
            Deck deck = deckRepository.findById(deckId).orElseThrow(() -> new AppException(ErrorCode.DECK_NOT_FOUND));

            if (!deck.getUserId().equals(userId)) {
                throw new AppException(ErrorCode.ACCESS_DENIED);
            }

            // Verify note type exists and user has access
            NoteType noteType = noteTypeRepository
                    .findById(noteTypeId)
                    .orElseThrow(() -> new AppException(ErrorCode.NOTE_TYPE_NOT_FOUND));

            // Create note
            Note note = new Note();
            note.setNoteTypeId(noteTypeId);
            note.setDeckId(deckId);
            note.setUserId(userId);

            Note savedNote = noteRepository.save(note);

            // Create note fields
            List<Field> fields = fieldRepository.findByNoteTypeIdOrderByFieldOrder(noteTypeId);
            Map<String, MultipartFile> fileMap = createFileMap(files, fileFields);

            for (Field field : fields) {
                NoteField noteField = new NoteField();
                noteField.setNoteId(savedNote.getId());
                noteField.setFieldId(field.getId());

                // Check if this field has a file
                if (fileMap.containsKey(field.getName())) {
                    MultipartFile file = fileMap.get(field.getName());
                    // Upload file and store URL
                    try {
                        Map<String, Object> uploadResult = fileUploadService.uploadFile(file, "notes");
                        String imageUrl = (String) uploadResult.get("secure_url");
                        noteField.setContent(imageUrl);
                    } catch (IOException e) {
                        throw new AppException(ErrorCode.ERROR_KEY_INVALID);
                    }
                } else {
                    // Handle text field
                    String content = fieldValues.get(field.getName());
                    noteField.setContent(content);
                }

                noteFieldRepository.save(noteField);
            }

            // Create default card
            createDefaultCard(savedNote, noteType);

            return convertToResponse(savedNote);

        } catch (IOException e) {
            throw new AppException(ErrorCode.ERROR_KEY_INVALID);
        }
    }

    /**
     * Creates a map of field names to MultipartFile objects.
     *
     * @param files the uploaded files
     * @param fileFields map of field names to file names
     * @return map of field names to MultipartFile objects
     */
    private Map<String, MultipartFile> createFileMap(MultipartFile[] files, Map<String, String> fileFields) {
        Map<String, MultipartFile> fileMap = new HashMap<>();

        if (files == null || fileFields == null) {
            return fileMap;
        }

        // Create a map of file names to MultipartFile objects
        Map<String, MultipartFile> fileNameToFile = new HashMap<>();
        for (MultipartFile file : files) {
            fileNameToFile.put(file.getOriginalFilename(), file);
        }

        // Map field names to their corresponding files
        for (Map.Entry<String, String> entry : fileFields.entrySet()) {
            String fieldName = entry.getKey();
            String fileName = entry.getValue();
            MultipartFile file = fileNameToFile.get(fileName);
            if (file != null) {
                fileMap.put(fieldName, file);
            }
        }

        return fileMap;
    }

    /**
     * Deletes all files associated with a note from Cloudinary.
     *
     * @param noteId the note ID
     */
    private void deleteNoteFilesFromCloud(Long noteId) {
        try {
            List<NoteField> noteFields = noteFieldRepository.findByNoteId(noteId);

            for (NoteField noteField : noteFields) {
                String content = noteField.getContent();
                if (content != null && isCloudinaryUrl(content)) {
                    String publicId = extractPublicIdFromUrl(content);
                    if (publicId != null) {
                        try {
                            fileUploadService.deleteFile(publicId);
                        } catch (IOException e) {
                            // Log error but don't fail the note deletion
                            log.warn("Failed to delete file from Cloudinary: {}", publicId, e);
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Log error but don't fail the note deletion
            log.error("Error deleting note files from Cloudinary", e);
        }
    }

    /**
     * Checks if a URL is a Cloudinary URL.
     *
     * @param url the URL to check
     * @return true if it's a Cloudinary URL
     */
    private boolean isCloudinaryUrl(String url) {
        return url != null && url.contains("res.cloudinary.com");
    }

    /**
     * Extracts the public ID from a Cloudinary URL.
     *
     * @param url the Cloudinary URL
     * @return the public ID or null if extraction fails
     */
    private String extractPublicIdFromUrl(String url) {
        try {
            // Cloudinary URL format:
            // https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
            // We need to extract only the public_id part (without version)

            if (url == null || !url.contains("res.cloudinary.com")) {
                log.debug("Invalid Cloudinary URL: {}", url);
                return null;
            }

            // Find the part after "/upload/"
            int uploadIndex = url.indexOf("/upload/");
            if (uploadIndex == -1) {
                log.debug("No '/upload/' found in URL: {}", url);
                return null;
            }

            // Extract everything after "/upload/"
            String afterUpload = url.substring(uploadIndex + 8); // 8 = length of "/upload/"

            // Remove file extension if present
            if (afterUpload.contains(".")) {
                afterUpload = afterUpload.substring(0, afterUpload.lastIndexOf("."));
            }

            // The public ID is everything after the version (if present)
            // Version format: v{timestamp} or just the public_id
            String publicId = afterUpload;

            // If it starts with 'v' followed by digits, remove the version part
            if (afterUpload.matches("^v\\d+/.+")) {
                publicId = afterUpload.substring(afterUpload.indexOf('/') + 1);
            }

            return publicId.isEmpty() ? null : publicId;

        } catch (Exception e) {
            log.error("Error extracting public ID from URL: {}", url, e);
            return null;
        }
    }
}
