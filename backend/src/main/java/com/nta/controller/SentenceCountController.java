package com.nta.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nta.dto.response.ApiResponse;
import com.nta.entity.SentenceCount;
import com.nta.service.SentenceCountsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sentenceCounts")
public class SentenceCountController {
    private final SentenceCountsService sentenceCountsService;

    @GetMapping("")
    ApiResponse<List<SentenceCount>> findAll() {
        return ApiResponse.<List<SentenceCount>>builder()
                .result(sentenceCountsService.findAll())
                .build();
    }
}
