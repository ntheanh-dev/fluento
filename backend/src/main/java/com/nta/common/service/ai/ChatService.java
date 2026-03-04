package com.nta.common.service.ai;

public interface ChatService {
    <T> ChatResponse<T> sendMessage(String systemMessage, String userMessage, Class<T> responseType);

    void streamMessage(String systemMessage, String userMessage, java.util.function.Consumer<String> onChunk);
}
