package com.nta.domain.paragraphSentence;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyHint {
    @JsonProperty("sourceText")
    @JsonAlias("vietnamese")
    private String sourceText;

    @JsonProperty("translations")
    @JsonAlias({"english", "chinese", "korean"})
    private List<Vocabulary> translations;
}
