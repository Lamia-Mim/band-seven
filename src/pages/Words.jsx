import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { WORDS } from '../data/index.js';
import { NEW_WORDS_PER_DAY } from '../lib/plan.js';
import { isDue, isLearned, review } from '../lib/srs.js';
import { diffDays, todayKey } from '../lib/dates.js';
import { useStore } from '../lib/store.jsx';
import { canSpeak } from '../lib/speech.js';
import { PageHead, TaskDone, useTask } from '../components/ui.jsx';
import { Icon } from '../components/icons.jsx';

const say = (w) => {
  if (!canSpeak()) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(w);
  u.lang = 'en-GB';
  u.rate = 0.9;
  speechSynthesis.speak(u);
};

const status = (card) => (!card ? 'new' : isLearned(card) ? 'learned' : 'learning');

export function WordList() {
  const { state } = useStore();
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('');
  const [filter, setFilter] = useState('');
  const topics = [...new Set(WORDS.map((w) => w.topic))];
  const today = todayKey();
  const counts = { new: 0, learning: 0, learned: 0 };
  WORDS.forEach((w) => counts[status(state.vocab[w.id])]++);
  const due = WORDS.filter((w) => isDue(state.vocab[w.id], today)).length;
  const q = query.trim().toLowerCase();
  const shown = WORDS.filter((w) => (!topic || w.topic === topic) && (!filter || status(state.vocab[w.id]) === filter)
    && (!q || w.word.includes(q) || w.bn.includes(query.trim()) || w.synonyms.some((s) => s.includes(q))));

  return (
    <>
      <PageHead kicker={`${WORDS.length} words with Bangla meanings`} title="Vocabulary">
        <Link className="btn primary" to="/words/study">{due ? `Review ${due} due` : 'Study'}</Link>
      </PageHead>
      <div className="stack">
        <div className="kpis">
          <div className="kpi"><b>{counts.learned}</b><span>learned (seen 3+ times correctly)</span></div>
          <div className="kpi"><b>{counts.learning}</b><span>learning</span></div>
          <div className="kpi"><b>{counts.new}</b><span>not started</span></div>
          <div className="kpi"><b>{due}</b><span>due for review today</span></div>
        </div>
        <div className="row">
          <input type="search" placeholder="Search a word, a synonym or Bangla" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search words" style={{ flex: '2 1 220px', width: 'auto' }} />
          <select value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="Topic" style={{ flex: '1 1 160px', width: 'auto' }}>
            <option value="">All topics</option>{topics.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Status" style={{ flex: '1 1 140px', width: 'auto' }}>
            <option value="">Any status</option><option value="new">Not started</option><option value="learning">Learning</option><option value="learned">Learned</option>
          </select>
        </div>
        <div className="wordlist">
          {shown.map((w) => {
            const st = status(state.vocab[w.id]);
            return (
              <div className="wordrow" key={w.id}>
                <div>
                  <b>{w.word}</b> <span className="muted small">{w.pos}</span>
                  <div className="bn">{w.bn}</div>
                </div>
                <div className="syn small"><span className="muted">≈ {w.synonyms.join(', ')}</span><br /><i>{w.example}</i></div>
                <div className="row">
                  <button type="button" className="btn ghost sm" onClick={() => say(w.word)} aria-label={`Pronounce ${w.word}`}><Icon name="volume" /></button>
                  <span className={`chip ${st === 'learned' ? 'ok' : st === 'learning' ? 'accent' : ''}`}>{st === 'new' ? 'new' : st}</span>
                </div>
              </div>
            );
          })}
          {!shown.length && <p className="muted">No words match.</p>}
        </div>
      </div>
    </>
  );
}

export function WordStudy() {
  const { state, plan, rateWord } = useStore();
  const { task, finish, done } = useTask();
  const today = todayKey();

  // The day's new batch comes from the task; otherwise only reviews (plus an
  // option to start the next unseen batch)
  const plannedBatch = useMemo(() => {
    if (!task) return null;
    const t = plan.days.find((d) => d.date === task.date)?.tasks.find((x) => x.id === task.id);
    return t?.variant === 'new' ? t.ref : null;
  }, [task, plan]);
  const [extraBatch, setExtraBatch] = useState(null);
  const batch = plannedBatch ?? extraBatch;

  const [queue, setQueue] = useState(() => build(batch));
  const [shown, setShown] = useState(false);
  const [finished, setFinished] = useState(false);

  function build(b) {
    const fresh = b == null ? [] : WORDS.slice(b * NEW_WORDS_PER_DAY, (b + 1) * NEW_WORDS_PER_DAY).filter((w) => !state.vocab[w.id]).map((w) => w.id);
    const due = WORDS.filter((w) => isDue(state.vocab[w.id], today) && !fresh.includes(w.id)).map((w) => w.id);
    return [...due, ...fresh];
  }

  const nextUnseen = Math.floor(WORDS.findIndex((w) => !state.vocab[w.id]) / NEW_WORDS_PER_DAY);
  const current = WORDS.find((w) => w.id === queue[0]);
  const isNew = current && !state.vocab[current.id];

  function grade(g) {
    rateWord(current.id, g);
    setShown(false);
    const rest = queue.slice(1);
    const next = g === 'again' ? [...rest, current.id] : rest;
    setQueue(next);
    if (!next.length) { setFinished(true); finish(); }
  }

  if (!current) {
    return (
      <>
        <PageHead kicker="Vocabulary" title={finished ? 'Session complete' : 'Nothing due right now'} back={task ? '/' : '/words'} />
        <div className="card stack">
          <p>{finished ? 'Well done. These words will come back for review just before you are likely to forget them.' : 'You have no words due for review.'}</p>
          <TaskDone show={done} />
          {!done && task && !finished && <div><button type="button" className="btn primary" onClick={finish}>Mark this task done</button></div>}
          {nextUnseen >= 0 && (
            <div><button type="button" className="btn" onClick={() => { setExtraBatch(nextUnseen); setQueue(build(nextUnseen)); setFinished(false); }}>Learn the next {NEW_WORDS_PER_DAY} new words</button></div>
          )}
          <Link className="btn ghost" to="/words">Browse all words</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead kicker={`Vocabulary · ${current.topic}`} title="Study" sub={`${queue.length} card${queue.length === 1 ? '' : 's'} left`} back={task ? '/' : '/words'} />
      <div className="stack" style={{ maxWidth: 640 }}>
        <div className="card raised flash">
          <div className="row" style={{ justifyContent: 'center' }}>
            {isNew ? <span className="chip accent">new word</span> : <span className="chip">review</span>}
            <span className="chip">{current.pos}</span>
          </div>
          <p className="word">{current.word}</p>
          <div><button type="button" className="btn ghost sm" onClick={() => say(current.word)}><Icon name="volume" />Pronounce</button></div>
          {shown ? (
            <div className="stack" style={{ gap: 8 }}>
              <p className="meaning bn">{current.bn}</p>
              <p className="muted">≈ {current.synonyms.join(', ')}</p>
              <p><i>{current.example}</i></p>
            </div>
          ) : <p className="muted">Think of the meaning, then reveal it.</p>}
        </div>
        {!shown
          ? <button type="button" className="btn primary lg" onClick={() => setShown(true)}>Show meaning</button>
          : (
            <div className="grades">
              {['again', 'hard', 'good', 'easy'].map((g) => {
                const days = diffDays(today, review(state.vocab[current.id], g, today).due);
                return (
                  <button key={g} type="button" className="btn" onClick={() => grade(g)}>
                    {g[0].toUpperCase() + g.slice(1)}<small>{days === 0 ? 'again now' : days === 1 ? 'tomorrow' : `in ${days} days`}</small>
                  </button>
                );
              })}
            </div>
          )}
      </div>
    </>
  );
}
