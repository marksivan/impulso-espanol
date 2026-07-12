export type LevelId =
  | 'A1.1'
  | 'A1.2'
  | 'A2.1'
  | 'A2.2'
  | 'B1.1'
  | 'B1.2'
  | 'B2.1'
  | 'B2.2';

export type SkillTag =
  | 'explicit-information'
  | 'main-idea'
  | 'inference'
  | 'cause-and-effect'
  | 'chronology'
  | 'tone'
  | 'motivation'
  | 'evidence-selection'
  | 'vocabulary-in-context'
  | 'grammar-recognition'
  | 'written-summary'
  | 'written-opinion';

export type QuestionType =
  | 'multiple-choice'
  | 'true-false-not-stated'
  | 'sequence'
  | 'evidence-selection'
  | 'fill-gap'
  | 'matching'
  | 'short-response'
  | 'summary';

export type DifficultyPreference = 'comfortable' | 'standard' | 'challenging' | 'push-me';

export type TranslationAssistance = 'always-available' | 'after-first-attempt' | 'challenge-mode';

export type ThemeMode = 'light' | 'dark' | 'system';

export type MasteryLabel = 'needs-work' | 'developing' | 'solid' | 'strong';

export type ReviewStatus = 'pending' | 'reviewed' | 'mastered';

export type SelfAssessmentRating = 'needs-work' | 'acceptable' | 'strong';

export interface AnswerChoice {
  id: string;
  text: string;
}

export interface Passage {
  id: string;
  title: string;
  text: string;
  paragraphs: string[];
  wordCount: number;
  sourceType: 'original' | 'adapted';
  audioUrl?: string;
}

export interface VocabularyItem {
  id: string;
  term: string;
  baseForm?: string;
  translation: string;
  partOfSpeech?: string;
  exampleSpanish?: string;
  exampleEnglish?: string;
}

export interface GrammarFocus {
  id: string;
  topic: string;
  explanation: string;
  examples: string[];
}

export interface CompletionRequirement {
  minCorrectPercentage: number;
  requireProduction: boolean;
}

export interface Question {
  id: string;
  lessonId: string;
  type: QuestionType;
  stage: 'comprehension' | 'vocabulary' | 'grammar' | 'production';
  prompt: string;
  choices?: AnswerChoice[];
  correctAnswer?: string | string[];
  explanation: string;
  incorrectChoiceExplanations?: Record<string, string>;
  evidenceQuote?: string;
  skillTags: SkillTag[];
  grammarTags?: string[];
  vocabularyTags?: string[];
  difficulty: number;
  productionChecklist?: string[];
  suggestedAnswer?: string;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle?: string;
  level: LevelId;
  topic: string;
  estimatedMinutes: number;
  passage: Passage;
  questions: Question[];
  targetVocabulary: VocabularyItem[];
  targetGrammar: GrammarFocus[];
  completionRequirements: CompletionRequirement;
  skillsTested: SkillTag[];
}

export interface LevelExample {
  spanish: string;
  english: string;
}

export interface LevelInfo {
  id: LevelId;
  name: string;
  description: string;
  whatThisMeans?: string;
  expectedAbilities: string[];
  examples?: LevelExample[];
  passageLength: { min: number; max: number };
  grammarComplexity: string;
  vocabularyComplexity: string;
  questionDifficulty: string;
}

export interface SavedVocabularyItem {
  id: string;
  sourceLanguage: 'es' | 'en';
  term: string;
  baseForm?: string;
  translation: string;
  partOfSpeech?: string;
  gender?: 'masculine' | 'feminine';
  definition?: string;
  exampleSpanish?: string;
  exampleEnglish?: string;
  sourceLessonId?: string;
  sourceSentence?: string;
  notes?: string;
  confidence: 0 | 1 | 2 | 3 | 4;
  createdAt: string;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  reviewCount: number;
}

export interface QuestionAttempt {
  id: string;
  lessonId: string;
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  usedHint: boolean;
  usedTranslation: boolean;
  skillTags: SkillTag[];
  grammarTags?: string[];
  vocabularyTags?: string[];
  attemptedAt: string;
  timeSpentSeconds?: number;
}

export interface LessonProgressRecord {
  id: string;
  lessonId: string;
  level: LevelId;
  startedAt: string;
  completedAt?: string;
  lastAccessedAt: string;
  currentStage: string;
  progressPercentage: number;
  bestScore: number;
  attemptCount: number;
  questionsAnswered: number;
  questionsCorrect: number;
  wordsLookedUp: number;
  paragraphTranslationsRevealed: number;
  hintsUsed: number;
  productionCompleted: boolean;
  productionSelfRating?: SelfAssessmentRating;
}

