import type {
  Lesson,
  Question,
  VocabularyItem,
  GrammarFocus,
  LevelId,
  SkillTag,
} from '../../types';

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function buildPassage(id: string, title: string, paragraphs: string[]) {
  const text = paragraphs.join('\n\n');
  return {
    id,
    title,
    text,
    paragraphs,
    wordCount: countWords(text),
    sourceType: 'original' as const,
  };
}

export function mcq(
  id: string,
  lessonId: string,
  stage: Question['stage'],
  prompt: string,
  choices: { id: string; text: string }[],
  correctId: string,
  explanation: string,
  skillTags: SkillTag[],
  opts: Partial<Question> = {},
): Question {
  return {
    id,
    lessonId,
    type: 'multiple-choice',
    stage,
    prompt,
    choices,
    correctAnswer: correctId,
    explanation,
    skillTags,
    difficulty: opts.difficulty ?? 2,
    evidenceQuote: opts.evidenceQuote,
    incorrectChoiceExplanations: opts.incorrectChoiceExplanations,
    grammarTags: opts.grammarTags,
    vocabularyTags: opts.vocabularyTags,
  };
}

export function tfn(
  id: string,
  lessonId: string,
  stage: Question['stage'],
  prompt: string,
  answer: 'true' | 'false' | 'not-stated',
  explanation: string,
  skillTags: SkillTag[],
  opts: Partial<Question> = {},
): Question {
  return {
    id,
    lessonId,
    type: 'true-false-not-stated',
    stage,
    prompt,
    choices: [
      { id: 'true', text: 'Verdadero' },
      { id: 'false', text: 'Falso' },
      { id: 'not-stated', text: 'No se menciona' },
    ],
    correctAnswer: answer,
    explanation,
    skillTags,
    difficulty: opts.difficulty ?? 2,
    evidenceQuote: opts.evidenceQuote,
    grammarTags: opts.grammarTags,
    vocabularyTags: opts.vocabularyTags,
  };
}

export function evidence(
  id: string,
  lessonId: string,
  prompt: string,
  choices: { id: string; text: string }[],
  correctId: string,
  explanation: string,
  skillTags: SkillTag[],
): Question {
  return {
    id,
    lessonId,
    type: 'evidence-selection',
    stage: 'comprehension',
    prompt,
    choices,
    correctAnswer: correctId,
    explanation,
    skillTags,
    difficulty: 3,
  };
}

export function fillGap(
  id: string,
  lessonId: string,
  stage: Question['stage'],
  prompt: string,
  answer: string,
  explanation: string,
  skillTags: SkillTag[],
  opts: Partial<Question> = {},
): Question {
  return {
    id,
    lessonId,
    type: 'fill-gap',
    stage,
    prompt,
    correctAnswer: answer,
    explanation,
    skillTags,
    difficulty: opts.difficulty ?? 2,
    grammarTags: opts.grammarTags,
    vocabularyTags: opts.vocabularyTags,
  };
}

export function sequence(
  id: string,
  lessonId: string,
  prompt: string,
  order: string[],
  explanation: string,
  skillTags: SkillTag[] = ['chronology'],
): Question {
  return {
    id,
    lessonId,
    type: 'sequence',
    stage: 'comprehension',
    prompt,
    correctAnswer: order,
    explanation,
    skillTags,
    difficulty: 3,
  };
}

export function production(
  id: string,
  lessonId: string,
  prompt: string,
  suggestedAnswer: string,
  checklist: string[],
  skillTags: SkillTag[],
): Question {
  return {
    id,
    lessonId,
    type: 'short-response',
    stage: 'production',
    prompt,
    explanation: 'Compare your response with the suggested answer and checklist.',
    skillTags,
    difficulty: 3,
    suggestedAnswer,
    productionChecklist: checklist,
  };
}

export function buildLesson(params: {
  id: string;
  title: string;
  subtitle?: string;
  level: LevelId;
  topic: string;
  estimatedMinutes: number;
  paragraphs: string[];
  questions: Question[];
  targetVocabulary: VocabularyItem[];
  targetGrammar: GrammarFocus[];
  skillsTested: SkillTag[];
}): Lesson {
  const passage = buildPassage(`passage-${params.id}`, params.title, params.paragraphs);
  return {
    id: params.id,
    title: params.title,
    subtitle: params.subtitle,
    level: params.level,
    topic: params.topic,
    estimatedMinutes: params.estimatedMinutes,
    passage,
    questions: params.questions,
    targetVocabulary: params.targetVocabulary,
    targetGrammar: params.targetGrammar,
    completionRequirements: { minCorrectPercentage: 60, requireProduction: true },
    skillsTested: params.skillsTested,
  };
}

export function choice(id: string, text: string) {
  return { id, text };
}
