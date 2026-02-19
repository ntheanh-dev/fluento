package com.nta.domain.writing;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import com.nta.common.dto.ApiResponse;
import com.nta.domain.writing.dto.request.GenerateParagraphRequest;
import com.nta.domain.writing.dto.request.SentenceTranslationRequest;
import com.nta.domain.writing.dto.request.TranslationHintsRequest;
import com.nta.domain.writing.dto.response.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Writing Controller Tests")
class ControllerTest {

    @Mock
    private com.nta.domain.writing.Service writingService;

    @Mock
    private com.nta.domain.auth.Service authService;

    @InjectMocks
    private Controller controller;

    private GenerateParagraphRequest generateParagraphRequest;
    private GenerateParagraphResponse generateParagraphResponse;
    private TranslationHintsRequest translationHintsRequest;
    private HintTranslationResponse hintTranslationResponse;
    private SentenceTranslationRequest sentenceTranslationRequest;
    private SentenceTranslationResponse sentenceTranslationResponse;
    private WritingResponse writingResponse;
    private Page<WritingResponse> writingsPage;

    @BeforeEach
    void setUp() {
        // Setup GenerateParagraphRequest
        generateParagraphRequest = new GenerateParagraphRequest();
        generateParagraphRequest.setTopic("Technology");
        generateParagraphRequest.setLanguage("English");
        generateParagraphRequest.setLevel("B1");
        generateParagraphRequest.setSentenceCount(5);
        generateParagraphRequest.setTone("Formal");

        // Setup GenerateParagraphResponse
        generateParagraphResponse = GenerateParagraphResponse.builder()
                .conversationId("test-conversation-id")
                .paragraphs(Arrays.asList("Sentence 1.", "Sentence 2.", "Sentence 3."))
                .build();

        // Setup TranslationHintsRequest
        translationHintsRequest = new TranslationHintsRequest();
        translationHintsRequest.setVietnameseSentence("Xin chào");
        translationHintsRequest.setLevel("A2");

        // Setup HintTranslationResponse
        hintTranslationResponse = new HintTranslationResponse();
        HintTranslationResponse.VocabularyHint vocabHint = new HintTranslationResponse.VocabularyHint();
        vocabHint.setVietnamese("Xin chào");
        vocabHint.setEnglish(Arrays.asList("Hello", "Hi"));
        hintTranslationResponse.setVocabularyHints(Arrays.asList(vocabHint));

        // Setup SentenceTranslationRequest
        sentenceTranslationRequest = new SentenceTranslationRequest("Xin chào", "Hello");

        // Setup SentenceTranslationResponse
        sentenceTranslationResponse = new SentenceTranslationResponse();
        sentenceTranslationResponse.setOriginalVietnamese("Xin chào");
        sentenceTranslationResponse.setLearnerEnglish("Hello");
        sentenceTranslationResponse.setImprovedTranslation("Hello");
        sentenceTranslationResponse.setScore(9);

        // Setup WritingResponse
        writingResponse = WritingResponse.builder()
                .id(1L)
                .conversationId("test-conversation-id")
                .vietNamesesentences(Arrays.asList("Sentence 1", "Sentence 2"))
                .build();

        // Setup Page
        writingsPage = new PageImpl<>(Arrays.asList(writingResponse), PageRequest.of(0, 10), 1);
    }

    @Test
    @DisplayName("Should generate paragraph successfully")
    void testGenerateParagraph_Success() {
        // Given
        when(writingService.generateParagraph(any(GenerateParagraphRequest.class)))
                .thenReturn(generateParagraphResponse);

        // When
        ApiResponse<GenerateParagraphResponse> response = controller.generateParagraph(generateParagraphRequest);

        // Then
        assertNotNull(response);
        assertNotNull(response.getResult());
        assertEquals("test-conversation-id", response.getResult().getConversationId());
        assertEquals(3, response.getResult().getParagraphs().size());
        verify(writingService, times(1)).generateParagraph(any(GenerateParagraphRequest.class));
    }

