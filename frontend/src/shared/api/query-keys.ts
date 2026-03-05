export const OK = {
  AUTH_USER: "auth_user",
  PROFILE: "profile",
  OAUTH_AUTHENTICATE: "oauth_authenticate",
  userPractice: (id: number) => ["userPractice", id] as const,
  usePracticeParagraphHints: (id: number, orderIndex: number) => ["usePracticeParagraphHints", id, orderIndex] as const,
  usePracticeAnswerPreview: (id: number, orderIndex: number) => ["usePracticeAnswerPreview", id, orderIndex] as const,
  RANKINGS: "rankings",
};
