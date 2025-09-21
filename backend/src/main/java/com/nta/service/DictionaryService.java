package com.nta.service;

import java.util.List;
import java.util.Optional;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;

import com.nta.dto.request.DictionaryRequest;
import com.nta.dto.response.DictionaryResponse;
import com.nta.repository.client.DictionaryApiClient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DictionaryService {

    private final AIChatService aiChatService;
    private final DictionaryApiClient dictionaryApiClient;

    public DictionaryResponse lookupWord(DictionaryRequest request) {
        String inputWord = request.getWord().trim();

        // Try to get audio URL first (this will help detect if word exists)
        String audioUrl = getAudioUrl(inputWord);

        // If no audio URL found, the word might be misspelled
        if (audioUrl == null) {
            return handleMisspelledWord(inputWord);
        }

        // Word exists, proceed with normal lookup
        return lookupExistingWord(inputWord, audioUrl);
    }

    private DictionaryResponse lookupExistingWord(String word, String audioUrl) {
        String systemPrompt =
                """
			You are an English-Vietnamese dictionary assistant.
			When given an English word or phrase, return a JSON object with the following structure:
			{
				"id": [unique_id_number],
				"word": "[the English word/phrase]",
				"phonetic": "[IPA phonetic transcription]",
				"meaning": "[Vietnamese translation(s), comma-separated]",
				"pos": "[Part of speech in Vietnamese - English format]",
				"example": "[English example sentence]",
				"translation": "[Vietnamese translation of the example]",
				"audio": "[audio_url_or_null]"
			}

			Rules:
			- Always return valid JSON format
			- Use IPA phonetic notation for pronunciation
			- Provide multiple Vietnamese meanings if applicable, separated by commas
			- Include both Vietnamese and English for part of speech (e.g., "Đại từ - Pronoun")
			- Create a simple, clear example sentence
			- Translate the example to Vietnamese
			- Use the provided audio URL or null if not available
			- Generate a unique ID number
			""";

        String userPrompt = String.format("Look up the English word/phrase: '%s'. Audio URL: %s", word, audioUrl);

        try {
            DictionaryResponse response = aiChatService.sendMessage(
                    "dictionary-lookup",
                    systemPrompt,
                    userPrompt,
                    new ParameterizedTypeReference<DictionaryResponse>() {});

            // Set the audio URL from the external API
            response.setAudio(audioUrl);

            log.info("Successfully looked up word: {} with audio: {}", word, audioUrl);
            return response;

        } catch (Exception e) {
            log.error("Failed to look up word: {}", word, e);
            throw new RuntimeException("Failed to look up word: " + e.getMessage());
        }
    }

    private DictionaryResponse handleMisspelledWord(String misspelledWord) {
        String systemPrompt =
                """
			You are an English-Vietnamese dictionary assistant with spell-checking capabilities.
			When given a misspelled English word, try to find the correct spelling and provide translation.
			Return a JSON object with the following structure:
			{
				"id": [unique_id_number],
				"word": "[the CORRECTED English word/phrase]",
				"phonetic": "[IPA phonetic transcription of the CORRECTED word]",
				"meaning": "[Vietnamese translation(s), comma-separated]",
				"pos": "[Part of speech in Vietnamese - English format]",
				"example": "[English example sentence using the CORRECTED word]",
				"translation": "[Vietnamese translation of the example]",
				"audio": null
			}

			Rules:
			- Always return valid JSON format
			- Try to correct the spelling if possible
			- If you can't find a reasonable correction, use the original word
			- Use IPA phonetic notation for pronunciation
			- Provide Vietnamese meanings
			- Include both Vietnamese and English for part of speech
			- Create a simple, clear example sentence
			- Translate the example to Vietnamese
			- Set audio to null (since we couldn't get audio for misspelled word)
			- Generate a unique ID number
			- If the word seems completely wrong, suggest common alternatives
			""";

        String userPrompt = String.format(
                "The word '%s' might be misspelled. Please correct it and provide translation. If you can't correct it, suggest similar words.",
                misspelledWord);

        try {
            DictionaryResponse response = aiChatService.sendMessage(
                    "dictionary-spellcheck",
                    systemPrompt,
                    userPrompt,
                    new ParameterizedTypeReference<DictionaryResponse>() {});

            // No audio for misspelled/corrected words
            response.setAudio(null);

            log.info("Handled misspelled word: {} -> {}", misspelledWord, response.getWord());
            return response;

        } catch (Exception e) {
            log.error("Failed to handle misspelled word: {}", misspelledWord, e);
            throw new RuntimeException("Failed to handle misspelled word: " + e.getMessage());
        }
    }

    private String getAudioUrl(String word) {
        try {
            List<DictionaryApiClient.DictionaryApiResponse> responses = dictionaryApiClient.getWordDefinition(word);

            if (responses != null && !responses.isEmpty()) {
                DictionaryApiClient.DictionaryApiResponse response = responses.get(0);

                if (response.getPhonetics() != null) {
                    Optional<String> audioUrl = response.getPhonetics().stream()
                            .filter(phonetic -> phonetic.getAudio() != null
                                    && !phonetic.getAudio().isEmpty())
                            .map(DictionaryApiClient.DictionaryApiResponse.Phonetic::getAudio)
                            .findFirst();

                    if (audioUrl.isPresent()) {
                        log.info("Found audio URL for word '{}': {}", word, audioUrl.get());
                        return audioUrl.get();
                    }
                }
            }

            log.warn("No audio URL found for word: {}", word);
            return null;

        } catch (Exception e) {
            log.error("Failed to get audio URL for word: {}", word, e);
            return null;
        }
    }
}
