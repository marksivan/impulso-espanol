# Impulso Español

A polished Spanish-learning web application for learners at CEFR **A1 through B2** who want reading comprehension, contextual vocabulary, grammar analysis, and measurable skill development — without childish gamification.

**Live demo:** [https://marksivan.github.io/impulso-espanol/](https://marksivan.github.io/impulso-espanol/)

## Product overview

Impulso Español targets learners who:

- Have some Spanish practice (e.g. 100+ days on a beginner app) but are not ready for long A2 passages
- Already recognize simple phrases, questions, and everyday vocabulary
- Want a smooth progression from foundations through challenging reading
- Prefer comprehension and skill tracking over repetitive drills

The core learning loop:

1. Read meaningful Spanish passages
2. Answer increasingly difficult comprehension questions
3. Analyze vocabulary and grammar in context
4. Produce original Spanish
5. Receive clear explanations
6. Save unfamiliar vocabulary
7. Review mistakes and weak areas
8. Track improvement over time

## Target user

Learners from **A1 through B2**. **A1.2 (Early Beginner)** is the recommended default starting level for someone who understands simple phrases like *Nosotros somos de la ciudad* but is not yet ready for A2 past-tense narratives. **A1.1 (Foundations)** is available as optional review.

## Features

- **24 original lessons** across eight levels (A1.1 → B2.2)
- **8 A1 lessons** with short passages, gentle production tasks, and browser speech for examples
- **Placement onboarding** with manual level selection or adaptive assessment (A1–B2)
- **Level overview** on the homepage with practical abilities, example phrases, and readiness toward the next level
- **Staged lesson flow**: preview → reading → comprehension → vocabulary → grammar → production
- **Multiple question types**: multiple choice, true/false/not stated, evidence selection, fill-gap, sequence, short response
- **Passage word lookup** with save-to-vocabulary
- **Mistake Notebook** with spaced review
- **Vocabulary library** with confidence levels and spaced review
- **Skill mastery tracking** (12 skills)
- **Progress dashboard** with independence metrics
- **Translator** (MyMemory API) and **Word Explorer**
- **Export / import / reset** for local progress
- **Light and dark themes**, responsive layout, accessibility support

## Technology stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Routing | React Router (HashRouter for GitHub Pages) |
| Styling | Tailwind CSS 4 |
| Content | Static TypeScript/JSON lesson files |
| Persistence | localStorage via repository interfaces |
| Translation | MyMemory Translation API |
| Dictionary | Free Dictionary API (English) + MyMemory supplement |
| Testing | Vitest + React Testing Library |
| Deployment | GitHub Pages (`gh-pages`) |

## Local setup

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Tests

```bash
npm test
npm run test:watch
```

## GitHub Pages deployment

The app is configured for subpath hosting at `/impulso-espanol/`:

```bash
npm run deploy
```

This runs `npm run build` and publishes the `dist/` folder via `gh-pages`.

### Manual deployment steps

1. Ensure `vite.config.ts` has `base: '/impulso-espanol/'` (or your repo name)
2. Enable GitHub Pages in repository settings → Source: `gh-pages` branch
3. Run `npm run deploy`
4. Visit `https://<username>.github.io/impulso-espanol/`

HashRouter is used so all routes work without server-side fallback configuration.

## Project structure

```text
src/
├── components/
│   ├── common/          # Button, Card, Modal, Badge, EmptyState
│   ├── layout/          # AppLayout, navigation
│   ├── lessons/         # PassageReader, QuestionEngine, AnswerFeedback
│   ├── vocabulary/
│   ├── progress/        # CurrentLevelOverview
│   └── review/
├── pages/               # Home, Learn, Lesson, Review, Vocabulary, Translator, Progress, Settings, Placement
├── data/
│   ├── levels/          # CEFR level definitions
│   ├── lessons/         # 24 lesson content files by level (A1–B2)
│   ├── placement/       # Placement test questions
│   └── vocabulary/      # Lemma mappings
├── repositories/        # Progress, vocabulary, review, settings, export/import
├── services/            # translationService, dictionaryService
├── hooks/               # useProgressData
├── utilities/           # storage, skill mastery, lesson completion, export validation
├── types/               # TypeScript interfaces
├── context/             # AppContext (settings, theme)
├── constants/
└── styles/
```

## Lesson content structure

Each lesson is a `Lesson` object with stable string IDs:

```typescript
interface Lesson {
  id: string;
  title: string;
  level: LevelId;           // A1.1 … B2.2
  topic: string;
  estimatedMinutes: number;
  passage: Passage;
  questions: Question[];    // 6–10 questions, 3+ types
  targetVocabulary: VocabularyItem[];
  targetGrammar: GrammarFocus[];
  completionRequirements: CompletionRequirement;
  skillsTested: SkillTag[];
}
```

Lessons are organized in:

- `src/data/lessons/a11Lessons.ts` (4 lessons)
- `src/data/lessons/a12Lessons.ts` (4 lessons)
- `src/data/lessons/a21Lessons.ts` (3 lessons)
- `src/data/lessons/a22Lessons.ts` (3 lessons)
- `src/data/lessons/b11Lessons.ts` (3 lessons)
- `src/data/lessons/b12Lessons.ts` (3 lessons)
- `src/data/lessons/b21Lessons.ts` (2 lessons)
- `src/data/lessons/b22Lessons.ts` (2 lessons)

**Default level:** new profiles start at **A1.2**. A1.1 is optional foundation review.

## How to add a new lesson

1. Open the appropriate level file (e.g. `b11Lessons.ts`)
2. Use helpers from `lessonFactory.ts`: `buildLesson`, `mcq`, `tfn`, `evidence`, `fillGap`, `sequence`, `production`
3. Write an original Spanish passage as a `paragraphs` array
4. Add 6–10 questions across at least 3 types, including one production question
5. Add `targetVocabulary` and `targetGrammar`
6. Export is automatic via `src/data/lessons/index.ts`

Example:

```typescript
buildLesson({
  id: 'lesson-b11-my-topic',
  title: 'Mi nueva lección',
  level: 'B1.1',
  topic: 'Culture',
  estimatedMinutes: 15,
  paragraphs: ['Primer párrafo...', 'Segundo párrafo...'],
  questions: [/* mcq, tfn, production, etc. */],
  targetVocabulary: [{ id: 'v1', term: '...', translation: '...' }],
  targetGrammar: [{ id: 'g1', topic: 'Subjunctive', explanation: '...', examples: [] }],
  skillsTested: ['main-idea', 'inference'],
})
```

## localStorage persistence

React components **never access localStorage directly**. All persistence goes through repositories:

| Repository | Storage key | Purpose |
|------------|-------------|---------|
| `progressRepository` | `spanishApp.profile`, `spanishApp.lessonProgress`, etc. | Lessons, attempts, skills |
| `vocabularyRepository` | `spanishApp.savedVocabulary` | Saved words and phrases |
| `reviewRepository` | `spanishApp.mistakeNotebook` | Mistake notebook |
| `settingsRepository` | `spanishApp.settings` | User preferences |
| `translationHistoryRepository` | `spanishApp.translationHistory` | Recent translations |

Every stored value uses a versioned envelope (schema version **2** as of the A1 expansion):

```json
{
  "version": 2,
  "updatedAt": "2026-07-12T12:00:00.000Z",
  "data": {}
}
```

Safe helpers in `utilities/storage.ts` handle malformed JSON and return sensible defaults.

### Profile migration (v1 → v2)

When the app loads, `utilities/migration.ts` may update untouched default profiles from the old A2.1/A2.2 defaults to **A1.2**. Migration runs only when:

- Placement has not been completed
- No lessons, attempts, or placement results exist
- The stored level is an old default (A2.1 or A2.2)

Existing progress, manually selected levels, and completed placement results are **never** overwritten.

## Export and import

**Export** (Settings → Export progress) downloads:

```json
{
  "exportVersion": 1,
  "exportedAt": "ISO timestamp",
  "profile": {},
  "placementResult": {},
  "lessonProgress": [],
  "questionAttempts": [],
  "savedVocabulary": [],
  "reviewHistory": [],
  "mistakeNotebook": [],
  "skillMastery": [],
  "settings": {},
  "translationHistory": []
}
```

**Import** validates the file, shows a confirmation modal, and replaces all current data.

**Reset** requires explicit confirmation before deleting everything.

## Translation API limitations

- Uses [MyMemory Translation API](https://mymemory.translated.net/) — free tier with daily limits
- No API key required (browser-safe)
- 400 character limit per request
- Results are machine-generated and may be imperfect
- Full lesson passages are never auto-translated
- Quota errors are handled gracefully

## Future Supabase migration plan

The repository interfaces are designed for backend swap:

1. Add user authentication (Supabase Auth)
2. Create tables: `profiles`, `lesson_progress`, `question_attempts`, `saved_vocabulary`, `review_history`, `skill_mastery`, `placement_results`, `user_settings`, `translation_history`
3. Implement `SupabaseProgressRepository`, `SupabaseVocabularyRepository`, etc. with the same TypeScript interfaces
4. Import existing exported JSON on first login
5. Optionally keep localStorage as offline cache

Page components and hooks remain unchanged — only repository implementations change.

## Assumptions

- Learners use a modern browser with localStorage enabled
- Network is available for translation/dictionary features (offline states are handled)
- Written production is self-assessed (no AI grading in MVP)
- GitHub repository name is `impulso-espanol` for Pages base path

## License

MIT
