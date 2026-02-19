package com.nta.domain.writing;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

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
import org.springframework.data.domain.Sort;

import com.nta.common.enums.Level;
import com.nta.common.enums.SentenceCount;
import com.nta.common.enums.Tone;
import com.nta.common.enums.Topic;
import com.nta.domain.ai.ChatService;
import com.nta.domain.user.User;
import com.nta.domain.writing.dto.request.GenerateParagraphRequest;
import com.nta.domain.writing.dto.request.SentenceTranslationRequest;
import com.nta.domain.writing.dto.response.GenerateParagraphResponse;
import com.nta.domain.writing.dto.response.HintTranslationResponse;
import com.nta.domain.writing.dto.response.SentenceTranslationResponse;
import com.nta.domain.writing.dto.response.WritingResponse;

@ExtendWith(MockitoExtension.class)
@DisplayName("Writing Service Tests")
class ServiceTest {

    @Mock
    private ChatService chatService;

    @Mock
    private com.nta.domain.user.Service userService;

    @Mock
    private Repository repository;

    @Mock
    private Mapper mapper;

    @InjectMocks
    private Service writingService;

    private User testUser;
    private GenerateParagraphRequest generateParagraphRequest;
    private Writing testWriting;
    private WritingResponse writingResponse;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = new User();
        testUser.setId(1L);

        // Setup GenerateParagraphRequest
        generateParagraphRequest = new GenerateParagraphRequest();
        generateParagraphRequest.setTopic("Technology");
        generateParagraphRequest.setLanguage("English");
        generateParagraphRequest.setLevel("B1");
        generateParagraphRequest.setSentenceCount(5);
        generateParagraphRequest.setTone("Formal");

        // Setup test Writing entity
        testWriting = Writing.builder()
                .id(1L)
                .conversationId("test-conversation-id")
                .type(WritingType.AI_GENERATED)
                .topic(Topic.TECHNOLOGY)
                .level(Level.B1)
                .tone(Tone.FORMAL)
                .sentenceCount(SentenceCount.FIVE)
                .user(testUser)
                .vietnameseParagraph("This is sentence one. This is sentence two. This is sentence three.")
                .createdAt(LocalDateTime.now())
                .build();

        // Setup WritingResponse
        writingResponse = WritingResponse.builder()
                .id(1L)
                .conversationId("test-conversation-id")
                .topic(Topic.TECHNOLOGY)
                .level(Level.B1)
                .tone(Tone.FORMAL)
                .sentenceCount(SentenceCount.FIVE)
                .vietNamesesentences(
                        Arrays.asList("This is sentence one", "This is sentence two", "This is sentence three"))
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should generate paragraph with AI successfully")
    void testGenerateParagraph_WithAI_Success() {
        // Given
        String apiKey = "test-api-key";
        String generatedParagraph = "This is sentence one. This is sentence two. This is sentence three.";
        when(userService.getApiKeyFromContext()).thenReturn(apiKey);
        when(chatService.sendMessage(anyString(), anyString(), anyString(), eq(String.class)))
                .thenReturn(generatedParagraph);
        when(userService.getUserFromContext()).thenReturn(testUser);
        when(repository.save(any(Writing.class))).thenReturn(testWriting);

        // When
        GenerateParagraphResponse response = writingService.generateParagraph(generateParagraphRequest);

        // Then
        assertNotNull(response);
        assertNotNull(response.getConversationId());
        assertNotNull(response.getParagraphs());
        assertTrue(response.getParagraphs().size() > 0);
        verify(userService, times(1)).getApiKeyFromContext();
        verify(userService, times(1)).getUserFromContext();
        verify(chatService, times(1)).sendMessage(anyString(), anyString(), anyString(), eq(String.class));
        verify(repository, times(1)).save(any(Writing.class));
    }

    @Test
    @DisplayName("Should generate paragraph with custom text successfully")
    void testGenerateParagraph_WithCustomText_Success() {
        // Given
        generateParagraphRequest.setCustomText("Custom paragraph text here.");
        when(userService.getUserFromContext()).thenReturn(testUser);
        when(repository.save(any(Writing.class))).thenReturn(testWriting);

        // When
        GenerateParagraphResponse response = writingService.generateParagraph(generateParagraphRequest);

        // Then
        assertNotNull(response);
        assertNotNull(response.getConversationId());
        assertNotNull(response.getParagraphs());
        verify(userService, never()).getApiKeyFromContext();
        verify(chatService, never()).sendMessage(anyString(), anyString(), anyString(), eq(String.class));
        verify(userService, times(1)).getUserFromContext();
        verify(repository, times(1)).save(any(Writing.class));
    }

    @Test
    @DisplayName("Should generate hints successfully")
    void testGenerateHints_Success() {
        // Given
        String vietnameseSentence = "Xin chào";
        String level = "A2";
        String apiKey = "test-api-key";
        HintTranslationResponse expectedResponse = new HintTranslationResponse();
        HintTranslationResponse.VocabularyHint vocabHint = new HintTranslationResponse.VocabularyHint();
        vocabHint.setVietnamese("Xin chào");
        vocabHint.setEnglish(Arrays.asList("Hello", "Hi"));
        expectedResponse.setVocabularyHints(Arrays.asList(vocabHint));

        when(userService.getApiKeyFromContext()).thenReturn(apiKey);
        when(chatService.sendMessage(anyString(), anyString(), anyString(), eq(HintTranslationResponse.class)))
                .thenReturn(expectedResponse);

        // When
        HintTranslationResponse response = writingService.generateHints(vietnameseSentence, level);

        // Then
        assertNotNull(response);
        assertNotNull(response.getVocabularyHints());
        verify(userService, times(1)).getApiKeyFromContext();
        verify(chatService, times(1))
                .sendMessage(anyString(), anyString(), anyString(), eq(HintTranslationResponse.class));
    }

