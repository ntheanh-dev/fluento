package com.nta.dto.response;

import lombok.Data;

@Data
public class LookupWordResponse {
    private String word;
    private byte[] audio;
    private String phonetic;
    private String meaning;
    private String pos;
    private String example1;
    private byte[] audioExample1;
    private String example2;
    private byte[] audioExample2;
}
