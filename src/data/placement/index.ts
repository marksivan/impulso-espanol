import type { LevelId, PlacementQuestion } from '../../types';
import { LEVEL_ORDER } from '../../constants';
import { getLevelIndex, getPreviousLevel, getNextLevel } from '../../utilities/levelUtils';
import { choice } from '../lessons/lessonFactory';

const PLACEMENT_ACCURACY_THRESHOLD = 0.7;
const MAX_PLACEMENT_QUESTIONS = 15;

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  // A1.1 — Foundations
  {
    id: 'place-a11-01',
    type: 'multiple-choice',
    level: 'A1.1',
    difficulty: 1,
    skillTags: ['explicit-information'],
    passage: 'Hola. Me llamo Ana. Vivo en Madrid con mi hermana.',
    prompt: '¿Dónde vive Ana?',
    choices: [
      choice('a', 'En Madrid'),
      choice('b', 'En Barcelona'),
      choice('c', 'En Valencia'),
      choice('d', 'En Sevilla'),
    ],
    correctAnswer: 'a',
    explanation: 'The passage says "Vivo en Madrid".',
  },
  {
    id: 'place-a11-02',
    type: 'multiple-choice',
    level: 'A1.1',
    difficulty: 1,
    skillTags: ['vocabulary-in-context'],
    passage: 'Carlos tiene un gato negro. El gato se llama Luna y duerme en el sofá.',
    prompt: '¿De qué color es el gato?',
    choices: [
      choice('a', 'Negro'),
      choice('b', 'Blanco'),
      choice('c', 'Gris'),
      choice('d', 'Marrón'),
    ],
    correctAnswer: 'a',
    explanation: 'The passage describes "un gato negro".',
  },
  {
    id: 'place-a11-03',
    type: 'true-false-not-stated',
    level: 'A1.1',
    difficulty: 1,
    skillTags: ['chronology'],
    passage: 'Por la mañana, Laura desayuna. Después va al colegio.',
    prompt: 'Laura desayuna antes de ir al colegio.',
    correctAnswer: 'true',
    explanation: 'She has breakfast first, then goes to school.',
  },
  // A1.2 — Early Beginner
  {
    id: 'place-a12-01',
    type: 'multiple-choice',
    level: 'A1.2',
    difficulty: 1,
    skillTags: ['explicit-information'],
    passage: 'Hoy hace sol pero hace frío. Pablo lleva abrigo y bufanda.',
    prompt: '¿Qué lleva Pablo?',
    choices: [
      choice('a', 'Sombrero y guantes'),
      choice('b', 'Abrigo y bufanda'),
      choice('c', 'Camiseta y pantalones cortos'),
      choice('d', 'Gafas de sol'),
    ],
    correctAnswer: 'b',
    explanation: 'The passage says he wears a coat and scarf.',
  },
  {
    id: 'place-a12-02',
    type: 'fill-gap',
    level: 'A1.2',
    difficulty: 1,
    skillTags: ['grammar-recognition'],
    prompt: 'Nosotros _____ en una casa pequeña. (vivir → present tense)',
    correctAnswer: 'vivimos',
    explanation: 'Present tense of "vivir" for "nosotros" is "vivimos".',
  },
  {
    id: 'place-a12-03',
    type: 'multiple-choice',
    level: 'A1.2',
    difficulty: 1,
    skillTags: ['vocabulary-in-context'],
    passage: 'La panadería está al lado del parque. Allí venden pan fresco todos los días.',
    prompt: '¿Qué venden en la panadería?',
    choices: [
      choice('a', 'Fruta'),
      choice('b', 'Pan fresco'),
      choice('c', 'Ropa'),
      choice('d', 'Libros'),
    ],
    correctAnswer: 'b',
    explanation: 'The passage says they sell fresh bread every day.',
  },
  // A2.1 — Elementary
  {
    id: 'place-a21-01',
    type: 'multiple-choice',
    level: 'A2.1',
    difficulty: 1,
    skillTags: ['explicit-information'],
    passage:
      'María salió de casa a las ocho. Tomó el autobús número 12 y llegó al trabajo veinte minutos después. Su jefe ya la esperaba en la reunión.',
    prompt: '¿Cómo llegó María al trabajo?',
    choices: [
      choice('a', 'En bicicleta'),
      choice('b', 'En autobús'),
      choice('c', 'A pie'),
      choice('d', 'En taxi'),
    ],
    correctAnswer: 'b',
    explanation: 'The passage says she took bus number 12.',
  },
  {
    id: 'place-a21-02',
    type: 'true-false-not-stated',
    level: 'A2.1',
    difficulty: 1,
    skillTags: ['chronology'],
    passage:
      'Primero, Pedro compró el pan. Después, pasó por la farmacia. Finalmente, regresó a casa a preparar el desayuno.',
    prompt: 'Pedro fue a la farmacia antes de comprar el pan.',
    correctAnswer: 'false',
    explanation: 'He bought bread first, then went to the pharmacy.',
  },
  // A2.2 — Upper Elementary
  {
    id: 'place-a22-01',
    type: 'multiple-choice',
    level: 'A2.2',
    difficulty: 2,
    skillTags: ['vocabulary-in-context'],
    passage:
      'Aunque estaba cansado, Javier decidió terminar el informe antes de cenar. No quería dejar el trabajo para el día siguiente.',
    prompt: '¿Qué significa "aunque" en este contexto?',
    choices: [
      choice('a', 'Porque'),
      choice('b', 'A pesar de que'),
      choice('c', 'Después de que'),
      choice('d', 'Mientras'),
    ],
    correctAnswer: 'b',
    explanation: '"Aunque" introduces a contrast: despite being tired, he finished the report.',
  },
  {
    id: 'place-a22-02',
    type: 'true-false-not-stated',
    level: 'A2.2',
    difficulty: 2,
    skillTags: ['explicit-information'],
    passage:
      'La biblioteca municipal abre de martes a sábado. Los domingos permanece cerrada, pero los estudiantes pueden reservar libros en línea.',
    prompt: 'La biblioteca abre los domingos.',
    correctAnswer: 'false',
    explanation: 'The passage states it is closed on Sundays.',
  },
  {
    id: 'place-a22-03',
    type: 'multiple-choice',
    level: 'A2.2',
    difficulty: 2,
    skillTags: ['vocabulary-in-context'],
    passage:
      'Después de la tormenta, el jardín estaba hecho un desastre. Ramas caídas bloqueaban el camino y las macetas volcadas cubrían el suelo.',
    prompt: '¿Qué significa "hecho un desastre"?',
    choices: [
      choice('a', 'Muy ordenado'),
      choice('b', 'Completamente desordenado y dañado'),
      choice('c', 'Recién plantado'),
      choice('d', 'Vacío'),
    ],
    correctAnswer: 'b',
    explanation: 'Colloquial expression meaning complete mess.',
  },
  // B1.1 — Intermediate
  {
    id: 'place-b11-01',
    type: 'multiple-choice',
    level: 'B1.1',
    difficulty: 3,
    skillTags: ['inference'],
    passage:
      'Cuando Lucía vio la expresión de su amiga, comprendió que algo importante había cambiado. No hizo preguntas; simplemente le ofreció su mano.',
    prompt: '¿Qué podemos inferir sobre Lucía?',
    choices: [
      choice('a', 'Está enfadada con su amiga'),
      choice('b', 'Es empática y comprensiva'),
      choice('c', 'No le importa la situación'),
      choice('d', 'Quiere cambiar de tema'),
    ],
    correctAnswer: 'b',
    explanation: 'She understood without asking questions and offered support.',
  },
  {
    id: 'place-b11-02',
    type: 'fill-gap',
    level: 'B1.1',
    difficulty: 3,
    skillTags: ['grammar-recognition'],
    prompt: 'Si yo _____ más tiempo, viajaría más. (tener → conditional context)',
    correctAnswer: 'tuviera',
    explanation: 'Imperfect subjunctive after "si" in hypothetical conditions.',
  },
  {
    id: 'place-b11-03',
    type: 'multiple-choice',
    level: 'B1.1',
    difficulty: 3,
    skillTags: ['cause-and-effect'],
    passage:
      'El ayuntamiento cerró la plaza principal porque las obras de renovación generaban riesgos para los peatones. Los comercios cercanos reportaron una caída temporal en las ventas.',
    prompt: '¿Por qué cerraron la plaza?',
    choices: [
      choice('a', 'Por las bajas ventas'),
      choice('b', 'Por obras que representaban un riesgo'),
      choice('c', 'Por una protesta'),
      choice('d', 'Por el mal tiempo'),
    ],
    correctAnswer: 'b',
    explanation: 'Renovation works created risks for pedestrians.',
  },
  {
    id: 'place-b11-04',
    type: 'multiple-choice',
    level: 'B1.1',
    difficulty: 3,
    skillTags: ['motivation'],
    passage:
      'Elena renunció al proyecto no por falta de interés, sino porque consideró que los plazos eran irrealistas y comprometían la calidad del trabajo.',
    prompt: '¿Por qué renunció Elena?',
    choices: [
      choice('a', 'Perdió interés en el tema'),
      choice('b', 'Los plazos ponían en riesgo la calidad'),
      choice('c', 'Quería un ascenso'),
      choice('d', 'Se mudó a otra ciudad'),
    ],
    correctAnswer: 'b',
    explanation: 'She felt deadlines were unrealistic and compromised quality.',
  },
  // B1.2 — Upper Intermediate
  {
    id: 'place-b12-01',
    type: 'multiple-choice',
    level: 'B1.2',
    difficulty: 4,
    skillTags: ['main-idea'],
    passage:
      'Durante décadas, el barrio dependió de la fábrica textil. Cuando esta cerró, muchas familias emigraron. Hoy, pequeños negocios creativos ocupan los antiguos talleres, pero los precios de la vivienda han subido, generando tensiones entre residentes antiguos y recién llegados.',
    prompt: '¿Cuál es la idea principal del texto?',
    choices: [
      choice('a', 'La fábrica textil fue muy exitosa'),
      choice('b', 'El barrio ha experimentado cambios económicos y sociales complejos'),
      choice('c', 'Los nuevos negocios han resuelto todos los problemas'),
      choice('d', 'Las familias prefieren emigrar'),
    ],
    correctAnswer: 'b',
    explanation: 'The passage describes economic transition and social tensions.',
  },
  {
    id: 'place-b12-02',
    type: 'true-false-not-stated',
    level: 'B1.2',
    difficulty: 4,
    skillTags: ['explicit-information'],
    passage:
      'El estudio sugiere que los estudiantes que leen treinta minutos al día mejoran su comprensión lectora más rápidamente. Sin embargo, los investigadores advierten que los resultados varían según el tipo de material.',
    prompt: 'Todos los estudiantes mejoran al mismo ritmo.',
    correctAnswer: 'false',
    explanation: 'Researchers warn that results vary by material type.',
  },
  {
    id: 'place-b12-03',
    type: 'fill-gap',
    level: 'B1.2',
    difficulty: 4,
    skillTags: ['grammar-recognition'],
    prompt: 'Cuando llegué, ellos ya _____ de comer. (terminar → pluperfect)',
    correctAnswer: 'habían terminado',
    explanation: 'Pluperfect for action completed before another past action.',
  },
  // B2.1 — Advanced
  {
    id: 'place-b21-01',
    type: 'multiple-choice',
    level: 'B2.1',
    difficulty: 5,
    skillTags: ['inference'],
    passage:
      'El artículo critica la retórica oficial que presenta el teletrabajo como una panacea, señalando que ignora las desigualdades de acceso a la tecnología y la sobrecarga doméstica que muchas trabajadoras enfrentan.',
    prompt: '¿Cuál es la postura del artículo?',
    choices: [
      choice('a', 'Apoya incondicionalmente el teletrabajo'),
      choice('b', 'Cuestiona una visión simplista del teletrabajo'),
      choice('c', 'Rechaza toda forma de trabajo remoto'),
      choice('d', 'Describe ventajas sin críticas'),
    ],
    correctAnswer: 'b',
    explanation: 'It criticizes official rhetoric that presents remote work as a cure-all.',
  },
  {
    id: 'place-b21-02',
    type: 'fill-gap',
    level: 'B2.1',
    difficulty: 5,
    skillTags: ['grammar-recognition'],
    prompt: 'Me alegró que ellos _____ a tiempo. (llegar → subjunctive after emotion)',
    correctAnswer: 'llegaran',
    explanation: 'Imperfect subjunctive after emotional reaction "me alegró que".',
  },
  {
    id: 'place-b21-03',
    type: 'multiple-choice',
    level: 'B2.1',
    difficulty: 5,
    skillTags: ['main-idea'],
    passage:
      'Más que un cambio tecnológico, la digitalización de los servicios públicos revela una tensión entre eficiencia administrativa y accesibilidad para personas mayores que no dominan las herramientas digitales.',
    prompt: '¿Cuál es el enfoque central del texto?',
    choices: [
      choice('a', 'Celebrar la tecnología sin reservas'),
      choice('b', 'La tensión entre eficiencia y accesibilidad'),
      choice('c', 'Rechazar la digitalización'),
      choice('d', 'Describir aplicaciones móviles'),
    ],
    correctAnswer: 'b',
    explanation: 'Central focus is tension between efficiency and accessibility.',
  },
  // B2.2 — Upper Advanced
  {
    id: 'place-b22-01',
    type: 'multiple-choice',
    level: 'B2.2',
    difficulty: 6,
    skillTags: ['tone'],
    passage:
      'La propuesta, si bien ambiciosa, parece desconectada de la realidad cotidiana de quienes pagan más del cuarenta por ciento de sus ingresos en alquiler. El discurso optimista del concejal contrasta con los testimonios recogidos en la puerta del mercado.',
    prompt: '¿Qué tono predomina en el texto?',
    choices: [
      choice('a', 'Entusiasta y celebratorio'),
      choice('b', 'Crítico y escéptico'),
      choice('c', 'Neutral y técnico'),
      choice('d', 'Humorístico'),
    ],
    correctAnswer: 'b',
    explanation: 'The text contrasts optimistic discourse with harsh reality.',
  },
  {
    id: 'place-b22-02',
    type: 'multiple-choice',
    level: 'B2.2',
    difficulty: 6,
    skillTags: ['evidence-selection'],
    passage:
      'Los defensores argumentan que la densificación reduce el uso del automóvil. Los críticos señalan que sin inversión en transporte público, la medida solo encarece la vida en el centro.',
    prompt: '¿Qué evidencia apoya la posición crítica?',
    choices: [
      choice('a', 'La densificación reduce el uso del automóvil'),
      choice('b', 'Sin transporte público, la medida encarece la vida en el centro'),
      choice('c', 'Los defensores apoyan la medida'),
      choice('d', 'El centro es muy popular'),
    ],
    correctAnswer: 'b',
    explanation: 'Critics point to lack of public transport investment.',
  },
  {
    id: 'place-b22-03',
    type: 'true-false-not-stated',
    level: 'B2.2',
    difficulty: 6,
    skillTags: ['inference'],
    passage:
      'La narradora insinúa que su decisión de quedarse en el extranjero respondía tanto a oportunidades profesionales como a la distancia emocional con su familia.',
    prompt: 'La narradora odia a su familia.',
    correctAnswer: 'not-stated',
    explanation: 'Emotional distance is mentioned, but hatred is not stated.',
  },
];

