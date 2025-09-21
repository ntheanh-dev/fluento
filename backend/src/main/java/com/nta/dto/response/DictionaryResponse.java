package com.nta.dto.response;

import lombok.Data;

@Data
public class DictionaryResponse {
    private Long id;
    private String word;
    private String phonetic;
    private String meaning;
    private String pos; // Part of Speech
    private String example;
    private String translation;
    private String audio;
}
