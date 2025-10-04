package com.nta.service.ai.impl;


import com.nta.enums.ErrorCode;
import com.nta.exception.AppException;
import com.nta.service.ai.TextToSpeechService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.audio.tts.TextToSpeechPrompt;
import org.springframework.ai.elevenlabs.ElevenLabsTextToSpeechModel;
import org.springframework.ai.elevenlabs.ElevenLabsTextToSpeechOptions;
import org.springframework.ai.elevenlabs.api.ElevenLabsApi;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;

@Service
@Slf4j
public class ElevenLabsTextToSpeechService implements TextToSpeechService {

    private final ElevenLabsTextToSpeechModel textToSpeechModel;

    public ElevenLabsTextToSpeechService(ElevenLabsTextToSpeechModel textToSpeechModel) {
        this.textToSpeechModel = textToSpeechModel;
    }

    @Override
    public byte[] textToBytes(final String text) {
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

    @Override
    public File textToFile(String text) {
        final byte[] audioBytes = this.textToBytes(text);
        try {
            File tempFile = File.createTempFile("tts_output_", ".mp3");
            java.nio.file.Files.write(tempFile.toPath(), audioBytes);
            return tempFile;
        } catch (IOException e) {
            log.error("Error writing audio bytes to file", e);
            throw new AppException(ErrorCode.FILE_WRITE_ERROR);
        }
    }
}

