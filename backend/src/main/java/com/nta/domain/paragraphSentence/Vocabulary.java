package com.nta.domain.paragraphSentence;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vocabulary {
    private String english;
    private String partsOfSpeech;
    private String ipaPronunciation;
}
