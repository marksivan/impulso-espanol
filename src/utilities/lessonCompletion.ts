import type { Lesson, LessonProgressRecord, Question, QuestionAttempt } from '../types';
import { answersMatch, calculatePercentage, generateId } from './helpers';

export function createInitialProgress(lesson: Lesson): LessonProgressRecord {
  const now = new Date().toISOString();
  return {
    id: generateId('progress'),
    lessonId: lesson.id,
    level: lesson.level,
    startedAt: now,
    lastAccessedAt: now,
    currentStage: 'preview',
    progressPercentage: 0,
    bestScore: 0,
    attemptCount: 1,
    questionsAnswered: 0,
    questionsCorrect: 0,
    wordsLookedUp: 0,
    paragraphTranslationsRevealed: 0,
    hintsUsed: 0,
    productionCompleted: false,
  };
}

export function scoreQuestion(
  question: Question,
  userAnswer: string | string[],
  lessonLevel?: string,
): boolean {
  if (question.type === 'short-response' || question.type === 'summary') {
    const minLen = lessonLevel?.startsWith('A1') ? 5 : 10;
    return (
      userAnswer.length > 0 &&
      (Array.isArray(userAnswer)
        ? userAnswer[0].trim().length >= minLen
        : userAnswer.trim().length >= minLen)
    );
  }
  return answersMatch(userAnswer, question.correctAnswer);
}

export function calculateLessonScore(
  attempts: QuestionAttempt[],
  lessonId: string,
): number {
  const lessonAttempts = attempts.filter((a) => a.lessonId === lessonId);
  if (lessonAttempts.length === 0) return 0;
  const correct = lessonAttempts.filter((a) => a.isCorrect).length;
  return calculatePercentage(correct, lessonAttempts.length);
}

export function isLessonComplete(
  lesson: Lesson,
  progress: LessonProgressRecord,
  attempts: QuestionAttempt[],
): boolean {
  const scorableQuestions = lesson.questions.filter(
    (q) => q.type !== 'short-response' && q.type !== 'summary',
  );
  const lessonAttempts = attempts.filter((a) => a.lessonId === lesson.id);
  const answeredIds = new Set(lessonAttempts.map((a) => a.questionId));
  const allScorableAnswered = scorableQuestions.every((q) => answeredIds.has(q.id));
  const score = calculateLessonScore(attempts, lesson.id);
  const meetsScore = score >= lesson.completionRequirements.minCorrectPercentage;
  const productionDone = !lesson.completionRequirements.requireProduction || progress.productionCompleted;
  return allScorableAnswered && meetsScore && productionDone;
}

export function getStageProgress(stage: string): number {
  const stages = ['preview', 'reading', 'comprehension', 'vocabulary', 'grammar', 'production', 'complete'];
  const index = stages.indexOf(stage);
  if (index < 0) return 0;
  return Math.round((index / (stages.length - 1)) * 100);
}

export function getQuestionsForStage(lesson: Lesson, stage: string): Question[] {
  return lesson.questions.filter((q) => q.stage === stage);
}
