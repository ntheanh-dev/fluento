package com.nta.domain.sentence;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nta.common.dto.ApiResponse;
import com.nta.domain.sentence.dto.request.SentenceCreationRequest;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController("sentenceController")
@RequestMapping("/sentences")
@Tag(name = "Sentence", description = "Sentence management APIs")
@RequiredArgsConstructor
public class Controller {
    private final Service service;

    @PostMapping
    public ApiResponse<?> add(@RequestBody SentenceCreationRequest sentenceCreationRequest) {
        log.debug("Adding sentence for conversation: {}", sentenceCreationRequest.getConversationId());
        service.addSentence(sentenceCreationRequest);
        return ApiResponse.builder().build();
    }
}
