import type { SkillTag, MasteryLabel, QuestionAttempt, SkillMasteryRecord } from '../types';
import { SKILL_LABELS } from '../constants';
import { calculatePercentage, clamp } from './helpers';

const ALL_SKILLS: SkillTag[] = [
  'explicit-information',
  'main-idea',
  'inference',
  'cause-and-effect',
  'chronology',
  'tone',
  'motivation',
  'evidence-selection',
  'vocabulary-in-context',
  'grammar-recognition',
  'written-summary',
  'written-opinion',
];

export function getMasteryLabel(score: number): MasteryLabel {
  if (score < 40) return 'needs-work';
  if (score < 60) return 'developing';
  if (score < 80) return 'solid';
  return 'strong';
}

function getRecencyWeight(attemptedAt: string): number {
  const daysAgo = (Date.now() - new Date(attemptedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysAgo <= 1) return 1.0;
  if (daysAgo <= 7) return 0.85;
  if (daysAgo <= 30) return 0.65;
  return 0.45;
}

export function calculateSkillMastery(attempts: QuestionAttempt[]): SkillMasteryRecord[] {
  return ALL_SKILLS.map((skill) => {
    const skillAttempts = attempts.filter((a) => a.skillTags.includes(skill));

    if (skillAttempts.length === 0) {
      return {
        skill,
        masteryScore: 0,
        masteryLabel: 'needs-work' as MasteryLabel,
        totalAttempts: 0,
        correctAttempts: 0,
        recentAccuracy: 0,
        trend: 'insufficient-data' as const,
        lastAttemptedAt: undefined,
      };
    }

    let weightedScore = 0;
    let totalWeight = 0;
    let recentCorrect = 0;
    const recent = skillAttempts.slice(-20);

    for (const attempt of skillAttempts) {
      const weight = getRecencyWeight(attempt.attemptedAt);
      let attemptScore = attempt.isCorrect ? 100 : 0;
      if (attempt.usedHint) attemptScore *= 0.7;
      weightedScore += attemptScore * weight;
      totalWeight += weight;
    }

    for (const attempt of recent) {
      if (attempt.isCorrect) recentCorrect++;
    }

    const masteryScore = clamp(Math.round(weightedScore / totalWeight), 0, 100);
    const recentAccuracy = calculatePercentage(recentCorrect, recent.length);

    const olderHalf = skillAttempts.slice(0, Math.floor(skillAttempts.length / 2));
    const newerHalf = skillAttempts.slice(Math.floor(skillAttempts.length / 2));
    const olderAcc =
      olderHalf.length > 0
        ? olderHalf.filter((a) => a.isCorrect).length / olderHalf.length
        : 0;
    const newerAcc =
      newerHalf.length > 0
        ? newerHalf.filter((a) => a.isCorrect).length / newerHalf.length
        : 0;

    let trend: SkillMasteryRecord['trend'] = 'insufficient-data';
    if (skillAttempts.length >= 4) {
      if (newerAcc > olderAcc + 0.1) trend = 'improving';
      else if (newerAcc < olderAcc - 0.1) trend = 'declining';
      else trend = 'stable';
    }

    return {
      skill,
      masteryScore,
      masteryLabel: getMasteryLabel(masteryScore),
      totalAttempts: skillAttempts.length,
      correctAttempts: skillAttempts.filter((a) => a.isCorrect).length,
      recentAccuracy,
      lastAttemptedAt: skillAttempts[skillAttempts.length - 1]?.attemptedAt,
      trend,
    };
  });
}

export function getWeakAreas(mastery: SkillMasteryRecord[]): string[] {
  return mastery
    .filter((m) => m.totalAttempts >= 3 && m.masteryLabel === 'needs-work')
    .map((m) => SKILL_LABELS[m.skill]);
}

export function getImprovementMessage(
  attempts: QuestionAttempt[],
  skill: SkillTag,
): string | null {
  const skillAttempts = attempts.filter((a) => a.skillTags.includes(skill));
  if (skillAttempts.length < 10) return null;

  const firstHalf = skillAttempts.slice(0, Math.floor(skillAttempts.length / 2));
  const secondHalf = skillAttempts.slice(Math.floor(skillAttempts.length / 2));

  const firstAcc = calculatePercentage(
    firstHalf.filter((a) => a.isCorrect).length,
    firstHalf.length,
  );
  const secondAcc = calculatePercentage(
    secondHalf.filter((a) => a.isCorrect).length,
    secondHalf.length,
  );

  if (secondAcc > firstAcc + 5) {
    return `Your ${SKILL_LABELS[skill].toLowerCase()} accuracy improved from ${firstAcc}% to ${secondAcc}% over your last ${skillAttempts.length} questions.`;
  }
  return null;
}
