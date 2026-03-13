export const OK = {
  AUTH_USER: "auth_user",
  PROFILE: "profile",
  OAUTH_AUTHENTICATE: "oauth_authenticate",
  API_KEYS: "api_keys",
  userPractice: (id: number) => ["userPractice", id] as const,
  usePracticeParagraphHints: (id: number, orderIndex: number) => ["usePracticeParagraphHints", id, orderIndex] as const,
  usePracticeAnswerPreview: (id: number, orderIndex: number) => ["usePracticeAnswerPreview", id, orderIndex] as const,
  RANKINGS: "rankings",
  historyList: (params: Record<string, unknown>) => ["historyList", params] as const,
  writingPerformance: (range: string) => ["writingPerformance", range] as const,
};
