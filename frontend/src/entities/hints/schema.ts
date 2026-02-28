export interface HintContent {
    vocabularyHints: VocabularyHint[];
    structureHints: StructureHints;
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
  
  export interface StructureHints {
    kindsOfSentencesAccordingToStructure: SentenceStructure;
    tenses: Tense;
  }
  
  export interface SentenceStructure {
    vietnamese: string;
    english: string;
  }
  
  export interface Tense {
    vietnamese: string;
    english: string;
    form: string;
  }