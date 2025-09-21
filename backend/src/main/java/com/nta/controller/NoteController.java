package com.nta.controller;

import java.util.List;

import jakarta.validation.Valid;

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

        User user = userService.getUserFromContext();
        Long userId = user.getId();
        NoteResponse response = noteService.updateNote(noteId, userId, request);

        return ResponseEntity.ok(ApiResponse.<NoteResponse>builder()
                .code(1000)
                .message("Note updated successfully")
                .result(response)
                .build());
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<ApiResponse<Void>> deleteNote(@PathVariable Long noteId) {

        User user = userService.getUserFromContext();
        Long userId = user.getId();
        noteService.deleteNote(noteId, userId);

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(1000)
                .message("Note deleted successfully")
                .result(null)
                .build());
    }
}
