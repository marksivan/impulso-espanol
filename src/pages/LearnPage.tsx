import { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ALL_LESSONS,
  getRecommendedLesson,
  getFoundationReviewLesson,
  getChallengeLesson,
  getLessonCardLabel,
  getLessonCardLabelText,
  sortLessonsForDisplay,
} from '../data/lessons';
import { useProgressData } from '../hooks/useProgressData';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { LEVELS } from '../data/levels';
import { TOPICS } from '../constants';
import { calculateLessonScore } from '../utilities/lessonCompletion';
import { getLevelSelectLabel } from '../utilities/levelUtils';
import type { LevelId } from '../types';

export function LearnPage() {
  const { lessonProgress, attempts, profile } = useProgressData();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const level = searchParams.get('level');
    if (level) setLevelFilter(level);
  }, [searchParams]);

  const progressMap = useMemo(
    () => new Map(lessonProgress.map((p) => [p.lessonId, p])),
    [lessonProgress],
  );

  const completedIds = useMemo(
    () => new Set(lessonProgress.filter((p) => p.completedAt).map((p) => p.lessonId)),
    [lessonProgress],
  );

  const recommended = getRecommendedLesson(profile.currentLevel, completedIds, lessonProgress);
  const foundation = getFoundationReviewLesson(profile.currentLevel, completedIds);
  const challenge = getChallengeLesson(
    profile.currentLevel,
    completedIds,
    lessonProgress,
    attempts,
  );

  const filtered = useMemo(() => {
    const base = ALL_LESSONS.filter((lesson) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !lesson.title.toLowerCase().includes(q) &&
          !lesson.topic.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (levelFilter && lesson.level !== levelFilter) return false;
      if (topicFilter && lesson.topic !== topicFilter) return false;
      if (statusFilter === 'completed' && !progressMap.get(lesson.id)?.completedAt) {
        return false;
      }
      if (statusFilter === 'incomplete' && progressMap.get(lesson.id)?.completedAt) {
        return false;
      }
      return true;
    });
    return levelFilter ? base : sortLessonsForDisplay(base, profile.currentLevel);
  }, [search, levelFilter, topicFilter, statusFilter, progressMap, profile.currentLevel]);

  const pathItems = [
    recommended && { lesson: recommended, label: `Continue ${profile.currentLevel}` },
    foundation && { lesson: foundation, label: `Review ${foundation.level} foundations` },
    challenge && { lesson: challenge, label: `Preview ${challenge.level} challenge` },
  ].filter(Boolean) as { lesson: (typeof ALL_LESSONS)[0]; label: string }[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold m-0">Learn</h1>
        <p className="text-[var(--color-text-muted)] m-0 mt-1">
          Browse lessons by level, topic, and skill focus.
        </p>
      </header>

      {pathItems.length > 0 && !levelFilter && (
        <Card title="Recommended path">
          <div className="space-y-2">
            {pathItems.map(({ lesson, label }, i) => (
              <div
                key={lesson.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-[var(--color-border)] last:border-0"
              >
                <div className="min-w-0">
                  <span className="text-xs text-[var(--color-text-muted)]">{i + 1}.</span>{' '}
                  <span className="font-medium">{label}</span>
                  <span className="text-sm text-[var(--color-text-muted)] ml-2">
                    — {lesson.title}
                  </span>
                </div>
                <Link to={`/lesson/${lesson.id}`}>
                  <Button size="sm">Open</Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by title or topic..."
          className="flex-1 min-w-[200px] p-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search lessons"
        />
        <select
          className="p-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)]"
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          aria-label="Filter by level"
        >
          <option value="">All levels</option>
          {LEVELS.map((l) => (
            <option key={l.id} value={l.id}>
              {getLevelSelectLabel(l.id as LevelId)}
            </option>
          ))}
        </select>
        <select
          className="p-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)]"
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          aria-label="Filter by topic"
        >
          <option value="">All topics</option>
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className="p-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All</option>
          <option value="completed">Completed</option>
          <option value="incomplete">Incomplete</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No lessons found"
          description="Try adjusting your filters or search term."
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map((lesson) => {
            const progress = progressMap.get(lesson.id);
            const score = calculateLessonScore(attempts, lesson.id);
            const cardLabel = getLessonCardLabel(
              lesson,
              profile.currentLevel,
              recommended?.id,
              foundation?.id,
              challenge?.id,
              progress,
            );
            return (
              <Card key={lesson.id}>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="level">{lesson.level}</Badge>
                  <Badge>{lesson.topic}</Badge>
                  {cardLabel && (
                    <Badge
                      variant={
                        cardLabel === 'completed'
                          ? 'success'
                          : cardLabel === 'recommended'
                            ? 'level'
                            : 'default'
                      }
                    >
                      {getLessonCardLabelText(cardLabel)}
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-semibold m-0 mb-1">{lesson.title}</h3>
                {lesson.subtitle && (
                  <p className="text-sm text-[var(--color-text-muted)] m-0 mb-2">
                    {lesson.subtitle}
                  </p>
                )}
                <p className="text-sm text-[var(--color-text-muted)] mb-3">
                  {lesson.passage.wordCount} words · ~{lesson.estimatedMinutes} min ·{' '}
                  {lesson.questions.length} questions
                  {progress && ` · Best: ${Math.max(score, progress.bestScore)}%`}
                  {progress && ` · Attempts: ${progress.attemptCount}`}
                </p>
                <Link to={`/lesson/${lesson.id}`}>
                  <Button size="sm">
                    {progress ? (progress.completedAt ? 'Review' : 'Resume') : 'Start'}
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
