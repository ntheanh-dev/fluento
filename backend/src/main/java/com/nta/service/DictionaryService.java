package com.nta.service;

import com.nta.dto.response.LookupWordResponse;
import com.nta.service.impl.ElevenLabsTextToSpeechService;
import lombok.extern.slf4j.Slf4j;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutionException;

@Service
@Slf4j
public class DictionaryService {

    private final AIChatService aiChatService;
    private final UserService userService;
    private final TextToSpeechService textToSpeechService;

    public DictionaryService(AIChatService aiChatService, UserService userService, ElevenLabsTextToSpeechService textToSpeechService) {
        this.aiChatService = aiChatService;
        this.userService = userService;
        this.textToSpeechService = textToSpeechService;
    }

    public LookupWordResponse lookupWord(String word) throws ExecutionException, InterruptedException {
        String systemPrompt =
                """
			You are an English-Vietnamese dictionary assistant.
			When given an English word or phrase, return a JSON object with the following structure:
			{
				"id": [null],
				"word": "[the English word/phrase]",
				"audio": "[null]",
				"phonetic": "[IPA phonetic transcription]",
				"meaning": "[Vietnamese translation(s), comma-separated]",
				"pos": "[Part of speech in Vietnamese - English format]",
				"example1": "[First english example sentence]",
				"audioExample1": "[null]",
				"example2": "[Second english example sentence]",
				"audioExample2": "[null]",
			}

			Rules:
			- Always return valid JSON format
			- Use IPA phonetic notation for pronunciation
			- Provide multiple Vietnamese meanings if applicable, separated by commas
			- Include both Vietnamese and English for part of speech (e.g., "Đại từ - Pronoun")
			- Create a simple, clear example sentence
			- Translate the example to Vietnamese
			- For audio URL fields, set them to null (we will fill them later)
			""";

        final String userPrompt =
                String.format(
                        "Look up the English word/phrase: '%s'", word);

        final String apiKey = userService.getApiKeyFromContext();
        final LookupWordResponse response =
                aiChatService.sendMessage(
                        apiKey,
                        systemPrompt,
                        userPrompt,
                        new ParameterizedTypeReference<LookupWordResponse>() {});

        // use ai to generate audio for the word and example

        // Generate audio for the word and examples
        response.setAudio(textToSpeechService.textToBytes(response.getWord()));
		response.setAudioExample1(textToSpeechService.textToBytes(response.getExample1()));
		response.setAudioExample2(textToSpeechService.textToBytes(response.getExample2()));

        return response;
    }



}
