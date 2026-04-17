package com.nta.common.service.ai;

import java.util.function.Consumer;

public interface ChatService {
    <T> ChatResponse<T> sendMessage(String systemMessage, String userMessage, Class<T> responseType);

    default <T> ChatResponse<T> sendMessageStream(
            String systemMessage, String userMessage, Class<T> responseType, Consumer<String> onChunk) {
        return sendMessage(systemMessage, userMessage, responseType);
    }
}
