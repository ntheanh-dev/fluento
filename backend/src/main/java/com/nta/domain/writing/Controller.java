package com.nta.domain.writing;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import com.nta.common.dto.ApiResponse;
import com.nta.domain.writing.dto.request.GenerateParagraphRequest;
import com.nta.domain.writing.dto.request.SentenceTranslationRequest;
import com.nta.domain.writing.dto.request.TranslationHintsRequest;
import com.nta.domain.writing.dto.response.*;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController("writingController")
@RequestMapping("/writings")
@Tag(name = "Writing", description = "Writing and translation management APIs")
@AllArgsConstructor
public class Controller {
    final com.nta.domain.writing.Service service;
    final com.nta.domain.auth.Service authService;

    @PostMapping("/generate")
    public ApiResponse<GenerateParagraphResponse> generateParagraph(@RequestBody GenerateParagraphRequest request) {
        log.debug("Generating paragraph - topic: {}, level: {}", request.getTopic(), request.getLevel());
        return ApiResponse.<GenerateParagraphResponse>builder()
                .result(service.generateParagraph(request))
                .build();
    }

    @PostMapping("/{conversationId}/translation-hints")
    public ApiResponse<HintTranslationResponse> getTranslationHints(
            @RequestBody TranslationHintsRequest request, @PathVariable String conversationId) {
        log.debug("Translation hints requested for conversation: {}", conversationId);
        final HintTranslationResponse response =
                service.generateHints(request.getVietnameseSentence(), request.getLevel());
        return ApiResponse.<HintTranslationResponse>builder().result(response).build();
    }

    @PostMapping("/{conversationId}/translate")
    public ApiResponse<SentenceTranslationResponse> translate(
            @RequestBody SentenceTranslationRequest request, @PathVariable String conversationId) {
        log.debug("Translation requested for conversation: {}", conversationId);
        final SentenceTranslationResponse response = service.translateSentence(request, conversationId);
        return ApiResponse.<SentenceTranslationResponse>builder()
                .result(response)
                .build();
    }

    @GetMapping("/{conversationId}")
    public ApiResponse<WritingResponse> getConversation(@PathVariable String conversationId) {
        log.debug("Fetching conversation: {}", conversationId);
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
        log.debug("Listing writings for user: {}, page: {}, size: {}", userId, page, size);

        final Page<WritingResponse> writings = service.getAllWritings(page, size, direction, sortBy, keyword, userId);

        return ApiResponse.<Page<WritingResponse>>builder().result(writings).build();
    }
}
