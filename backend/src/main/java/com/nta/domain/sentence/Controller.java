package com.nta.domain.sentence;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nta.common.dto.ApiResponse;
import com.nta.domain.sentence.dto.request.SentenceCreationRequest;

import lombok.RequiredArgsConstructor;

@RestController("sentenceController")
@RequestMapping("/sentences")
@RequiredArgsConstructor
public class Controller {
    private final Service service;

    @PostMapping
    public ApiResponse<?> add(@RequestBody SentenceCreationRequest sentenceCreationRequest) {
        service.addSentence(sentenceCreationRequest);
        return ApiResponse.builder().build();
    }
}
