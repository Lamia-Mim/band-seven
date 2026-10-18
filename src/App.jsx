import { useEffect, useState } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { useStore } from './lib/store.jsx';
import { diffDays, todayKey } from './lib/dates.js';
import { Icon } from './components/icons.jsx';
import RewardModal from './components/RewardModal.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Today from './pages/Today.jsx';
import Plan from './pages/Plan.jsx';
import Practice from './pages/Practice.jsx';
import { GrammarList, GrammarLesson } from './pages/Grammar.jsx';
import { WordList, WordStudy } from './pages/Words.jsx';
import Reading from './pages/Reading.jsx';
import Listening from './pages/Listening.jsx';
import Writing from './pages/Writing.jsx';
import { SpeakingHub, SpeakingCard, SpeakingPart1, SpeakingFull } from './pages/Speaking.jsx';
import { MockHub, MockListening, MockReading, MockWriting } from './pages/Mock.jsx';
import Book from './pages/Book.jsx';
import Review from './pages/Review.jsx';
import Library from './pages/Library.jsx';
import Rewards from './pages/Rewards.jsx';
import Progress from './pages/Progress.jsx';
import Settings from './pages/Settings.jsx';
import ExamDay from './pages/ExamDay.jsx';

const NAV = [
  ['/', 'Today', 'today'],
  ['/plan', 'Plan', 'plan'],
  ['/practice', 'Practice', 'practice'],
  ['/words', 'Words', 'words'],
  ['/mock', 'Mock tests', 'mock'],
  ['/library', 'Library', 'library'],
  ['/rewards', 'Rewards', 'rewards'],
  ['/progress', 'Progress', 'progress'],
  ['/settings', 'Settings', 'settings'],
];

export default function App() {
  const { state } = useStore();
  const { pathname } = useLocation();
  const [more, setMore] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); setMore(false); }, [pathname]);
  useEffect(() => {
    const t = state.settings?.theme;
    if (t && t !== 'system') document.documentElement.dataset.theme = t;
    else delete document.documentElement.dataset.theme;
  }, [state.settings?.theme]);

  if (!state.settings) return <Onboarding />;

  const left = diffDays(todayKey(), state.settings.examDate);

  return (
    <div className="app">
      <aside className="side" aria-label="Main navigation">
        <NavLink to="/" className="brand"><img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />Band Seven</NavLink>
        {NAV.map(([to, label, icon]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Icon name={icon} />{label}
          </NavLink>
        ))}
        <div className="countdown">
          {left > 0 ? <><b>{left}</b>{left === 1 ? 'day' : 'days'} to your exam</> : left === 0 ? <><b>Today</b>Good luck!</> : <><b>Done</b>Exam finished</>}
        </div>
      </aside>

      <main className="page">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/grammar" element={<GrammarList />} />
          <Route path="/grammar/:id" element={<GrammarLesson />} />
          <Route path="/words" element={<WordList />} />
          <Route path="/words/study" element={<WordStudy />} />
          <Route path="/reading/:id" element={<Reading />} />
          <Route path="/listening/:id" element={<Listening />} />
          <Route path="/writing/:id" element={<Writing />} />
          <Route path="/speaking" element={<SpeakingHub />} />
          <Route path="/speaking/card/:ref" element={<SpeakingCard />} />
          <Route path="/speaking/part1/:ref" element={<SpeakingPart1 />} />
          <Route path="/speaking/full/:ref" element={<SpeakingFull />} />
          <Route path="/mock" element={<MockHub />} />
          <Route path="/mock/listening" element={<MockListening />} />
          <Route path="/mock/reading" element={<MockReading />} />
          <Route path="/mock/writing/:ref" element={<MockWriting />} />
          <Route path="/book/:section" element={<Book />} />
          <Route path="/review" element={<Review />} />
          <Route path="/library" element={<Library />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/exam-day" element={<ExamDay />} />
          <Route path="*" element={<Today />} />
        </Routes>
      </main>

      <nav className="tabbar" aria-label="Main navigation">
        {NAV.slice(0, 4).map(([to, label, icon]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}><Icon name={icon} />{label}</NavLink>
        ))}
        <button type="button" onClick={() => setMore(true)}><Icon name="more" />More</button>
      </nav>
      {more && (
        <div className="sheet-backdrop" onClick={() => setMore(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="More">
            {NAV.slice(4).map(([to, label, icon]) => (
              <NavLink key={to} to={to} className="nav-link"><Icon name={icon} />{label}</NavLink>
            ))}
          </div>
        </div>
      )}
      <RewardModal />
    </div>
  );
}
