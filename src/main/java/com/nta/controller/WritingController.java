package com.nta.controller;

import com.nta.dto.request.GenerateParagraphRequest;
import com.nta.dto.request.SentenceTranslationRequest;
import com.nta.dto.response.ApiResponse;
import com.nta.dto.response.GenerateParagraphResponse;
import com.nta.dto.response.HintTranslationResponse;
import com.nta.dto.response.SentenceTranslationResponse;
import com.nta.service.WritingService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/writings")
@AllArgsConstructor
public class WritingController {
    final WritingService writingService;

    @PostMapping("/generate")
    public ApiResponse<GenerateParagraphResponse> generateParagraph(@RequestBody GenerateParagraphRequest request) {
        // Compose prompt using topic, language, tone, style, paragraphCount, sentenceCount
        // For now, use topic name and paragraphCount as in WritingService
        return ApiResponse.<GenerateParagraphResponse>builder().result(writingService.generateParagraph(request)).build();
    }

    @PostMapping("/{conversationId}/translation-hints")
    public ApiResponse<HintTranslationResponse> getTranslationHints(@RequestBody String vietnameseSentence, @PathVariable String conversationId) {
        final HintTranslationResponse response = writingService.generateHints(conversationId, vietnameseSentence);
        return ApiResponse.<HintTranslationResponse>builder().result(response).build();
    }

    @PostMapping("/{conversationId}/translate")
    public ApiResponse<SentenceTranslationResponse> translate(@RequestBody SentenceTranslationRequest request, @PathVariable String conversationId) {
        final SentenceTranslationResponse response = writingService.translateSentence(request, conversationId);
        return ApiResponse.<SentenceTranslationResponse>builder().result(response).build();
    }
}
