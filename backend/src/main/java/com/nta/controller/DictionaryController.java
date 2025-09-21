package com.nta.controller;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nta.dto.request.DictionaryRequest;
import com.nta.dto.response.ApiResponse;
import com.nta.dto.response.DictionaryResponse;
import com.nta.service.DictionaryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/dictionary")
@RequiredArgsConstructor
public class DictionaryController {

    private final DictionaryService dictionaryService;

    @PostMapping("/lookup")
    public ResponseEntity<ApiResponse<DictionaryResponse>> lookupWord(@Valid @RequestBody DictionaryRequest request) {

        DictionaryResponse response = dictionaryService.lookupWord(request);

        return ResponseEntity.ok(ApiResponse.<DictionaryResponse>builder()
                .code(1000)
                .message("Word looked up successfully")
                .result(response)
                .build());
    }
}
