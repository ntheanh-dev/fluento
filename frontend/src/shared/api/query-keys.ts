export const OK = {
  AUTH_USER: "auth_user",
  PROFILE: "profile",
  SUBSCRIPTION_USAGE: "subscription_usage",
  OAUTH_AUTHENTICATE: "oauth_authenticate",
  userPractice: (id: number) => ["userPractice", id] as const,
  usePracticeSentenceVocabularyHints: (sentenceId: number) => ["usePracticeSentenceVocabularyHints", sentenceId] as const,
  communityTranslations: (sentenceId: number, score: string) =>
    ["communityTranslations", sentenceId, score] as const,
  usePracticeAnswerPreview: (id: number, orderIndex: number) => ["usePracticeAnswerPreview", id, orderIndex] as const,
  RANKINGS: "rankings",
  historyList: (params: Record<string, unknown>) => ["historyList", params] as const,
};
