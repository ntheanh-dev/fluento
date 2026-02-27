package com.nta.domain.userSentenceAnswer;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SentenceFeedback {
    private String originalVietnamese;
    private String learnerEnglish;
    private Corrections corrections;
    private Feedback feedback;
    private String improvedTranslation;
    private Double score;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Corrections {
        private List<SpellingMistake> spellingMistakes;
        private List<VocabularyIssue> vocabularyIssues;
        private List<GrammarError> grammarErrors;
        private List<SentenceStructure> sentenceStructure;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SpellingMistake {
        private String word;
        private String suggestion;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VocabularyIssue {
        private String word;
        private List<String> suggestion;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GrammarError {
        private String issue;
        private String example;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SentenceStructure {
        private String problem;
        private String suggestion;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Feedback {
        private List<String> weaknesses;
    }
}
