import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  evaluatePlacement,
  getAdaptivePlacementQuestions,
  shouldStopPlacement,
} from '../data/placement';
import { progressRepository } from '../repositories/progressRepository';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LEVELS } from '../data/levels';
import { useApp } from '../context/AppContext';
import { generateId } from '../utilities/helpers';
import { getLevelDisplay } from '../data/levels';
import { getLevelLabel } from '../utilities/levelUtils';
import type { LevelId } from '../types';

type Screen = 'choose' | 'assessment' | 'results';

const MANUAL_OPTIONS = [
  {
    level: 'A1.1' as LevelId,
    title: 'Review the foundations',
    description:
      'I am still learning introductions, basic questions, common verbs, numbers, food, and places.',
    recommended: false,
  },
  {
    level: 'A1.2' as LevelId,
    title: 'Start at early A1',
    description:
      'I understand simple phrases and questions about familiar topics, but longer passages are still difficult.',
    examples: [
      'Nosotros somos de la ciudad.',
      '¿Quién usa pantalones verdes?',
      '¿Puede traer el menú, por favor?',
    ],
    recommended: true,
  },
  {
    level: 'A2.1' as LevelId,
    title: 'Start with elementary passages',
    description: 'I can understand short connected texts and basic descriptions of past events.',
    recommended: false,
  },
];

