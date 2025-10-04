package com.nta.controller;

import com.nta.dto.request.DictionaryRequest;
import com.nta.dto.response.ApiResponse;
import com.nta.dto.response.LookupWordResponse;
import com.nta.service.DictionaryService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/dictionary")
@RequiredArgsConstructor
public class DictionaryController {

    private final DictionaryService dictionaryService;

    @PostMapping(value = "/lookup", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<LookupWordResponse>> lookupWord(@Valid @RequestBody DictionaryRequest request) throws ExecutionException, InterruptedException {

        final LookupWordResponse response = dictionaryService.lookupWord(request.getWord());

        return ResponseEntity.ok(ApiResponse.<LookupWordResponse>builder()
                .code(1000)
                .message("Word looked up successfully")
                .result(response)
                .build());
    }
}
