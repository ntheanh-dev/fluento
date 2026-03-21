package com.nta.domain.paragraphSentence;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VocabularyHint {
    private String vietnamese;
    private List<Vocabulary> english;
}
