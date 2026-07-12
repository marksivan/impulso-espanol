import { useMemo } from 'react';
import { progressRepository } from '../repositories/progressRepository';
import { vocabularyRepository } from '../repositories/vocabularyRepository';
import { reviewRepository } from '../repositories/reviewRepository';
import { translationHistoryRepository } from '../repositories/dataRepository';
import { useApp } from '../context/AppContext';
import { calculatePercentage, isThisWeek } from '../utilities/helpers';
import { getImprovementMessage } from '../utilities/skillMastery';
import { ALL_LESSONS, getRecommendedLesson, getFoundationReviewLesson, getChallengeLesson } from '../data/lessons';
import { getLevelDisplay } from '../data/levels';

export function useProgressData() {
  const { dataVersion } = useApp();

  return useMemo(() => {
    const profile = progressRepository.getProfile();
    const lessonProgress = progressRepository.getLessonProgress();
    const attempts = progressRepository.getQuestionAttempts();
    const skillMastery = progressRepository.getSkillMastery();
    const vocabulary = vocabularyRepository.getAll();
    const dueVocab = vocabularyRepository.getDueReviews();
    const mistakes = reviewRepository.getMistakes();
    const dueMistakes = reviewRepository.getDueMistakes();
    const placement = progressRepository.getPlacementResult();
    const translationHistory = translationHistoryRepository.getHistory();
    const reviewHistory = vocabularyRepository.getReviewHistory();

    const completedIds = new Set(
      lessonProgress.filter((p) => p.completedAt).map((p) => p.lessonId),
    );
    const recommended = getRecommendedLesson(
      profile.currentLevel,
      completedIds,
      lessonProgress,
    );
    const foundationLesson = getFoundationReviewLesson(profile.currentLevel, completedIds);
    const challengeLesson = getChallengeLesson(
      profile.currentLevel,
      completedIds,
      lessonProgress,
      attempts,
    );

    const weekAttempts = attempts.filter((a) => isThisWeek(a.attemptedAt));
    const weekLessons = lessonProgress.filter(
      (p) => p.completedAt && isThisWeek(p.completedAt),
    );
    const weekVocabReviews = reviewHistory.filter((r) => isThisWeek(r.reviewedAt));
    const weekWordsSaved = vocabulary.filter((v) => isThisWeek(v.createdAt));

    const weeklyStats = {
      lessonsCompleted: weekLessons.length,
      questionsAnswered: weekAttempts.length,
      accuracy: calculatePercentage(
        weekAttempts.filter((a) => a.isCorrect).length,
        weekAttempts.length,
      ),
      wordsSaved: weekWordsSaved.length,
      vocabularyReviewsCompleted: weekVocabReviews.length,
      minutesStudied: Math.round(weekAttempts.length * 1.5 + weekLessons.length * 10),
    };

    const totalCorrect = attempts.filter((a) => a.isCorrect).length;
    const overallAccuracy = calculatePercentage(totalCorrect, attempts.length);

    const recentActivity = [
      ...lessonProgress
        .filter((p) => p.completedAt)
        .map((p) => ({
          type: 'lesson' as const,
          title: ALL_LESSONS.find((l) => l.id === p.lessonId)?.title ?? p.lessonId,
          date: p.completedAt!,
        })),
      ...reviewHistory.map((r) => ({
        type: 'review' as const,
        title: vocabulary.find((v) => v.id === r.vocabularyId)?.term ?? 'Vocabulary review',
        date: r.reviewedAt,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const improvements = ['inference', 'main-idea', 'vocabulary-in-context', 'grammar-recognition']
      .map((skill) => getImprovementMessage(attempts, skill as import('../types').SkillTag))
      .filter(Boolean);

    const independence = {
      passagesWithoutFullTranslation: lessonProgress.filter(
        (p) => p.paragraphTranslationsRevealed === 0 && p.completedAt,
      ).length,
      questionsWithoutHints: attempts.filter((a) => !a.usedHint).length,
      wordsLookedUp: lessonProgress.reduce((sum, p) => sum + p.wordsLookedUp, 0),
      paragraphTranslationsRevealed: lessonProgress.reduce(
        (sum, p) => sum + p.paragraphTranslationsRevealed,
        0,
      ),
      writtenResponsesCompleted: lessonProgress.filter((p) => p.productionCompleted).length,
    };

    return {
      profile,
      lessonProgress,
      attempts,
      skillMastery,
      vocabulary,
      dueVocab,
      mistakes,
      dueMistakes,
      placement,
      translationHistory,
      recommended,
      foundationLesson,
      challengeLesson,
      weeklyStats,
      overallAccuracy,
      recentActivity,
      improvements,
      independence,
      levelDisplay: getLevelDisplay(profile.currentLevel),
      totalLessonsCompleted: completedIds.size,
      totalQuestions: attempts.length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataVersion]);
}
