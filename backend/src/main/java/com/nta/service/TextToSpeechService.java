package com.nta.service;


import com.nta.enums.ErrorCode;
import com.nta.exception.AppException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.audio.tts.TextToSpeechPrompt;
import org.springframework.ai.elevenlabs.ElevenLabsTextToSpeechModel;
import org.springframework.ai.elevenlabs.ElevenLabsTextToSpeechOptions;
import org.springframework.ai.elevenlabs.api.ElevenLabsApi;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@Slf4j
public class TextToSpeechService {

    private final ElevenLabsTextToSpeechModel textToSpeechModel;

    public TextToSpeechService(ElevenLabsTextToSpeechModel textToSpeechModel) {
        this.textToSpeechModel = textToSpeechModel;
    }

    public byte[] textToBytes(final String text) throws IOException {
        var voiceSettings = new ElevenLabsApi.SpeechRequest.VoiceSettings(
                0.75,
                0.75,
                0.0,
                true,
                1.0
        );

        final var textToSpeechOptions = ElevenLabsTextToSpeechOptions.builder()
                .model("eleven_multilingual_v2")
                .voiceSettings(voiceSettings)
                .outputFormat(ElevenLabsApi.OutputFormat.MP3_44100_128.getValue())
                .build();

        final var prompt = new TextToSpeechPrompt(text, textToSpeechOptions);
        try {
            return textToSpeechModel.call(prompt).getResult().getOutput();
        } catch (Exception e) {
            log.error("Error during text-to-speech synthesis", e);
            throw new AppException(ErrorCode.TEXT_TO_SPEECH_ERROR);
        }
    }
}

