import type { LevelInfo } from '../../types';

export const LEVELS: LevelInfo[] = [
  {
    id: 'A2.1',
    name: 'Elementary',
    description: 'Can understand sentences and frequently used expressions related to familiar topics.',
    expectedAbilities: [
      'Understand short personal narratives',
      'Follow simple cause-and-effect in texts',
      'Recognize common past tense forms',
      'Infer basic motivations',
    ],
    passageLength: { min: 150, max: 220 },
    grammarComplexity: 'Present, preterite, and basic imperfect',
    vocabularyComplexity: 'High-frequency everyday vocabulary',
    questionDifficulty: 'Direct comprehension with some inference',
  },
  {
    id: 'A2.2',
    name: 'Upper Elementary',
    description: 'Can understand the main points of clear standard input on familiar matters.',
    expectedAbilities: [
      'Follow multi-paragraph narratives',
      'Distinguish main ideas from details',
      'Understand common connectors',
      'Make simple inferences from context',
    ],
    passageLength: { min: 200, max: 300 },
    grammarComplexity: 'Past tenses, object pronouns, basic subjunctive exposure',
    vocabularyComplexity: 'Expanded everyday and situational vocabulary',
    questionDifficulty: 'Mix of explicit and inferential questions',
  },
  {
    id: 'B1.1',
    name: 'Intermediate',
    description: 'Can understand the main points of clear standard input on familiar and some unfamiliar topics.',
    expectedAbilities: [
      'Follow opinion-based texts',
      'Understand implied meaning',
      'Track chronology across paragraphs',
      'Analyze tone in simple texts',
    ],
    passageLength: { min: 280, max: 400 },
    grammarComplexity: 'Subjunctive in common contexts, perfect tenses, relative clauses',
    vocabularyComplexity: 'Abstract and topic-specific vocabulary',
    questionDifficulty: 'Analytical comprehension and context vocabulary',
  },
  {
    id: 'B1.2',
    name: 'Upper Intermediate',
    description: 'Can deal with most situations likely to arise while traveling or discussing familiar topics in depth.',
    expectedAbilities: [
      'Understand nuanced arguments',
      'Identify author attitude',
      'Connect evidence to conclusions',
      'Produce short summaries',
    ],
    passageLength: { min: 350, max: 500 },
    grammarComplexity: 'Complex sentence structures, conditional, passive voice',
    vocabularyComplexity: 'Idiomatic expressions and collocations',
    questionDifficulty: 'Inference, evidence selection, and production',
  },
  {
    id: 'B2.1',
    name: 'Advanced',
    description: 'Can understand the main ideas of complex text on both concrete and abstract topics.',
    expectedAbilities: [
      'Follow extended arguments',
      'Understand implicit relationships',
      'Analyze social and cultural themes',
      'Express opinions with supporting reasons',
    ],
    passageLength: { min: 450, max: 650 },
    grammarComplexity: 'Full range of tenses, subjunctive, complex connectors',
    vocabularyComplexity: 'Academic and professional register',
    questionDifficulty: 'Complex inference and critical reading',
  },
  {
    id: 'B2.2',
    name: 'Upper Advanced',
    description: 'Can understand extended discourse and recognize implicit meaning in complex texts.',
    expectedAbilities: [
      'Evaluate arguments and bias',
      'Synthesize information across paragraphs',
      'Understand figurative language',
      'Produce coherent written responses',
    ],
    passageLength: { min: 550, max: 850 },
    grammarComplexity: 'Sophisticated structures including pluperfect and nuanced subjunctive',
    vocabularyComplexity: 'Low-frequency vocabulary and nuanced expressions',
    questionDifficulty: 'Advanced analysis and production',
  },
];

export function getLevelInfo(levelId: string): LevelInfo | undefined {
  return LEVELS.find((l) => l.id === levelId);
}

export function getLevelDisplay(levelId: string): string {
  const level = getLevelInfo(levelId);
  return level ? `${levelId} — ${level.name}` : levelId;
}
