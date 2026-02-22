package com.nta.common.service.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse<T> {
    T result;
    int promptTokens;
    int completionTokens;
    int totalTokens;
}
