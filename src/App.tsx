import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const LearnPage = lazy(() => import('./pages/LearnPage').then((m) => ({ default: m.LearnPage })));
const LessonPage = lazy(() => import('./pages/LessonPage').then((m) => ({ default: m.LessonPage })));
const ReviewPage = lazy(() => import('./pages/ReviewPage').then((m) => ({ default: m.ReviewPage })));
const VocabularyPage = lazy(() =>
  import('./pages/VocabularyPage').then((m) => ({ default: m.VocabularyPage })),
);
const TranslatorPage = lazy(() =>
  import('./pages/TranslatorPage').then((m) => ({ default: m.TranslatorPage })),
);
const ProgressPage = lazy(() =>
  import('./pages/ProgressPage').then((m) => ({ default: m.ProgressPage })),
);
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
const PlacementPage = lazy(() =>
  import('./pages/PlacementPage').then((m) => ({ default: m.PlacementPage })),
);

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <p className="text-[var(--color-text-muted)]">Loading...</p>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/learn" element={<LearnPage />} />
              <Route path="/lesson/:lessonId" element={<LessonPage />} />
              <Route path="/review" element={<ReviewPage />} />
              <Route path="/vocabulary" element={<VocabularyPage />} />
              <Route path="/translator" element={<TranslatorPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="/placement" element={<PlacementPage />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </AppProvider>
  );
}
