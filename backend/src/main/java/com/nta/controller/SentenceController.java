package com.nta.controller;

import com.nta.dto.request.SentenceCreationRequest;
import com.nta.dto.response.ApiResponse;
import com.nta.service.SentenceService;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/sentences")
@RequiredArgsConstructor
public class SentenceController {
    private final SentenceService sentenceService;

    @PostMapping
    public ApiResponse<?> add(@RequestBody SentenceCreationRequest sentenceCreationRequest) {
        sentenceService.addSentence(sentenceCreationRequest);
        return ApiResponse.builder().build();
    }
}
