package com.nta.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.nta.dto.response.ApiResponse;
import com.nta.dto.response.NoteTypeResponse;
import com.nta.service.NoteTypeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/note-types")
@RequiredArgsConstructor
public class NoteTypeController {

    private final NoteTypeService noteTypeService;


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

}
