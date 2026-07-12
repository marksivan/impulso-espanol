import { useProgressData } from '../hooks/useProgressData';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { SKILL_LABELS, MASTERY_LABELS } from '../constants';
import { LEVELS } from '../data/levels';
import { ALL_LESSONS } from '../data/lessons';
import { getWeakAreas } from '../utilities/skillMastery';

export function ProgressPage() {
  const {
    skillMastery,
    lessonProgress,
    vocabulary,
    overallAccuracy,
    totalLessonsCompleted,
    totalQuestions,
    independence,
    improvements,
    levelDisplay,
  } = useProgressData();

  const weakAreas = getWeakAreas(skillMastery);
  const reviewHistory = vocabulary.filter((v) => v.reviewCount > 0).length;

  const levelStats = LEVELS.map((level) => {
    const lessons = ALL_LESSONS.filter((l) => l.level === level.id);
    const completed = lessonProgress.filter(
      (p) => p.completedAt && lessons.some((l) => l.id === p.lessonId),
    );
    return {
      level: level.id,
      total: lessons.length,
      completed: completed.length,
      avgScore:
        completed.length > 0
          ? Math.round(completed.reduce((s, p) => s + p.bestScore, 0) / completed.length)
          : 0,
    };
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold m-0">Progress</h1>
        <p className="text-[var(--color-text-muted)] m-0 mt-1">
          Track your skill development over time.
        </p>
      </header>

      <Card title="Overall summary">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-[var(--color-text-muted)]">Current level</p>
            <p className="text-lg font-semibold m-0">{levelDisplay}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)]">Lessons completed</p>
            <p className="text-lg font-semibold m-0">{totalLessonsCompleted}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)]">Questions answered</p>
            <p className="text-lg font-semibold m-0">{totalQuestions}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)]">Overall accuracy</p>
            <p className="text-lg font-semibold m-0">{overallAccuracy}%</p>
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)]">Saved vocabulary</p>
            <p className="text-lg font-semibold m-0">{vocabulary.length}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)]">Vocabulary reviewed</p>
            <p className="text-lg font-semibold m-0">{reviewHistory}</p>
          </div>
        </div>
      </Card>

      <Card title="Skill mastery">
        <div className="space-y-3">
          {skillMastery
            .filter((s) => s.totalAttempts > 0)
            .map((s) => (
              <div key={s.skill} className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-[var(--color-border)] last:border-0">
                <div>
                  <p className="font-medium m-0">{SKILL_LABELS[s.skill]}</p>
                  <p className="text-xs text-[var(--color-text-muted)] m-0">
                    {s.totalAttempts} attempts · {s.recentAccuracy}% recent ·{' '}
                    {s.trend !== 'insufficient-data' ? s.trend : 'building data'}
                  </p>
                </div>
                <Badge
                  variant={
                    s.masteryLabel === 'strong' || s.masteryLabel === 'solid' ? 'success' : 'default'
                  }
                >
                  {MASTERY_LABELS[s.masteryLabel]}
                </Badge>
              </div>
            ))}
          {skillMastery.every((s) => s.totalAttempts === 0) && (
            <p className="text-sm text-[var(--color-text-muted)]">
              Complete lessons to build your skill profile.
            </p>
          )}
        </div>
      </Card>

      <Card title="Level progress">
        <div className="space-y-3">
          {levelStats.map((ls) => (
            <div key={ls.level} className="flex items-center gap-4">
              <span className="w-12 font-medium">{ls.level}</span>
              <div className="flex-1 h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-accent)] rounded-full"
                  style={{ width: `${ls.total ? (ls.completed / ls.total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-sm text-[var(--color-text-muted)] w-24 text-right">
                {ls.completed}/{ls.total}
                {ls.avgScore > 0 && ` · ${ls.avgScore}%`}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Independence">
        <p className="text-sm text-[var(--color-text-muted)] mb-3">
          Support usage should gradually decrease as you build confidence.
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <p>Passages without full translation: {independence.passagesWithoutFullTranslation}</p>
          <p>Questions without hints: {independence.questionsWithoutHints}</p>
          <p>Words looked up: {independence.wordsLookedUp}</p>
          <p>Paragraph translations revealed: {independence.paragraphTranslationsRevealed}</p>
          <p>Written responses completed: {independence.writtenResponsesCompleted}</p>
        </div>
      </Card>

      {improvements.length > 0 && (
        <Card title="Recent improvement">
          {improvements.map((msg, i) => (
            <p key={i} className="text-sm m-0 mb-2">{msg}</p>
          ))}
        </Card>
      )}

      {weakAreas.length > 0 && (
        <Card title="Weak areas">
          <p className="text-sm m-0">
            You are performing well in some areas but need more practice with:{' '}
            {weakAreas.join(', ')}.
          </p>
        </Card>
      )}
    </div>
  );
}