export interface MistakeRecord {
  id: string;
  questionId: string;
  lessonId: string;
  lessonTitle: string;
  level: LevelId;
  prompt: string;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  explanation: string;
  skillTags: SkillTag[];
  grammarTags?: string[];
  vocabularyTags?: string[];
  attemptedAt: string;
  attemptCount: number;
  reviewStatus: ReviewStatus;
  nextReviewAt?: string;
  lastReviewedAt?: string;
  reviewedCorrectly?: boolean;
}

export interface SkillMasteryRecord {
  skill: SkillTag;
  masteryScore: number;
  masteryLabel: MasteryLabel;
  totalAttempts: number;
  correctAttempts: number;
  recentAccuracy: number;
  lastAttemptedAt?: string;
  trend: 'improving' | 'stable' | 'declining' | 'insufficient-data';
}

export interface PlacementResult {
  id: string;
  recommendedLevel: LevelId;
  highestLevelConsistent?: LevelId;
  readingScore: number;
  vocabularyScore: number;
  grammarScore: number;
  inferenceScore: number;
  explanation: string;
  completedAt: string;
  acceptedRecommendation: boolean;
  overrideLevel?: LevelId;
}

export interface UserProfile {
  id: string;
  displayName: string;
  currentLevel: LevelId;
  preferredDifficulty: DifficultyPreference;
  placementCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  studyDays: string[];
}

export interface UserSettings {
  theme: ThemeMode;
  passageFontSize: 'small' | 'medium' | 'large' | 'xlarge';
  preferredDifficulty: DifficultyPreference;
  defaultQuestionLanguage: 'es' | 'en';
  translationAssistance: TranslationAssistance;
  challengeMode: boolean;
  autoAdvanceAfterCorrect: boolean;
  showExplanationsImmediately: boolean;
  dailyStudyTargetMinutes: number;
  readingFocusMode: boolean;
}

export interface TranslationRecord {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLanguage: 'es' | 'en';
  targetLanguage: 'es' | 'en';
  translatedAt: string;
  isMachineGenerated: boolean;
}

export interface VocabularyReviewRecord {
  id: string;
  vocabularyId: string;
  reviewedAt: string;
  rating: 'again' | 'hard' | 'good' | 'easy';
  wasCorrect: boolean;
  reviewType: string;
}

export interface StudySession {
  id: string;
  startedAt: string;
  endedAt?: string;
  lessonId?: string;
  activityType: 'lesson' | 'vocabulary-review' | 'mistake-review' | 'placement' | 'translation';
  minutesStudied?: number;
}

export interface StorageEnvelope<T> {
  version: number;
  updatedAt: string;
  data: T;
}

export interface ProgressExport {
  exportVersion: number;
  exportedAt: string;
  profile: UserProfile | null;
  placementResult: PlacementResult | null;
  lessonProgress: LessonProgressRecord[];
  questionAttempts: QuestionAttempt[];
  savedVocabulary: SavedVocabularyItem[];
  reviewHistory: VocabularyReviewRecord[];
  mistakeNotebook: MistakeRecord[];
  skillMastery: SkillMasteryRecord[];
  settings: UserSettings;
  translationHistory: TranslationRecord[];
}

export interface PlacementQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  passage?: string;
  choices?: AnswerChoice[];
  correctAnswer: string | string[];
  explanation: string;
  skillTags: SkillTag[];
  difficulty: number;
  level: LevelId;
}

export interface DictionaryResult {
  word: string;
  baseForm?: string;
  partOfSpeech?: string;
  definitions: string[];
  translation?: string;
  pronunciation?: string;
  examples: string[];
  relatedMeanings: string[];
  commonPhrases: string[];
  sourceLabel: string;
}

export interface TranslationResult {
  sourceText: string;
  translatedText: string;
  sourceLanguage: 'es' | 'en';
  targetLanguage: 'es' | 'en';
  isMachineGenerated: boolean;
  fromCache: boolean;
}

export interface WeeklyStats {
  lessonsCompleted: number;
  questionsAnswered: number;
  accuracy: number;
  wordsSaved: number;
  vocabularyReviewsCompleted: number;
  minutesStudied: number;
}

export interface IndependenceMetrics {
  passagesWithoutFullTranslation: number;
  questionsWithoutHints: number;
  wordsLookedUp: number;
  paragraphTranslationsRevealed: number;
  writtenResponsesCompleted: number;
}
