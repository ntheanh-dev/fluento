package com.nta.configuration;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class AiModelProperties {

    @Value("${spring.ai.openai.chat.base-url}")
    private String baseUrl;

    @Value("${spring.ai.openai.chat.completions-path}")
    private String completionsPath;

    @Value("${spring.ai.openai.chat.options.model}")
    private String model;
}


