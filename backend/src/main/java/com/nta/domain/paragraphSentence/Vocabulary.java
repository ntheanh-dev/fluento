package com.nta.domain.paragraphSentence;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vocabulary {
    @JsonProperty("text")
    @JsonAlias({"english", "chinese", "korean"})
    private String text;

    private String partsOfSpeech;

    @JsonProperty("pronunciation")
    @JsonAlias({"ipaPronunciation", "ipa", "pinyin", "romanization"})
    private String pronunciation;
}