    @Test
    @DisplayName("Should get translation hints successfully")
    void testGetTranslationHints_Success() {
        // Given
        String conversationId = "test-conversation-id";
        when(writingService.generateHints(anyString(), anyString())).thenReturn(hintTranslationResponse);

        // When
        ApiResponse<HintTranslationResponse> response =
                controller.getTranslationHints(translationHintsRequest, conversationId);

        // Then
        assertNotNull(response);
        assertNotNull(response.getResult());
        assertNotNull(response.getResult().getVocabularyHints());
        assertEquals(1, response.getResult().getVocabularyHints().size());
        verify(writingService, times(1)).generateHints(anyString(), anyString());
    }

    @Test
    @DisplayName("Should translate sentence successfully")
    void testTranslate_Success() {
        // Given
        String conversationId = "test-conversation-id";
        when(writingService.translateSentence(any(SentenceTranslationRequest.class), anyString()))
                .thenReturn(sentenceTranslationResponse);

        // When
        ApiResponse<SentenceTranslationResponse> response =
                controller.translate(sentenceTranslationRequest, conversationId);

        // Then
        assertNotNull(response);
        assertNotNull(response.getResult());
        assertEquals("Xin chào", response.getResult().getOriginalVietnamese());
        assertEquals("Hello", response.getResult().getLearnerEnglish());
        assertEquals(9, response.getResult().getScore());
        verify(writingService, times(1)).translateSentence(any(SentenceTranslationRequest.class), anyString());
    }

    @Test
    @DisplayName("Should get conversation by ID successfully")
    void testGetConversation_Success() {
        // Given
        String conversationId = "test-conversation-id";
        when(writingService.getConversationById(anyString())).thenReturn(writingResponse);

        // When
        ApiResponse<WritingResponse> response = controller.getConversation(conversationId);

        // Then
        assertNotNull(response);
        assertNotNull(response.getResult());
        assertEquals(conversationId, response.getResult().getConversationId());
        assertEquals(1L, response.getResult().getId());
        verify(writingService, times(1)).getConversationById(anyString());
    }

    @Test
    @DisplayName("Should get all writings with default pagination")
    void testGetAllWritings_WithDefaultPagination() {
        // Given
        Long userId = 1L;
        when(authService.getUserIdFromSecurityContext()).thenReturn(userId);
        when(writingService.getAllWritings(anyInt(), anyInt(), anyString(), anyString(), anyString(), anyLong()))
                .thenReturn(writingsPage);

        // When
        ApiResponse<Page<WritingResponse>> response = controller.getAllWritings(0, 10, "asc", "id", "");

        // Then
        assertNotNull(response);
        assertNotNull(response.getResult());
        assertEquals(1, response.getResult().getTotalElements());
        assertEquals(1, response.getResult().getContent().size());
        verify(authService, times(1)).getUserIdFromSecurityContext();
        verify(writingService, times(1)).getAllWritings(eq(0), eq(10), eq("asc"), eq("id"), eq(""), eq(userId));
    }

    @Test
    @DisplayName("Should get all writings with custom pagination and keyword")
    void testGetAllWritings_WithCustomPaginationAndKeyword() {
        // Given
        Long userId = 1L;
        String keyword = "technology";
        when(authService.getUserIdFromSecurityContext()).thenReturn(userId);
        when(writingService.getAllWritings(anyInt(), anyInt(), anyString(), anyString(), anyString(), anyLong()))
                .thenReturn(writingsPage);

        // When
        ApiResponse<Page<WritingResponse>> response = controller.getAllWritings(1, 20, "desc", "createdAt", keyword);

        // Then
        assertNotNull(response);
        assertNotNull(response.getResult());
        verify(authService, times(1)).getUserIdFromSecurityContext();
        verify(writingService, times(1))
                .getAllWritings(eq(1), eq(20), eq("desc"), eq("createdAt"), eq(keyword), eq(userId));
    }
}
