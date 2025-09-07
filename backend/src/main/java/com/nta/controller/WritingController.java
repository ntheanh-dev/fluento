package com.nta.controller;

import com.nta.dto.request.GenerateParagraphRequest;
import com.nta.dto.request.SentenceTranslationRequest;
import com.nta.dto.response.*;
import com.nta.service.AuthService;
import com.nta.service.WritingService;

import lombok.AllArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/writings")
@AllArgsConstructor
public class WritingController {
    final WritingService writingService;
    final AuthService authService;
    @PostMapping("/generate")
    public ApiResponse<GenerateParagraphResponse> generateParagraph(@RequestBody GenerateParagraphRequest request) {
        // Compose prompt using topic, language, tone, style, paragraphCount, sentenceCount
        // For now, use topic name and paragraphCount as in WritingService
        return ApiResponse.<GenerateParagraphResponse>builder()
                .result(writingService.generateParagraph(request))
                .build();
    }

    @PostMapping("/{conversationId}/translation-hints")
    public ApiResponse<HintTranslationResponse> getTranslationHints(
            @RequestBody String vietnameseSentence, @PathVariable String conversationId) {
        final HintTranslationResponse response = writingService.generateHints(conversationId, vietnameseSentence);
        return ApiResponse.<HintTranslationResponse>builder().result(response).build();
    }

    @PostMapping("/{conversationId}/translate")
    public ApiResponse<SentenceTranslationResponse> translate(
            @RequestBody SentenceTranslationRequest request, @PathVariable String conversationId) {
        final SentenceTranslationResponse response = writingService.translateSentence(request, conversationId);
        return ApiResponse.<SentenceTranslationResponse>builder()
                .result(response)
                .build();
    }

    @GetMapping("/{conversationId}")
    public ApiResponse<WritingResponse> getConversation(@PathVariable String conversationId) {
        return ApiResponse.<WritingResponse>builder()
                .result(writingService.getConversationById(conversationId))
                .build();
    }

    @GetMapping
    public ApiResponse<Page<WritingResponse>> getAllWritings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "") String keyword) {

        // Get user ID from JWT token
        final Long userId = authService.getUserIdFromSecurityContext();

        final Page<WritingResponse> writings = writingService.getAllWritings(page, size, direction, sortBy, keyword, userId);

        return ApiResponse.<Page<WritingResponse>>builder().result(writings).build();
    }
}
