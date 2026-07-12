import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PLACEMENT_QUESTIONS, evaluatePlacement } from '../data/placement';
import { progressRepository } from '../repositories/progressRepository';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LEVELS } from '../data/levels';
import { useApp } from '../context/AppContext';
import { generateId } from '../utilities/helpers';
import type { LevelId } from '../types';

export function PlacementPage() {
  const navigate = useNavigate();
  const { refreshData } = useApp();
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState('');
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof evaluatePlacement> | null>(null);
  const [overrideLevel, setOverrideLevel] = useState<LevelId | null>(null);

  const question = PLACEMENT_QUESTIONS[currentIndex];
  const total = PLACEMENT_QUESTIONS.length;

  function handleAnswer() {
    if (!selected || !question) return;
    const newAnswers = { ...answers, [question.id]: selected };
    setAnswers(newAnswers);
    setSelected('');

    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const evalResult = evaluatePlacement(newAnswers);
      setResult(evalResult);
      setFinished(true);
    }
  }

  function acceptRecommendation() {
    if (!result) return;
    progressRepository.savePlacementResult({
      id: generateId('placement'),
      recommendedLevel: result.recommendedLevel,
      readingScore: result.readingScore,
      vocabularyScore: result.vocabularyScore,
      grammarScore: result.grammarScore,
      inferenceScore: result.inferenceScore,
      explanation: result.explanation,
      completedAt: new Date().toISOString(),
      acceptedRecommendation: !overrideLevel,
      overrideLevel: overrideLevel ?? undefined,
    });
    if (overrideLevel) {
      progressRepository.updateProfile({ currentLevel: overrideLevel });
    }
    refreshData();
    navigate('/');
  }

  function skipPlacement() {
    navigate('/learn');
  }

  if (!started) {
    return (
      <div className="space-y-6 max-w-xl mx-auto">
        <header className="text-center">
          <h1 className="text-2xl font-bold m-0">Placement Assessment</h1>
          <p className="text-[var(--color-text-muted)] mt-2">
            Find your ideal starting level with {total} questions covering reading, vocabulary,
            grammar, and inference.
          </p>
        </header>
        <Card>
          <p className="text-sm mb-4">
            The test adapts based on your performance. You can also skip and choose a level
            manually.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => setStarted(true)}>Begin assessment</Button>
            <Button variant="ghost" onClick={skipPlacement}>
              Skip and browse lessons
            </Button>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Or choose a starting level:</p>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((l) => (
                <Button
                  key={l.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    progressRepository.updateProfile({
                      currentLevel: l.id,
                      placementCompleted: true,
                    });
                    refreshData();
                    navigate('/learn');
                  }}
                >
                  {l.id}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (finished && result) {
    return (
      <div className="space-y-6 max-w-xl mx-auto">
        <header className="text-center">
          <h1 className="text-2xl font-bold m-0">Your results</h1>
        </header>
        <Card>
          <p className="text-xl font-semibold text-[var(--color-primary)] mb-4">
            Recommended: {overrideLevel ?? result.recommendedLevel}
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <p>Reading: {result.readingScore}%</p>
            <p>Vocabulary: {result.vocabularyScore}%</p>
            <p>Grammar: {result.grammarScore}%</p>
            <p>Inference: {result.inferenceScore}%</p>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">{result.explanation}</p>

          <label className="block mb-4">
            <span className="text-sm font-medium">Override level (optional)</span>
            <select
              className="w-full mt-1 p-2 border border-[var(--color-border)] rounded-lg"
              value={overrideLevel ?? ''}
              onChange={(e) =>
                setOverrideLevel(e.target.value ? (e.target.value as LevelId) : null)
              }
            >
              <option value="">Accept recommendation</option>
              {LEVELS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.id} — {l.name}
                </option>
              ))}
            </select>
          </label>

          <Button onClick={acceptRecommendation}>Continue to dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="flex justify-between items-center">
        <Badge>
          Question {currentIndex + 1} of {total}
        </Badge>
        <Badge variant="level">{question.level}</Badge>
      </div>

      {question.passage && (
        <Card>
          <p className="font-reading leading-relaxed m-0">{question.passage}</p>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-medium m-0 mb-4">{question.prompt}</h2>

        {question.type === 'fill-gap' ? (
          <input
            className="w-full p-3 border border-[var(--color-border)] rounded-xl"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            placeholder="Type your answer..."
          />
        ) : (
          <fieldset>
            <legend className="sr-only">Answer choices</legend>
            <div className="space-y-2">
              {question.choices?.map((c) => (
                <label
                  key={c.id}
                  className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer ${
                    selected === c.id
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                      : 'border-[var(--color-border)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="placement-answer"
                    value={c.id}
                    checked={selected === c.id}
                    onChange={() => setSelected(c.id)}
                  />
                  {c.text}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <Button className="mt-4" onClick={handleAnswer} disabled={!selected}>
          {currentIndex < total - 1 ? 'Next' : 'Finish'}
        </Button>
      </Card>

      <Link to="/" className="text-sm text-[var(--color-text-muted)]">
        Exit assessment
      </Link>
    </div>
  );
}
