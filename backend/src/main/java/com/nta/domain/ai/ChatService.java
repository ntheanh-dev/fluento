package com.nta.domain.ai;

import org.springframework.core.ParameterizedTypeReference;

public interface ChatService {
    <T> T sendMessage(String apiKey, String systemMessage, String userMessage, Class<T> responseType);

    <T> T sendMessage(
            String apiKey, String systemMessage, String userMessage, ParameterizedTypeReference<T> responseType);
}