    @Test
    @DisplayName("Should translate sentence successfully")
    void testTranslateSentence_Success() {
        // Given
        SentenceTranslationRequest request = new SentenceTranslationRequest("Xin chào", "Hello");
        String conversationId = "test-conversation-id";
        String apiKey = "test-api-key";
        SentenceTranslationResponse expectedResponse = new SentenceTranslationResponse();
        expectedResponse.setOriginalVietnamese("Xin chào");
        expectedResponse.setLearnerEnglish("Hello");
        expectedResponse.setImprovedTranslation("Hello");
        expectedResponse.setScore(9);

        when(userService.getApiKeyFromContext()).thenReturn(apiKey);
        when(chatService.sendMessage(anyString(), anyString(), anyString(), eq(SentenceTranslationResponse.class)))
                .thenReturn(expectedResponse);

        // When
        SentenceTranslationResponse response = writingService.translateSentence(request, conversationId);

        // Then
        assertNotNull(response);
        assertEquals("Xin chào", response.getOriginalVietnamese());
        assertEquals("Hello", response.getLearnerEnglish());
        assertEquals(9, response.getScore());
        verify(userService, times(1)).getApiKeyFromContext();
        verify(chatService, times(1))
                .sendMessage(anyString(), anyString(), anyString(), eq(SentenceTranslationResponse.class));
    }

    @Test
    @DisplayName("Should get conversation by ID successfully")
    void testGetConversationById_Success() {
        // Given
        String conversationId = "test-conversation-id";
        when(repository.findByConversationIdWithSentences(conversationId)).thenReturn(Optional.of(testWriting));
        when(mapper.toWritingResponse(any(Writing.class))).thenReturn(writingResponse);

        // When
        WritingResponse response = writingService.getConversationById(conversationId);

        // Then
        assertNotNull(response);
        assertEquals(conversationId, response.getConversationId());
        assertNotNull(response.getVietNamesesentences());
        verify(repository, times(1)).findByConversationIdWithSentences(conversationId);
        verify(mapper, times(1)).toWritingResponse(any(Writing.class));
    }

    @Test
    @DisplayName("Should get conversation by ID return null when not found")
    void testGetConversationById_NotFound() {
        // Given
        String conversationId = "non-existent-id";
        when(repository.findByConversationIdWithSentences(conversationId)).thenReturn(Optional.empty());
        when(mapper.toWritingResponse(null)).thenReturn(null);

        // When
        WritingResponse response = writingService.getConversationById(conversationId);

        // Then
        assertNull(response);
        verify(repository, times(1)).findByConversationIdWithSentences(conversationId);
        verify(mapper, times(1)).toWritingResponse(null);
    }

    @Test
    @DisplayName("Should get all writings with pagination successfully")
    void testGetAllWritings_WithPagination_Success() {
        // Given
        int page = 0;
        int size = 10;
        String direction = "asc";
        String sortBy = "id";
        String keyword = "";
        Long userId = 1L;

        Page<Writing> writingsPage = new PageImpl<>(Arrays.asList(testWriting), PageRequest.of(page, size), 1);
        when(repository.findByUserId(
                        userId, PageRequest.of(page, size, Sort.by(sortBy).ascending())))
                .thenReturn(writingsPage);
        when(mapper.toWritingResponse(any(Writing.class))).thenReturn(writingResponse);

        // When
        Page<WritingResponse> response = writingService.getAllWritings(page, size, direction, sortBy, keyword, userId);

        // Then
        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        assertEquals(1, response.getContent().size());
        verify(repository, times(1)).findByUserId(eq(userId), any());
    }

    @Test
    @DisplayName("Should get all writings with keyword search successfully")
    void testGetAllWritings_WithKeyword_Success() {
        // Given
        int page = 0;
        int size = 10;
        String direction = "desc";
        String sortBy = "createdAt";
        String keyword = "technology";
        Long userId = 1L;

        Page<Writing> writingsPage = new PageImpl<>(Arrays.asList(testWriting), PageRequest.of(page, size), 1);
        when(repository.searchByTopicNameAndUserId(
                        keyword,
                        userId,
                        PageRequest.of(page, size, Sort.by(sortBy).descending())))
                .thenReturn(writingsPage);
        when(mapper.toWritingResponse(any(Writing.class))).thenReturn(writingResponse);

        // When
        Page<WritingResponse> response = writingService.getAllWritings(page, size, direction, sortBy, keyword, userId);

        // Then
        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        verify(repository, times(1)).searchByTopicNameAndUserId(eq(keyword), eq(userId), any());
        verify(repository, never()).findByUserId(anyLong(), any());
    }

    @Test
    @DisplayName("Should handle null sentence count in generate paragraph")
    void testGenerateParagraph_WithNullSentenceCount() {
        // Given
        generateParagraphRequest.setSentenceCount(null);
        String apiKey = "test-api-key";
        String generatedParagraph = "This is a test paragraph.";
        when(userService.getApiKeyFromContext()).thenReturn(apiKey);
        when(chatService.sendMessage(anyString(), anyString(), anyString(), eq(String.class)))
                .thenReturn(generatedParagraph);
        when(userService.getUserFromContext()).thenReturn(testUser);
        when(repository.save(any(Writing.class))).thenReturn(testWriting);

        // When
        GenerateParagraphResponse response = writingService.generateParagraph(generateParagraphRequest);

        // Then
        assertNotNull(response);
        verify(repository, times(1)).save(any(Writing.class));
    }
}
