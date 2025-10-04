package com.nta.controller;

import java.util.List;

import com.nta.enums.ErrorCode;
import com.nta.exception.AppException;
import com.nta.service.AuthService;
import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.nta.dto.request.CreateNoteRequest;
import com.nta.dto.response.ApiResponse;
import com.nta.dto.response.NoteResponse;
import com.nta.entity.User;
import com.nta.service.NoteService;
import com.nta.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;
    private final UserService userService;
    private final AuthService authService;
    @PostMapping
    public ResponseEntity<ApiResponse<NoteResponse>> createNote(@Valid @RequestBody CreateNoteRequest request) {

        User user = userService.getUserFromContext();
        Long userId = user.getId();
        NoteResponse response = noteService.createNote(userId, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<NoteResponse>builder()
                        .code(1000)
                        .message("Note created successfully")
                        .result(response)
                        .build());
    }

    /**
     * Creates a note with support for file uploads.
     * This endpoint accepts multipart form data with both text fields and files (images, audio, etc.).
     *
     * @param noteTypeId the note type ID
     * @param deckId the deck ID
     * @param fieldValues JSON string containing field values for text fields
     * @param fileFields JSON string containing field names that have files
     * @param files the uploaded files (images, audio, etc.)
     * @return created note response
     */
    @PostMapping("/with-files")
    public ResponseEntity<ApiResponse<NoteResponse>> createNoteWithFiles(
            @RequestParam("noteTypeId") Long noteTypeId,
            @RequestParam("deckId") Long deckId,
            @RequestParam(value = "fieldValues", required = false) String fieldValues,
            @RequestParam(value = "fileFields", required = false) String fileFields,
            @RequestParam(value = "files", required = false) org.springframework.web.multipart.MultipartFile[] files) {

        User user = userService.getUserFromContext();
        Long userId = user.getId();

        NoteResponse response =
                noteService.createNoteWithFiles(userId, noteTypeId, deckId, fieldValues, fileFields, files);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<NoteResponse>builder()
                        .code(1000)
                        .message("Note with files created successfully")
                        .result(response)
                        .build());
    }

    @GetMapping("/deck/{deckId}")
    public ResponseEntity<ApiResponse<List<NoteResponse>>> getNotesByDeck(@PathVariable Long deckId) {

        User user = userService.getUserFromContext();
        Long userId = user.getId();
        List<NoteResponse> notes = noteService.getNotesByDeck(deckId, userId);

        return ResponseEntity.ok(ApiResponse.<List<NoteResponse>>builder()
                .code(1000)
                .message("Notes retrieved successfully")
                .result(notes)
                .build());
    }

    @GetMapping("/deck/{deckId}/paginated")
    public ResponseEntity<ApiResponse<Page<NoteResponse>>> getNotesByDeckPaginated(
            @PathVariable Long deckId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        User user = userService.getUserFromContext();
        Long userId = user.getId();
        Page<NoteResponse> notes = noteService.getNotesByDeckPaginated(deckId, userId, page, size, sortBy, sortDir);

        return ResponseEntity.ok(ApiResponse.<Page<NoteResponse>>builder()
                .code(1000)
                .message("Notes retrieved successfully")
                .result(notes)
                .build());
    }

    @GetMapping("/{noteId}")
    public ResponseEntity<ApiResponse<NoteResponse>> getNoteById(@PathVariable Long noteId) {

        User user = userService.getUserFromContext();
        Long userId = user.getId();
        NoteResponse response = noteService.getNoteById(noteId, userId);

        return ResponseEntity.ok(ApiResponse.<NoteResponse>builder()
                .code(1000)
                .message("Note retrieved successfully")
                .result(response)
                .build());
    }

    @PutMapping("/{noteId}")
    public ResponseEntity<ApiResponse<NoteResponse>> updateNote(
            @PathVariable Long noteId, @Valid @RequestBody CreateNoteRequest request) {

        throw new AppException(ErrorCode.THIS_METHOD_DOES_NOTE_SUPPORT_YET);
//        User user = userService.getUserFromContext();
//        Long userId = user.getId();
//        NoteResponse response = noteService.updateNote(noteId, userId, request);
//
//        return ResponseEntity.ok(ApiResponse.<NoteResponse>builder()
//                .code(1000)
//                .message("Note updated successfully")
//                .result(response)
//                .build());
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<ApiResponse<Void>> deleteNote(@PathVariable Long noteId) {

        Long userId = authService.getUserIdFromSecurityContext();
        noteService.deleteNote(noteId, userId);

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(1000)
                .message("Note deleted successfully")
                .result(null)
                .build());
    }
}
