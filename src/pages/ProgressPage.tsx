import { useProgressData } from '../hooks/useProgressData';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { SKILL_LABELS, MASTERY_LABELS } from '../constants';
import { getLevelInfo } from '../data/levels';
import { getLevelStats, calculateLevelReadiness, getReadinessLabel } from '../utilities/levelReadiness';
import { getNextLevel } from '../utilities/levelUtils';
import { getLevelDisplay } from '../data/levels';

export function ProgressPage() {
  const {
    profile,
    skillMastery,
    lessonProgress,
    vocabulary,
    overallAccuracy,
    totalLessonsCompleted,
    totalQuestions,
    improvements,
    attempts,
  } = useProgressData();

  const levelStats = getLevelStats(lessonProgress, attempts);
  const readiness = calculateLevelReadiness(profile.currentLevel, lessonProgress, attempts);
  const nextLevel = getNextLevel(profile.currentLevel);
  const levelInfo = getLevelInfo(profile.currentLevel);
  const currentLevelStats = levelStats.find((s) => s.level === profile.currentLevel);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold m-0">Progress</h1>
        <p className="text-[var(--color-text-muted)] m-0 mt-1">
          Track your skill development over time.
        </p>
      </header>

      <Card title="Current level summary">
        <p className="text-xl font-semibold text-[var(--color-primary)] m-0 mb-1">
          {getLevelDisplay(profile.currentLevel)}
        </p>
        {levelInfo && (
          <p className="text-sm text-[var(--color-text-muted)] mb-3">
            {levelInfo.whatThisMeans ?? levelInfo.description}
          </p>
        )}
        {nextLevel && (
          <p className="text-sm mb-2">
            <strong>{getReadinessLabel(profile.currentLevel)}:</strong>{' '}
            {readiness !== null
              ? `${readiness}%`
              : `Complete more ${profile.currentLevel} lessons to estimate readiness.`}
          </p>
        )}
        {currentLevelStats && (
          <p className="text-sm text-[var(--color-text-muted)] m-0">
            {profile.currentLevel} lessons completed: {currentLevelStats.completed} of{' '}
            {currentLevelStats.total}
          </p>
        )}
      </Card>

      <Card title="Overall summary">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
        </div>
      </Card>

      <Card title="Level statistics">
        <div className="space-y-3">
          {levelStats.map((ls) => {
            const isCurrent = ls.level === profile.currentLevel;
            const statusLabel =
              ls.status === 'completed'
                ? 'Completed'
                : isCurrent
                  ? 'Current'
                  : ls.status === 'in-progress'
                    ? 'In progress'
                    : 'Not started';
            return (
              <div key={ls.level} className="flex flex-wrap items-center gap-3 py-2 border-b border-[var(--color-border)] last:border-0">
                <span className="w-12 font-medium">{ls.level}</span>
                <div className="flex-1 min-w-[120px] h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-accent)] rounded-full"
                    style={{
                      width: `${ls.total ? (ls.completed / ls.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-[var(--color-text-muted)] w-28 text-right">
                  {ls.completed}/{ls.total}
                  {ls.avgScore > 0 && ` · ${ls.avgScore}%`}
                </span>
                <Badge variant={isCurrent ? 'level' : ls.status === 'completed' ? 'success' : 'default'}>
                  {statusLabel}
                </Badge>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Skill mastery">
        <div className="space-y-3">
          {skillMastery.map((s) => (
            <div
              key={s.skill}
              className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-[var(--color-border)] last:border-0"
            >
              <div>
                <p className="font-medium m-0">{SKILL_LABELS[s.skill]}</p>
                {s.totalAttempts > 0 ? (
                  <p className="text-xs text-[var(--color-text-muted)] m-0">
                    {s.totalAttempts} attempts · {s.recentAccuracy}% recent
                  </p>
                ) : (
                  <p className="text-xs text-[var(--color-text-muted)] m-0">Not enough activity yet</p>
                )}
              </div>
              {s.totalAttempts > 0 && (
                <Badge
                  variant={
                    s.masteryLabel === 'strong' || s.masteryLabel === 'solid' ? 'success' : 'default'
                  }
                >
                  {MASTERY_LABELS[s.masteryLabel]}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </Card>

      {improvements.length > 0 && (
        <Card title="Recent improvement">
          {improvements.map((msg, i) => (
            <p key={i} className="text-sm m-0 mb-2">
              {msg}
            </p>
          ))}
        </Card>
      )}
    </div>
  );
}