export const PLACEMENT_BY_LEVEL: Record<LevelId, PlacementQuestion[]> = LEVEL_ORDER.reduce(
  (acc, level) => {
    acc[level] = PLACEMENT_QUESTIONS.filter((q) => q.level === level).sort((a, b) =>
      a.id.localeCompare(b.id),
    );
    return acc;
  },
  {} as Record<LevelId, PlacementQuestion[]>,
);

function isAnswerCorrect(question: PlacementQuestion, userAnswer: string | undefined): boolean {
  if (!userAnswer) return false;
  const normalized = userAnswer.toLowerCase().trim();
  if (typeof question.correctAnswer === 'string') {
    return normalized === question.correctAnswer.toLowerCase();
  }
  return question.correctAnswer.some((answer) => answer.toLowerCase() === normalized);
}

function getLevelAccuracy(answers: Record<string, string>, level: LevelId): number | null {
  const answeredAtLevel = PLACEMENT_BY_LEVEL[level].filter((q) => answers[q.id] !== undefined);
  if (answeredAtLevel.length === 0) return null;
  const correct = answeredAtLevel.filter((q) => isAnswerCorrect(q, answers[q.id])).length;
  return correct / answeredAtLevel.length;
}

export function evaluatePlacement(answers: Record<string, string>): {
  recommendedLevel: LevelId;
  highestLevelConsistent: LevelId;
  readingScore: number;
  vocabularyScore: number;
  grammarScore: number;
  inferenceScore: number;
  explanation: string;
} {
  const answeredQuestions = PLACEMENT_QUESTIONS.filter((q) => answers[q.id] !== undefined);

  let recommendedLevel: LevelId = 'A1.1';
  let highestLevelConsistent: LevelId = 'A1.1';

  for (const level of LEVEL_ORDER) {
    const accuracy = getLevelAccuracy(answers, level);
    if (accuracy === null) continue;
    if (accuracy >= PLACEMENT_ACCURACY_THRESHOLD) {
      highestLevelConsistent = level;
      recommendedLevel = level;
    } else {
      break;
    }
  }

  let reading = 0;
  let readingTotal = 0;
  let vocab = 0;
  let vocabTotal = 0;
  let grammar = 0;
  let grammarTotal = 0;
  let inference = 0;
  let inferenceTotal = 0;

  for (const q of answeredQuestions) {
    const isCorrect = isAnswerCorrect(q, answers[q.id]);

    if (q.skillTags.includes('explicit-information') || q.skillTags.includes('main-idea')) {
      readingTotal++;
      if (isCorrect) reading++;
    }
    if (q.skillTags.includes('vocabulary-in-context')) {
      vocabTotal++;
      if (isCorrect) vocab++;
    }
    if (q.skillTags.includes('grammar-recognition')) {
      grammarTotal++;
      if (isCorrect) grammar++;
    }
    if (
      q.skillTags.includes('inference') ||
      q.skillTags.includes('tone') ||
      q.skillTags.includes('evidence-selection')
    ) {
      inferenceTotal++;
      if (isCorrect) inference++;
    }
  }

  const readingScore = readingTotal ? Math.round((reading / readingTotal) * 100) : 0;
  const vocabularyScore = vocabTotal ? Math.round((vocab / vocabTotal) * 100) : 0;
  const grammarScore = grammarTotal ? Math.round((grammar / grammarTotal) * 100) : 0;
  const inferenceScore = inferenceTotal ? Math.round((inference / inferenceTotal) * 100) : 0;

  const levelSummaries = LEVEL_ORDER.map((level) => {
    const accuracy = getLevelAccuracy(answers, level);
    if (accuracy === null) return null;
    return `${level}: ${Math.round(accuracy * 100)}%`;
  }).filter(Boolean);

  const strongestArea =
    Math.max(readingScore, vocabularyScore, grammarScore, inferenceScore) === readingScore
      ? 'reading comprehension'
      : Math.max(vocabularyScore, grammarScore, inferenceScore) === vocabularyScore
        ? 'vocabulary'
        : Math.max(grammarScore, inferenceScore) === grammarScore
          ? 'grammar'
          : 'inference';

  const explanation =
    `Based on ${answeredQuestions.length} answered question${answeredQuestions.length === 1 ? '' : 's'}, ` +
    `we recommend starting at ${recommendedLevel}. ` +
    `Your highest consistent level (≥${Math.round(PLACEMENT_ACCURACY_THRESHOLD * 100)}% accuracy) is ${highestLevelConsistent}.` +
    (levelSummaries.length > 0 ? ` Level accuracy: ${levelSummaries.join(', ')}.` : '') +
    ` Your strongest area appears to be ${strongestArea}.`;

  return {
    recommendedLevel,
    highestLevelConsistent,
    readingScore,
    vocabularyScore,
    grammarScore,
    inferenceScore,
    explanation,
  };
}

