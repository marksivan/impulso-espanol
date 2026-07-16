import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLessonById } from '../data/lessons';
import { PassageReader } from '../components/lessons/PassageReader';
import { QuestionEngine } from '../components/lessons/QuestionEngine';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { progressRepository } from '../repositories/progressRepository';
import { reviewRepository } from '../repositories/reviewRepository';
import { useApp } from '../context/AppContext';
import {
  createInitialProgress,
  getQuestionsForStage,
  isLessonComplete,
  calculateLessonScore,
  getStageProgress,
} from '../utilities/lessonCompletion';
import { generateId } from '../utilities/helpers';
import { SKILL_LABELS } from '../constants';

const STAGES = ['preview', 'reading', 'comprehension', 'vocabulary', 'grammar', 'production', 'complete'] as const;

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const lesson = lessonId ? getLessonById(lessonId) : undefined;
  const { settings, refreshData } = useApp();

  const existingProgress = lesson
    ? progressRepository.getProgressForLesson(lesson.id)
    : null;

  const [stage, setStage] = useState<(typeof STAGES)[number]>(
    (existingProgress?.currentStage as (typeof STAGES)[number]) ?? 'preview',
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showPassageReview, setShowPassageReview] = useState(false);

  const startLesson = useCallback(() => {
    if (!lesson) return;
    const progress = existingProgress ?? createInitialProgress(lesson);
    progressRepository.saveLessonProgress({
      ...progress,
      currentStage: 'reading',
      lastAccessedAt: new Date().toISOString(),
    });
    setStage('reading');
    refreshData();
  }, [lesson, existingProgress, refreshData]);

  if (!lesson) {
    return (
      <EmptyState
        title="Lesson not found"
        description="This lesson does not exist or may have been removed."
        action={
          <Link to="/learn">
            <Button>Browse lessons</Button>
          </Link>
        }
      />
    );
  }

  const stageQuestions = getQuestionsForStage(lesson, stage);
  const currentQuestion = stageQuestions[questionIndex];
  const progress = progressRepository.getProgressForLesson(lesson.id);
  const attempts = progressRepository.getQuestionAttempts().filter((a) => a.lessonId === lesson.id);

  function handleAnswer(answer: string | string[], isCorrect: boolean, usedHint: boolean) {
    const q = currentQuestion;
    if (!q) return;

    progressRepository.saveQuestionAttempt({
      id: generateId('attempt'),
      lessonId: lesson!.id,
      questionId: q.id,
      userAnswer: answer,
      isCorrect,
      usedHint,
      usedTranslation: false,
      skillTags: q.skillTags,
      grammarTags: q.grammarTags,
      vocabularyTags: q.vocabularyTags,
      attemptedAt: new Date().toISOString(),
    });

    if (progress) {
      const updated = {
        ...progress,
        questionsAnswered: progress.questionsAnswered + 1,
        questionsCorrect: progress.questionsCorrect + (isCorrect ? 1 : 0),
        hintsUsed: progress.hintsUsed + (usedHint ? 1 : 0),
        bestScore: Math.max(progress.bestScore, calculateLessonScore(
          [...attempts, { isCorrect } as import('../types').QuestionAttempt],
          lesson!.id,
        )),
        progressPercentage: getStageProgress(stage),
        currentStage: stage,
        lastAccessedAt: new Date().toISOString(),
      };
      progressRepository.saveLessonProgress(updated);
    }
    refreshData();
  }

  function handleSaveMistake(answer: string | string[]) {
    const q = currentQuestion;
    if (!q) return;
    reviewRepository.saveMistake({
      questionId: q.id,
      lessonId: lesson!.id,
      lessonTitle: lesson!.title,
      level: lesson!.level,
      prompt: q.prompt,
      userAnswer: answer,
      correctAnswer: q.correctAnswer ?? '',
      explanation: q.explanation,
      skillTags: q.skillTags,
      grammarTags: q.grammarTags,
      vocabularyTags: q.vocabularyTags,
      attemptedAt: new Date().toISOString(),
    });
    refreshData();
  }

  function nextQuestion() {
    if (questionIndex < stageQuestions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      advanceStage();
    }
  }

  function advanceStage() {
    const idx = STAGES.indexOf(stage);
    if (idx < STAGES.length - 1) {
      const next = STAGES[idx + 1];
      setStage(next);
      setQuestionIndex(0);
      if (progress) {
        progressRepository.saveLessonProgress({
          ...progress,
          currentStage: next,
          progressPercentage: getStageProgress(next),
          lastAccessedAt: new Date().toISOString(),
        });
      }
      if (next === 'complete') finishLesson();
    }
  }

  function finishLesson() {
    if (!progress) return;
    const allAttempts = progressRepository.getQuestionAttempts().filter((a) => a.lessonId === lesson!.id);
    const completed = {
      ...progress,
      productionCompleted: true,
      completedAt: new Date().toISOString(),
      progressPercentage: 100,
      bestScore: calculateLessonScore(allAttempts, lesson!.id),
    };
    if (isLessonComplete(lesson!, completed, allAttempts)) {
      progressRepository.completeLesson(completed);
    } else {
      progressRepository.saveLessonProgress(completed);
    }
    refreshData();
  }

  function handleProductionComplete(_answer: string | string[], _correct: boolean, _hint: boolean) {
    if (progress) {
      progressRepository.saveLessonProgress({
        ...progress,
        productionCompleted: true,
        lastAccessedAt: new Date().toISOString(),
      });
    }
    setStage('complete');
    finishLesson();
    refreshData();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 items-center">
        <Badge variant="level">{lesson.level}</Badge>
        <Badge>{lesson.topic}</Badge>
        <span className="text-sm text-[var(--color-text-muted)]">
          Stage: {stage} · {progress?.progressPercentage ?? 0}%
        </span>
      </div>

      <h1 className="text-2xl font-bold m-0">{lesson.title}</h1>

      {stage === 'preview' && (
        <div className="space-y-4">
          {lesson.subtitle && (
            <p className="text-[var(--color-text-muted)]">{lesson.subtitle}</p>
          )}
          <p>~{lesson.estimatedMinutes} minutes · {lesson.passage.wordCount} words</p>
          <div>
            <p className="font-medium mb-2">Skills tested:</p>
            <div className="flex flex-wrap gap-2">
              {lesson.skillsTested.map((s) => (
                <Badge key={s}>{SKILL_LABELS[s]}</Badge>
              ))}
            </div>
          </div>
          {lesson.targetVocabulary.length > 0 && (
            <div>
              <p className="font-medium mb-2">Preview vocabulary:</p>
              <ul className="text-sm list-disc pl-5">
                {lesson.targetVocabulary.slice(0, 4).map((v) => (
                  <li key={v.id}>
                    {v.term} — {v.translation}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Button onClick={startLesson}>Begin reading</Button>
        </div>
      )}

      {stage === 'reading' && (
        <div className="space-y-4">
          <PassageReader lesson={lesson} />
          <Button onClick={() => { setStage('comprehension'); setQuestionIndex(0); }}>
            Continue to comprehension
          </Button>
        </div>
      )}

      {['comprehension', 'vocabulary', 'grammar', 'production'].includes(stage) && (
        <div className="space-y-4">
          {stage !== 'comprehension' && (
            <Button variant="ghost" size="sm" onClick={() => setShowPassageReview(true)}>
              Review passage
            </Button>
          )}
          {currentQuestion ? (
            <>
              <p className="text-sm text-[var(--color-text-muted)]">
                Question {questionIndex + 1} of {stageQuestions.length}
              </p>
              <QuestionEngine
                key={currentQuestion.id}
                question={currentQuestion}
                lessonLevel={lesson.level}
                onAnswer={
                  stage === 'production' ? handleProductionComplete : (a, c, h) => {
                    handleAnswer(a, c, h);
                  }
                }
                onSaveMistake={handleSaveMistake}
                onReviewPassage={() => setShowPassageReview(true)}
                challengeMode={settings.challengeMode}
                showExplanationsImmediately={settings.showExplanationsImmediately}
                autoAdvance={settings.autoAdvanceAfterCorrect}
              />
              {stage !== 'production' && (
                <Button variant="ghost" onClick={nextQuestion}>
                  Next question
                </Button>
              )}
            </>
          ) : (
            <Button onClick={advanceStage}>Continue to next stage</Button>
          )}
        </div>
      )}

      <Modal
        isOpen={showPassageReview}
        onClose={() => setShowPassageReview(false)}
        title={lesson.passage.title}
        cancelLabel="Back to questions"
        size="lg"
      >
        <PassageReader lesson={lesson} />
      </Modal>

      {stage === 'complete' && (
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Lesson complete</h2>
          <p className="text-[var(--color-text-muted)] mb-4">
            Score: {progress?.bestScore ?? calculateLessonScore(attempts, lesson.id)}%
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/learn">
              <Button variant="ghost">Back to lessons</Button>
            </Link>
            <Link to="/">
              <Button>Dashboard</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
