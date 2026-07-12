import type { LevelId, SkillTag } from '../types';

export const APP_NAME = 'Impulso Español';

export const STORAGE_SCHEMA_VERSION = 2;

export const EXPORT_VERSION = 1;

export const MAX_TRANSLATION_CHARS = 400;

export const MAX_TRANSLATION_HISTORY = 50;

export const SKILL_LABELS: Record<SkillTag, string> = {
  'explicit-information': 'Explicit information',
  'main-idea': 'Main idea',
  inference: 'Inference',
  'cause-and-effect': 'Cause and effect',
  chronology: 'Chronology',
  tone: 'Tone',
  motivation: 'Motivation',
  'evidence-selection': 'Evidence selection',
  'vocabulary-in-context': 'Vocabulary in context',
  'grammar-recognition': 'Grammar recognition',
  'written-summary': 'Written summary',
  'written-opinion': 'Written opinion',
};

export const CONFIDENCE_LABELS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'New',
  1: 'Barely recognize',
  2: 'Recognize',
  3: 'Understand',
  4: 'Can use confidently',
};

export const MASTERY_LABELS = {
  'needs-work': 'Needs work',
  developing: 'Developing',
  solid: 'Solid',
  strong: 'Strong',
} as const;

export const REVIEW_INTERVALS = {
  again: 0,
  hard: 1,
  good: 3,
  easy: 7,
} as const;

export const EXTENDED_REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60];

export const TOPICS = [
  'Everyday life',
  'Mystery',
  'Culture',
  'Travel',
  'Technology',
  'Education',
  'Sports',
  'Relationships',
  'Work',
  'News-style stories',
  'Social issues',
  'Opinion and debate',
  'Practical Spanish',
] as const;

export const DIFFICULTY_LABELS = {
  comfortable: 'Comfortable',
  standard: 'Standard',
  challenging: 'Challenging',
  'push-me': 'Push me',
} as const;

export const LEVEL_ORDER: LevelId[] = [
  'A1.1',
  'A1.2',
  'A2.1',
  'A2.2',
  'B1.1',
  'B1.2',
  'B2.1',
  'B2.2',
];

export const DEFAULT_LEVEL: LevelId = 'A1.2';

export const OLD_DEFAULT_LEVELS: LevelId[] = ['A2.1', 'A2.2'];

export const FONT_SIZE_MAP = {
  small: '0.95rem',
  medium: '1.1rem',
  large: '1.25rem',
  xlarge: '1.4rem',
} as const;