function resolveAdaptiveLevel(
  currentLevel: LevelId,
  consecutiveCorrect: number,
  consecutiveWrong: number,
): LevelId {
  if (consecutiveWrong >= 2) {
    return getPreviousLevel(currentLevel) ?? 'A1.1';
  }
  if (consecutiveCorrect >= 2) {
    return getNextLevel(currentLevel) ?? currentLevel;
  }
  return currentLevel;
}

function findNextUnansweredQuestion(
  answeredIds: Set<string>,
  startLevel: LevelId,
): PlacementQuestion | null {
  const startIdx = getLevelIndex(startLevel);

  for (let i = startIdx; i < LEVEL_ORDER.length; i++) {
    const question = PLACEMENT_BY_LEVEL[LEVEL_ORDER[i]].find((q) => !answeredIds.has(q.id));
    if (question) return question;
  }

  for (let i = startIdx - 1; i >= 0; i--) {
    const question = PLACEMENT_BY_LEVEL[LEVEL_ORDER[i]].find((q) => !answeredIds.has(q.id));
    if (question) return question;
  }

  return null;
}

export function getAdaptivePlacementQuestions(
  answeredIds: Set<string>,
  currentLevel: LevelId,
  consecutiveCorrect: number,
  consecutiveWrong: number,
): PlacementQuestion | null {
  if (shouldStopPlacement(answeredIds.size, consecutiveWrong, currentLevel)) {
    return null;
  }

  const targetLevel = resolveAdaptiveLevel(currentLevel, consecutiveCorrect, consecutiveWrong);
  const atLevel = PLACEMENT_BY_LEVEL[targetLevel].find((q) => !answeredIds.has(q.id));
  if (atLevel) return atLevel;

  return findNextUnansweredQuestion(answeredIds, targetLevel);
}

export function shouldStopPlacement(
  answeredCount: number,
  consecutiveWrong: number,
  _currentLevel: LevelId,
): boolean {
  if (answeredCount >= MAX_PLACEMENT_QUESTIONS) return true;
  if (consecutiveWrong >= 2) return true;
  return false;
}
