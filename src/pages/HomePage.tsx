import { Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useProgressData } from '../hooks/useProgressData';
import { SKILL_LABELS, MASTERY_LABELS } from '../constants';
import { getLevelInfo } from '../data/levels';

export function HomePage() {
  const {
    profile,
    recommended,
    weeklyStats,
    skillMastery,
    dueVocab,
    dueMistakes,
    recentActivity,
    levelDisplay,
    lessonProgress,
    improvements,
  } = useProgressData();

  const levelInfo = getLevelInfo(profile.currentLevel);
  const continueProgress = recommended
    ? lessonProgress.find((p) => p.lessonId === recommended.id)
    : null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold m-0">Welcome back</h1>
        <p className="text-[var(--color-text-muted)] m-0 mt-1">
          What should you work on today?
        </p>
      </header>

      {!profile.placementCompleted && (
        <Card className="border-[var(--color-accent)]">
          <p className="m-0 mb-3">
            Take the placement assessment to find your ideal starting level.
          </p>
          <Link to="/placement">
            <Button>Start placement test</Button>
          </Link>
        </Card>
      )}

      {recommended && (
        <Card title="Continue learning">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="level">{recommended.level}</Badge>
            <Badge>{recommended.topic}</Badge>
          </div>
          <h3 className="text-xl font-semibold m-0 mb-2">{recommended.title}</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            ~{recommended.estimatedMinutes} min · {recommended.passage.wordCount} words
            {continueProgress && ` · ${continueProgress.progressPercentage}% complete`}
          </p>
          <Link to={`/lesson/${recommended.id}`}>
            <Button>{continueProgress ? 'Resume lesson' : 'Start lesson'}</Button>
          </Link>
        </Card>
      )}

      <Card title="Daily challenge">
        <p className="text-sm mb-3">
          {dueMistakes.length > 0
            ? `Review ${dueMistakes.length} mistake${dueMistakes.length > 1 ? 's' : ''} from your notebook.`
            : dueVocab.length > 0
              ? `Practice ${dueVocab.length} vocabulary item${dueVocab.length > 1 ? 's' : ''} due for review.`
              : 'Complete a lesson at your current level to build momentum.'}
        </p>
        <Link to={dueMistakes.length > 0 ? '/review' : dueVocab.length > 0 ? '/vocabulary' : '/learn'}>
          <Button variant="secondary">Start challenge</Button>
        </Link>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Current level">
          <p className="text-xl font-semibold text-[var(--color-primary)] m-0 mb-2">
            {levelDisplay}
          </p>
          {levelInfo && (
            <p className="text-sm text-[var(--color-text-muted)] m-0">{levelInfo.description}</p>
          )}
          <p className="text-xs text-[var(--color-text-muted)] mt-3">
            {profile.studyDays.length} study day{profile.studyDays.length !== 1 ? 's' : ''} recorded
          </p>
        </Card>

        <Card title="Review due">
          <div className="flex gap-6">
            <div>
              <p className="text-2xl font-bold m-0">{dueVocab.length}</p>
              <p className="text-sm text-[var(--color-text-muted)]">Vocabulary</p>
            </div>
            <div>
              <p className="text-2xl font-bold m-0">{dueMistakes.length}</p>
              <p className="text-sm text-[var(--color-text-muted)]">Mistakes</p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Weekly progress">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-2xl font-bold m-0">{weeklyStats.lessonsCompleted}</p>
            <p className="text-[var(--color-text-muted)]">Lessons completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold m-0">{weeklyStats.questionsAnswered}</p>
            <p className="text-[var(--color-text-muted)]">Questions answered</p>
          </div>
          <div>
            <p className="text-2xl font-bold m-0">{weeklyStats.accuracy}%</p>
            <p className="text-[var(--color-text-muted)]">Accuracy</p>
          </div>
          <div>
            <p className="text-2xl font-bold m-0">{weeklyStats.wordsSaved}</p>
            <p className="text-[var(--color-text-muted)]">Words saved</p>
          </div>
          <div>
            <p className="text-2xl font-bold m-0">{weeklyStats.vocabularyReviewsCompleted}</p>
            <p className="text-[var(--color-text-muted)]">Vocab reviews</p>
          </div>
          <div>
            <p className="text-2xl font-bold m-0">{weeklyStats.minutesStudied}</p>
            <p className="text-[var(--color-text-muted)]">Minutes studied</p>
          </div>
        </div>
      </Card>

      <Card title="Skill snapshot">
        <div className="grid sm:grid-cols-2 gap-3">
          {skillMastery
            .filter((s) => s.totalAttempts > 0)
            .slice(0, 8)
            .map((s) => (
              <div key={s.skill} className="flex justify-between items-center text-sm py-1">
                <span>{SKILL_LABELS[s.skill]}</span>
                <Badge
                  variant={
                    s.masteryLabel === 'strong' || s.masteryLabel === 'solid'
                      ? 'success'
                      : s.masteryLabel === 'needs-work'
                        ? 'warning'
                        : 'default'
                  }
                >
                  {MASTERY_LABELS[s.masteryLabel]}
                </Badge>
              </div>
            ))}
          {skillMastery.every((s) => s.totalAttempts === 0) && (
            <p className="text-sm text-[var(--color-text-muted)] col-span-2">
              Complete lessons to see your skill profile.
            </p>
          )}
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

      {recentActivity.length > 0 && (
        <Card title="Recent activity">
          <ul className="space-y-2 m-0 p-0 list-none">
            {recentActivity.map((item, i) => (
              <li key={i} className="text-sm flex justify-between">
                <span>
                  {item.type === 'lesson' ? '📖' : '🔄'} {item.title}
                </span>
                <span className="text-[var(--color-text-muted)]">
                  {new Date(item.date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
