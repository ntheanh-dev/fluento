package com.nta.domain.writing;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import com.nta.common.dto.ApiResponse;
import com.nta.domain.writing.dto.request.GenerateParagraphRequest;
import com.nta.domain.writing.dto.request.SentenceTranslationRequest;
import com.nta.domain.writing.dto.request.TranslationHintsRequest;
import com.nta.domain.writing.dto.response.*;

import lombok.AllArgsConstructor;

@RestController("writingController")
@RequestMapping("/writings")
@AllArgsConstructor
public class Controller {
    final com.nta.domain.writing.Service service;
    final com.nta.domain.auth.Service authService;

    @PostMapping("/generate")
    public ApiResponse<GenerateParagraphResponse> generateParagraph(@RequestBody GenerateParagraphRequest request) {
        // Compose prompt using topic, language, tone, style, paragraphCount, sentenceCount
        // For now, use topic name and paragraphCount as in Service
        return ApiResponse.<GenerateParagraphResponse>builder()
                .result(service.generateParagraph(request))
                .build();
    }

    @PostMapping("/{conversationId}/translation-hints")
    public ApiResponse<HintTranslationResponse> getTranslationHints(
            @RequestBody TranslationHintsRequest request, @PathVariable String conversationId) {
        final HintTranslationResponse response =
                service.generateHints(request.getVietnameseSentence(), request.getLevel());
        return ApiResponse.<HintTranslationResponse>builder().result(response).build();
    }

    @PostMapping("/{conversationId}/translate")
    public ApiResponse<SentenceTranslationResponse> translate(
            @RequestBody SentenceTranslationRequest request, @PathVariable String conversationId) {
        final SentenceTranslationResponse response = service.translateSentence(request, conversationId);
        return ApiResponse.<SentenceTranslationResponse>builder()
                .result(response)
                .build();
    }

    @GetMapping("/{conversationId}")
    public ApiResponse<WritingResponse> getConversation(@PathVariable String conversationId) {
        return ApiResponse.<WritingResponse>builder()
                .result(service.getConversationById(conversationId))
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

        final Page<WritingResponse> writings = service.getAllWritings(page, size, direction, sortBy, keyword, userId);

        return ApiResponse.<Page<WritingResponse>>builder().result(writings).build();
    }
}
