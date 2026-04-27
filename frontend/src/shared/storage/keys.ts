export const LOCAL_STORAGE_KEYS = {
  theme: "luyenviet-theme",
  language: "i18nextLng",
  cache: {
    noteTypes: "noteTypes",
  },
  deckPractice: {
    flashcard: {
      startFace: "deckPractice.flashcard.startFace",
      speakOnFlip: "deckPractice.flashcard.speakOnFlip",
    },
    matchMeaning: {
      speakOnCorrectMatch: "deckPractice.matchMeaning.speakOnCorrectMatch",
      swapColumns: "deckPractice.matchMeaning.swapColumns",
    },
    typeWord: {
      speakOnRender: "deckPractice.typeWord.speakOnRender",
      speakOnCheck: "deckPractice.typeWord.speakOnCheck",
    },
    dictation: {
      autoPlay: "deckPractice.dictation.autoPlay",
    },
  },
} as const;

