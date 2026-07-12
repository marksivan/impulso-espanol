import type { LevelInfo } from '../../types';

export const LEVELS: LevelInfo[] = [
  {
    id: 'A1.1',
    name: 'Foundations',
    description:
      'Can understand and use very common words, short phrases, and simple questions about personal information and familiar surroundings.',
    whatThisMeans:
      'You can recognize basic personal information, simple questions, and very short texts about familiar topics like names, numbers, and everyday objects.',
    expectedAbilities: [
      'Introduce yourself and say where you are from',
      'Understand names, ages, countries, numbers, and familiar objects',
      'Ask and answer very simple personal questions',
      'Identify basic information in short sentences and dialogues',
    ],
    examples: [
      { spanish: 'Me llamo Ana. Soy de México.', english: 'My name is Ana. I am from Mexico.' },
      { spanish: 'Tengo veinte años.', english: 'I am twenty years old.' },
      { spanish: '¿Dónde está el baño?', english: 'Where is the bathroom?' },
    ],
    passageLength: { min: 50, max: 90 },
    grammarComplexity:
      'Subject pronouns, articles, gender and number agreement, ser, llamarse, tener, hay, and regular present-tense verbs',
    vocabularyComplexity:
      'Very high-frequency vocabulary about identity, family, home, food, numbers, colors, and places',
    questionDifficulty:
      'Direct information retrieval, matching, recognition, and very basic sequencing',
  },
  {
    id: 'A1.2',
    name: 'Early Beginner',
    description:
      'Can understand short texts and familiar expressions about routines, food, clothing, places, simple plans, and everyday requests.',
    whatThisMeans:
      'You can understand short, familiar phrases and simple questions about everyday topics. You can introduce yourself, identify people and objects, make basic requests, and follow very short texts when the vocabulary is familiar.',
    expectedAbilities: [
      'Understand short descriptions and everyday dialogues',
      'Ask and answer simple questions about familiar topics',
      'Follow a short sequence of everyday events',
      'Understand polite requests and basic reasons using porque',
    ],
    examples: [
      { spanish: 'Nosotros somos de la ciudad.', english: 'We are from the city.' },
      { spanish: '¿Quién usa pantalones verdes?', english: 'Who wears green pants?' },
      { spanish: '¿Puede traer el menú, por favor?', english: 'Can you bring the menu, please?' },
    ],
    passageLength: { min: 80, max: 140 },
    grammarComplexity:
      'Present tense, common irregular verbs, estar, ir, querer, poder, tener que, ir a + infinitive, possessives, adjective agreement, and basic connectors',
    vocabularyComplexity:
      'High-frequency everyday vocabulary with short phrases and common expressions',
    questionDifficulty:
      'Mostly direct comprehension with light vocabulary-in-context and simple inference',
  },
  {
    id: 'A2.1',
    name: 'Elementary',
    description:
      'Can understand sentences and frequently used expressions related to familiar topics, including short connected texts with basic past events.',
    whatThisMeans:
      'You can follow short personal narratives, understand basic descriptions of past events, and make simple inferences from connected sentences.',
    expectedAbilities: [
      'Understand short personal narratives',
      'Follow simple cause-and-effect in texts',
      'Recognize common past tense forms',
      'Infer basic motivations',
    ],
    examples: [
      { spanish: 'Ayer fui al mercado con mi hermana.', english: 'Yesterday I went to the market with my sister.' },
      { spanish: '¿Por qué llegaste tarde?', english: 'Why did you arrive late?' },
      { spanish: 'El vecino nunca salía de casa.', english: 'The neighbor never left the house.' },
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
    whatThisMeans:
      'You can follow multi-paragraph narratives about familiar topics and distinguish main ideas from supporting details.',
    expectedAbilities: [
      'Follow multi-paragraph narratives',
      'Distinguish main ideas from details',
      'Understand common connectors',
      'Make simple inferences from context',
    ],
    examples: [
      { spanish: 'Aunque estaba cansado, terminó el informe.', english: 'Although he was tired, he finished the report.' },
      { spanish: 'Primero desayunó, después salió de casa.', english: 'First he had breakfast, then he left home.' },
      { spanish: 'No quería dejar el trabajo para el día siguiente.', english: 'He did not want to leave the work for the next day.' },
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
    whatThisMeans:
      'You can follow opinion-based texts, understand implied meaning, and track ideas across paragraphs.',
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
    whatThisMeans:
      'You can understand nuanced arguments, identify author attitude, and produce short summaries.',
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
    whatThisMeans:
      'You can follow extended arguments, understand implicit relationships, and analyze social and cultural themes.',
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
    whatThisMeans:
      'You can evaluate arguments, synthesize information across paragraphs, and produce coherent written responses.',
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
