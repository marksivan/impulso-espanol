import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LessonPage } from '../pages/LessonPage';
import { AppProvider } from '../context/AppContext';
import { a12Lessons } from '../data/lessons/a12Lessons';
import { createInitialProgress } from '../utilities/lessonCompletion';
import { progressRepository } from '../repositories/progressRepository';
import { STORAGE_KEYS } from '../repositories/storageKeys';

const lesson = a12Lessons[0];

function renderLessonAtGrammar() {
  const progress = {
    ...createInitialProgress(lesson),
    currentStage: 'grammar',
    progressPercentage: 67,
  };
  progressRepository.saveLessonProgress(progress);

  return render(
    <AppProvider>
      <MemoryRouter initialEntries={[`/lesson/${lesson.id}`]}>
        <Routes>
          <Route path="/lesson/:lessonId" element={<LessonPage />} />
        </Routes>
      </MemoryRouter>
    </AppProvider>,
  );
}

describe('LessonPage review passage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('opens a passage modal without leaving the grammar stage', () => {
    renderLessonAtGrammar();

    expect(screen.getByText(/Stage: grammar/i)).toBeInTheDocument();
    expect(screen.getByText(/Completa con la forma correcta/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Review passage' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'Spanish passage' })).toBeInTheDocument();
    expect(screen.getByText(/Stage: grammar/i)).toBeInTheDocument();
    expect(screen.getByText(/Completa con la forma correcta/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back to questions' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText(/Stage: grammar/i)).toBeInTheDocument();
    expect(screen.getByText(/Completa con la forma correcta/i)).toBeInTheDocument();
  });

  it('does not reset saved lesson progress when reviewing the passage', () => {
    renderLessonAtGrammar();

    fireEvent.click(screen.getByRole('button', { name: 'Review passage' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back to questions' }));

    const saved = progressRepository.getProgressForLesson(lesson.id);
    expect(saved?.currentStage).toBe('grammar');
    expect(localStorage.getItem(STORAGE_KEYS.lessonProgress)).toBeTruthy();
  });
});
