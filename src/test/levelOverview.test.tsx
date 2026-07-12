import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CurrentLevelOverview } from '../components/progress/CurrentLevelOverview';
import { a12Lessons } from '../data/lessons/a12Lessons';

vi.stubGlobal('speechSynthesis', {
  speak: vi.fn(),
  cancel: vi.fn(),
  getVoices: () => [],
});

function renderOverview() {
  return render(
    <MemoryRouter>
      <CurrentLevelOverview
        currentLevel="A1.2"
        recommendedLesson={a12Lessons[0]}
        foundationLesson={undefined}
        lessonProgress={[]}
        attempts={[]}
      />
    </MemoryRouter>,
  );
}

describe('CurrentLevelOverview', () => {
  it('renders A1.2 level overview with practical description', () => {
    renderOverview();

    expect(screen.getByText('A1.2')).toBeInTheDocument();
    expect(screen.getByText('Early Beginner')).toBeInTheDocument();
    expect(screen.getByText(/familiar phrases/i)).toBeInTheDocument();
    expect(screen.getByText('Nosotros somos de la ciudad.')).toBeInTheDocument();
  });

  it('hides translation initially and reveals on click', () => {
    renderOverview();

    expect(screen.queryByText('We are from the city.')).not.toBeInTheDocument();
    const showButtons = screen.getAllByText('Show meaning');
    fireEvent.click(showButtons[0]);
    expect(screen.getByText('We are from the city.')).toBeInTheDocument();
  });

  it('links to recommended lesson', () => {
    renderOverview();

    const link = screen.getByRole('link', { name: /Continue A1.2/i });
    expect(link).toHaveAttribute('href', `/lesson/${a12Lessons[0].id}`);
  });
});
