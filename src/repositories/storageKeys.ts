export const STORAGE_KEYS = {
  profile: 'spanishApp.profile',
  lessonProgress: 'spanishApp.lessonProgress',
  questionAttempts: 'spanishApp.questionAttempts',
  savedVocabulary: 'spanishApp.savedVocabulary',
  reviewHistory: 'spanishApp.reviewHistory',
  mistakeNotebook: 'spanishApp.mistakeNotebook',
  skillMastery: 'spanishApp.skillMastery',
  placementResult: 'spanishApp.placementResult',
  settings: 'spanishApp.settings',
  translationHistory: 'spanishApp.translationHistory',
  studySessions: 'spanishApp.studySessions',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
