import { useEffect, useState } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { useStore } from './lib/store.jsx';
import { diffDays, todayKey } from './lib/dates.js';
import { isDue } from './lib/srs.js';
import { Icon } from './components/icons.jsx';
import RewardModal from './components/RewardModal.jsx';
import { AiProvider, useAi } from './components/ai/Ai.jsx';
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
import Talk from './pages/Talk.jsx';
import { MockHub, MockListening, MockReading, MockWriting } from './pages/Mock.jsx';
import Book from './pages/Book.jsx';
import Review from './pages/Review.jsx';
import Library from './pages/Library.jsx';
import Rewards, { Masterclass } from './pages/Rewards.jsx';
import Progress from './pages/Progress.jsx';
import Settings from './pages/Settings.jsx';
import ExamDay from './pages/ExamDay.jsx';

const NAV = [
  ['/', 'Today', 'today'],
  ['/plan', 'My plan', 'plan'],
  ['/talk', 'Voice room', 'wave'],
  ['/practice', 'Practice', 'practice'],
  ['/words', 'Words', 'words'],
  ['/mock', 'Mock tests', 'mock'],
  ['/rewards', 'Rewards', 'rewards'],
  ['/progress', 'Progress', 'progress'],
  ['/library', 'Library', 'library'],
  ['/settings', 'Settings', 'settings'],
];

export default function App() {
  const { state } = useStore();
  if (!state.settings) return <Onboarding />;
  return <AiProvider><Shell /></AiProvider>;
}

function Shell() {
  const { state, allWords } = useStore();
  const { openTutor } = useAi();
  const { pathname } = useLocation();
  const [more, setMore] = useState(false);
  const today = todayKey();

  useEffect(() => { window.scrollTo(0, 0); setMore(false); }, [pathname]);
  useEffect(() => {
    const t = state.settings?.theme;
    if (t && t !== 'system') document.documentElement.dataset.theme = t;
    else delete document.documentElement.dataset.theme;
  }, [state.settings?.theme]);

  const left = diffDays(today, state.settings.examDate);
  const due = allWords.filter((w) => isDue(state.vocab[w.id], today)).length;

  return (
    <div className="app">
      <aside className="side" aria-label="Main navigation">
        <NavLink to="/" className="brand"><img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />Band Seven</NavLink>
        {NAV.map(([to, label, icon]) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Icon name={icon} />{label}
            {to === '/words' && due > 0 && <span className="pill">{due}</span>}
          </NavLink>
        ))}
        <div className="side-foot">
          <div className="mini-count">
            {left > 0 ? <><b>{left}</b><span>{left === 1 ? 'day' : 'days'} to your exam</span></> : left === 0 ? <><b>Today</b><span>Good luck!</span></> : <><b>Done</b><span>Exam finished</span></>}
          </div>
        </div>
      </aside>

      <main className="page">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/talk" element={<Talk />} />
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
          <Route path="/masterclass/:id" element={<Masterclass />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/exam-day" element={<ExamDay />} />
          <Route path="*" element={<Today />} />
        </Routes>
      </main>

      {pathname !== '/talk' && (
        <button type="button" className="fab" onClick={() => openTutor()} aria-label="Ask the AI tutor"><Icon name="sparkle" /><span>Ask tutor</span></button>
      )}

      <nav className="tabbar" aria-label="Main navigation">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}><Icon name="today" />Today</NavLink>
        <NavLink to="/plan" className={({ isActive }) => (isActive ? 'active' : '')}><Icon name="plan" />Plan</NavLink>
        <NavLink to="/talk" className="mic-tab" aria-label="Voice room"><span className="disc"><Icon name="mic" /></span></NavLink>
        <NavLink to="/words" className={({ isActive }) => (isActive ? 'active' : '')}><Icon name="words" />Words</NavLink>
        <button type="button" onClick={() => setMore(true)}><Icon name="more" />More</button>
      </nav>
      {more && (
        <div className="sheet-backdrop" onClick={() => setMore(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="More">
            {NAV.filter(([to]) => !['/', '/plan', '/words'].includes(to)).map(([to, label, icon]) => (
              <NavLink key={to} to={to} className="nav-link"><Icon name={icon} />{label}</NavLink>
            ))}
          </div>
        </div>
      )}
      <RewardModal />
    </div>
  );
}