export function PlacementPage() {
  const navigate = useNavigate();
  const { refreshData } = useApp();
  const [screen, setScreen] = useState<Screen>('choose');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState('');
  const [currentLevel, setCurrentLevel] = useState<LevelId>('A1.1');
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [result, setResult] = useState<ReturnType<typeof evaluatePlacement> | null>(null);
  const [overrideLevel, setOverrideLevel] = useState<LevelId | null>(null);

  const question =
    screen === 'assessment'
      ? getAdaptivePlacementQuestions(
          answeredIds,
          currentLevel,
          consecutiveCorrect,
          consecutiveWrong,
        )
      : null;

  useEffect(() => {
    if (screen === 'assessment' && !question && answeredIds.size > 0) {
      setResult(evaluatePlacement(answers));
      setScreen('results');
    }
  }, [screen, question, answeredIds.size, answers]);

  function selectManualLevel(level: LevelId) {
    progressRepository.updateProfile({
      currentLevel: level,
      placementCompleted: true,
    });
    refreshData();
    navigate('/');
  }

  function startAssessment() {
    setScreen('assessment');
    setAnswers({});
    setAnsweredIds(new Set());
    setCurrentLevel('A1.1');
    setConsecutiveCorrect(0);
    setConsecutiveWrong(0);
    setSelected('');
  }

  function handleAnswer() {
    if (!selected || !question) return;

    const isCorrect =
      selected.toLowerCase() ===
      (typeof question.correctAnswer === 'string' ? question.correctAnswer.toLowerCase() : '');

    const newAnswers = { ...answers, [question.id]: selected };
    const newAnsweredIds = new Set([...answeredIds, question.id]);
    setAnswers(newAnswers);
    setAnsweredIds(newAnsweredIds);
    setSelected('');

    let newConsecutiveCorrect = isCorrect ? consecutiveCorrect + 1 : 0;
    let newConsecutiveWrong = isCorrect ? 0 : consecutiveWrong + 1;
    let newLevel = currentLevel;

    if (isCorrect && newConsecutiveCorrect >= 2) {
      const levels: LevelId[] = ['A1.1', 'A1.2', 'A2.1', 'A2.2', 'B1.1', 'B1.2', 'B2.1', 'B2.2'];
      const idx = levels.indexOf(currentLevel);
      if (idx < levels.length - 1) {
        newLevel = levels[idx + 1];
        newConsecutiveCorrect = 0;
      }
    } else if (!isCorrect && newConsecutiveWrong >= 2) {
      const levels: LevelId[] = ['A1.1', 'A1.2', 'A2.1', 'A2.2', 'B1.1', 'B1.2', 'B2.1', 'B2.2'];
      const idx = levels.indexOf(currentLevel);
      if (idx > 0) newLevel = levels[idx - 1];
    }

    setConsecutiveCorrect(newConsecutiveCorrect);
    setConsecutiveWrong(newConsecutiveWrong);
    setCurrentLevel(newLevel);

    const shouldStop =
      shouldStopPlacement(newAnsweredIds.size, newConsecutiveWrong, newLevel) ||
      !getAdaptivePlacementQuestions(
        newAnsweredIds,
        newLevel,
        newConsecutiveCorrect,
        newConsecutiveWrong,
      );

    if (shouldStop) {
      const evalResult = evaluatePlacement(newAnswers);
      setResult(evalResult);
      setScreen('results');
    }
  }

  function acceptRecommendation() {
    if (!result) return;
    progressRepository.savePlacementResult({
      id: generateId('placement'),
      recommendedLevel: result.recommendedLevel,
      highestLevelConsistent: result.highestLevelConsistent,
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

  if (screen === 'choose') {
    return (
      <div className="space-y-6 max-w-xl mx-auto">
        <header className="text-center">
          <h1 className="text-2xl font-bold m-0">Choose where to begin</h1>
          <p className="text-[var(--color-text-muted)] mt-2">
            You can select a starting point now or take a short assessment.
          </p>
        </header>

        <div className="space-y-3">
          {MANUAL_OPTIONS.map((opt) => (
            <Card key={opt.level} className={opt.recommended ? 'border-[var(--color-accent)]' : ''}>
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <h2 className="text-lg font-semibold m-0">{opt.title}</h2>
                {opt.recommended && <Badge variant="level">Recommended for you</Badge>}
              </div>
              <p className="text-sm text-[var(--color-text-muted)] mb-3">{opt.description}</p>
              {opt.examples && (
                <ul className="text-sm font-reading mb-3 pl-4 list-disc">
                  {opt.examples.map((ex) => (
                    <li key={ex}>{ex}</li>
                  ))}
                </ul>
              )}
              <Button size="sm" onClick={() => selectManualLevel(opt.level)}>
                Start at {opt.level}
              </Button>
            </Card>
          ))}

          <Card>
            <h2 className="text-lg font-semibold m-0 mb-2">Take the placement assessment</h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-3">
              Answer questions across several levels to receive a recommendation. The test adapts
              to your performance and stops when your level is clear.
            </p>
            <Button onClick={startAssessment}>Begin assessment</Button>
          </Card>
        </div>

        <Link to="/learn" className="text-sm text-[var(--color-text-muted)]">
          Skip and browse all lessons
        </Link>
      </div>
    );
  }

  if (screen === 'results' && result) {
    const displayLevel = overrideLevel ?? result.recommendedLevel;
    return (
      <div className="space-y-6 max-w-xl mx-auto">
        <header className="text-center">
          <h1 className="text-2xl font-bold m-0">Your results</h1>
        </header>
        <Card>
          <p className="text-xl font-semibold text-[var(--color-primary)] mb-1">
            Recommended starting level: {displayLevel}
          </p>
          <p className="text-lg mb-4">{getLevelLabel(displayLevel)}</p>
          {result.highestLevelConsistent && (
            <p className="text-sm mb-3">
              Highest level handled consistently: {result.highestLevelConsistent}
            </p>
          )}
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
                  {getLevelDisplay(l.id)}
                </option>
              ))}
            </select>
          </label>

          <Button onClick={acceptRecommendation}>Continue to dashboard</Button>
        </Card>
      </div>
    );
  }

  if (screen === 'assessment' && !question) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center text-[var(--color-text-muted)]">
        Calculating your results...
      </div>
    );
  }

  if (screen !== 'assessment' || !question) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <Badge>Question {answeredIds.size + 1}</Badge>
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
          Next
        </Button>
      </Card>

      <Link to="/" className="text-sm text-[var(--color-text-muted)]">
        Exit assessment
      </Link>
    </div>
  );
}
