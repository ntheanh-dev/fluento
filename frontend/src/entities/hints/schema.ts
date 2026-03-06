export interface HintContent {
    vocabularyHints: VocabularyHint[];
}

export interface VocabularyHint {
    vietnamese: string;
    english: Vocabulary[];
}

export interface Vocabulary {
    english: string;
    partsOfSpeech: string;
    ipaPronunciation: string;
}