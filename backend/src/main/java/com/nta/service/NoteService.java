package com.nta.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nta.dto.request.CreateNoteRequest;
import com.nta.dto.response.NoteResponse;
import com.nta.entity.*;
import com.nta.enums.ErrorCode;
import com.nta.exception.AppException;
import com.nta.repository.*;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class NoteService {

    private final NoteRepository noteRepository;
    private final NoteFieldRepository noteFieldRepository;
    private final FieldRepository fieldRepository;
    private final DeckRepository deckRepository;
    private final NoteTypeRepository noteTypeRepository;
    private final CardRepository cardRepository;
    private final CardStatsRepository cardStatsRepository;

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
            String content = request.getFieldValues().get(field.getName());

            NoteField noteField = new NoteField();
            noteField.setNoteId(savedNote.getId());
            noteField.setFieldId(field.getId());
            noteField.setContent(content);
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
            String content = request.getFieldValues().get(field.getName());
            noteField.setContent(content);
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

        // Get field values
        List<NoteField> noteFields = noteFieldRepository.findByNoteIdOrderedByFieldOrder(note.getId());
        Map<String, String> fieldValues = new HashMap<>();
        for (NoteField noteField : noteFields) {
            Field field = fieldRepository
                    .findById(noteField.getFieldId())
                    .orElseThrow(() -> new AppException(ErrorCode.NOTE_NOT_FOUND));
            fieldValues.put(field.getName(), noteField.getContent());
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
}
