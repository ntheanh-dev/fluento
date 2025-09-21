package com.nta.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.nta.dto.request.CreateNoteTypeRequest;
import com.nta.dto.response.ApiResponse;
import com.nta.dto.response.NoteTypeResponse;
import com.nta.service.NoteTypeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/note-types")
@RequiredArgsConstructor
public class NoteTypeController {

    private final NoteTypeService noteTypeService;

    @PostMapping
    public ResponseEntity<ApiResponse<NoteTypeResponse>> createNoteType(
            @Valid @RequestBody CreateNoteTypeRequest request) {

        NoteTypeResponse response = noteTypeService.createNoteType(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<NoteTypeResponse>builder()
                        .code(1000)
                        .message("Note type created successfully")
                        .result(response)
                        .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NoteTypeResponse>>> getAllNoteTypes() {
        List<NoteTypeResponse> noteTypes = noteTypeService.getAllNoteTypes();

        return ResponseEntity.ok(ApiResponse.<List<NoteTypeResponse>>builder()
                .code(1000)
                .message("Note types retrieved successfully")
                .result(noteTypes)
                .build());
    }

    @GetMapping("/{noteTypeId}")
    public ResponseEntity<ApiResponse<NoteTypeResponse>> getNoteTypeById(@PathVariable Long noteTypeId) {
        NoteTypeResponse response = noteTypeService.getNoteTypeById(noteTypeId);

        return ResponseEntity.ok(ApiResponse.<NoteTypeResponse>builder()
                .code(1000)
                .message("Note type retrieved successfully")
                .result(response)
                .build());
    }

    @PutMapping("/{noteTypeId}")
    public ResponseEntity<ApiResponse<NoteTypeResponse>> updateNoteType(
            @PathVariable Long noteTypeId, @Valid @RequestBody CreateNoteTypeRequest request) {

        NoteTypeResponse response = noteTypeService.updateNoteType(noteTypeId, request);

        return ResponseEntity.ok(ApiResponse.<NoteTypeResponse>builder()
                .code(1000)
                .message("Note type updated successfully")
                .result(response)
                .build());
    }

    @DeleteMapping("/{noteTypeId}")
    public ResponseEntity<ApiResponse<Void>> deleteNoteType(@PathVariable Long noteTypeId) {
        noteTypeService.deleteNoteType(noteTypeId);

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(1000)
                .message("Note type deleted successfully")
                .result(null)
                .build());
    }
}
