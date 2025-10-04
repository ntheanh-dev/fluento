package com.nta.service;

import java.io.File;

public interface TextToSpeechService {
    byte[] textToBytes(final String text);
    File textToFile(final String text);
}
