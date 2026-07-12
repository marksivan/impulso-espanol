export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getWeekStart(date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isThisWeek(iso: string): boolean {
  const date = new Date(iso);
  const weekStart = getWeekStart();
  return date >= weekStart;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeAnswer(answer: string | string[] | undefined): string {
  if (!answer) return '';
  if (Array.isArray(answer)) return answer.join('|').trim().toLowerCase();
  return answer.trim().toLowerCase();
}

export function answersMatch(
  userAnswer: string | string[],
  correctAnswer: string | string[] | undefined,
): boolean {
  if (!correctAnswer) return false;
  const normalizedUser = normalizeAnswer(userAnswer);
  const normalizedCorrect = normalizeAnswer(correctAnswer);
  return normalizedUser === normalizedCorrect;
}

export function calculatePercentage(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function tokenizeSpanishWord(word: string): string {
  return word
    .replace(/^["«¿¡(]+|["»?!).,;:]+$/g, '')
    .toLowerCase()
    .trim();
}

export function getSentenceContainingWord(text: string, word: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const token = tokenizeSpanishWord(word);
  const found = sentences.find((s) =>
    s.toLowerCase().split(/\s+/).some((w) => tokenizeSpanishWord(w) === token),
  );
  return found ?? text.slice(0, 200);
}
