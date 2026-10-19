import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { WORDS } from '../data/index.js';
import { isDue, isLearned, review } from '../lib/srs.js';
import { diffDays, todayKey } from '../lib/dates.js';
import { useStore } from '../lib/store.jsx';
import { sayWord } from '../lib/speech.js';
import { wordHelperPrompt } from '../lib/ai/prompts.js';
import { useAi, ExplainButton } from '../components/ai/Ai.jsx';
import { PageHead, TaskDone, useTask } from '../components/ui.jsx';
import { Icon } from '../components/icons.jsx';

const status = (card) => (!card ? 'new' : isLearned(card) ? 'learned' : 'learning');
const EMPTY_WORD = { word: '', bn: '', pos: 'noun', synonyms: '', example: '' };

function WordForm({ initial, onSave, onCancel }) {
  const { requireAi, stream } = useAi();
  const [w, setW] = useState(initial ? { ...initial, synonyms: initial.synonyms.join(', ') } : EMPTY_WORD);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const set = (k) => (e) => setW({ ...w, [k]: e.target.value });

  function fill() {
    if (!w.word.trim()) { setMsg('Type the word first.'); return; }
    requireAi(async () => {
      setBusy(true);
      setMsg('');
      try {
        let out = '';
        for await (const t of stream({ system: 'You are a precise English–Bangla dictionary for IELTS students. Reply only with JSON.', messages: [{ role: 'user', content: wordHelperPrompt(w.word.trim()) }] })) out += t;
        const json = JSON.parse(out.match(/\{[\s\S]*\}/)?.[0] || '{}');
        setW((cur) => ({
          ...cur,
          bn: cur.bn || json.bn || '',
          pos: json.pos && ['noun', 'verb', 'adjective', 'adverb', 'phrase'].includes(json.pos) ? json.pos : cur.pos,
          synonyms: cur.synonyms || (json.synonyms || []).join(', '),
          example: cur.example || json.example || '',
        }));
        setMsg('Filled in by the AI. Check the meaning before saving.');
      } catch (e) {
        setMsg(e.message?.startsWith('Unexpected') ? 'The AI’s answer couldn’t be read. Try again or fill it in yourself.' : e.message);
      } finally {
        setBusy(false);
      }
    });
  }

  function save(e) {
    e.preventDefault();
    if (!w.word.trim() || !w.bn.trim()) { setMsg('A word and its Bangla meaning are needed.'); return; }
    onSave({ word: w.word.trim(), bn: w.bn.trim(), pos: w.pos, synonyms: w.synonyms.split(',').map((s) => s.trim()).filter(Boolean), example: w.example.trim() });
  }

  return (
    <form className="card raised stack s-vocab" onSubmit={save} style={{ borderTop: '4px solid var(--vocab)' }}>
      <div className="row"><h2>{initial ? 'Edit your word' : 'Add a new word'}</h2><span className="spacer" />
        <button type="button" className="btn sm" onClick={fill} disabled={busy}><Icon name="sparkle" />{busy ? 'Thinking…' : 'Fill with AI'}</button>
      </div>
      <div className="grid2">
        <label className="field">Word or phrase<input type="text" value={w.word} onChange={set('word')} placeholder="e.g. meticulous" autoFocus /></label>
        <label className="field">Bangla meaning<input type="text" className="bn" value={w.bn} onChange={set('bn')} placeholder="যেমন: অত্যন্ত যত্নশীল" /></label>
        <label className="field">Part of speech
          <select value={w.pos} onChange={set('pos')}>{['noun', 'verb', 'adjective', 'adverb', 'phrase'].map((p) => <option key={p}>{p}</option>)}</select>
        </label>
        <label className="field">Synonyms <small>separated by commas</small><input type="text" value={w.synonyms} onChange={set('synonyms')} placeholder="careful, thorough" /></label>
      </div>
      <label className="field">Example sentence<input type="text" value={w.example} onChange={set('example')} placeholder="Where you saw it, or your own sentence" /></label>
      {msg && <p className="small muted">{msg}</p>}
      <div className="row"><button type="submit" className="btn primary">{initial ? 'Save changes' : 'Add to my words'}</button><button type="button" className="btn ghost" onClick={onCancel}>Cancel</button></div>
    </form>
  );
}

export function WordList() {
  const { state, allWords, addWord, updateWord, removeWord } = useStore();
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('');
  const [filter, setFilter] = useState('');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const topics = [...new Set(allWords.map((w) => w.topic))];
  const today = todayKey();
  const counts = { new: 0, learning: 0, learned: 0 };
  allWords.forEach((w) => counts[status(state.vocab[w.id])]++);
  const due = allWords.filter((w) => isDue(state.vocab[w.id], today)).length;
  const q = query.trim().toLowerCase();
  const shown = allWords.filter((w) => (!topic || w.topic === topic) && (!filter || status(state.vocab[w.id]) === filter)
    && (!q || w.word.toLowerCase().includes(q) || w.bn.includes(query.trim()) || w.synonyms.some((s) => s.toLowerCase().includes(q))));

  return (
    <>
      <PageHead kicker={`${allWords.length} words · ${state.customWords.length} of your own`} title="Vocabulary" sub="Academic and topic words with Bangla meanings. Add any new word you meet, and it joins your daily reviews.">
        <button type="button" className="btn" onClick={() => { setAdding(true); setEditing(null); }}><Icon name="plus" />Add a word</button>
        <Link className="btn primary" to="/words/study">{due ? `Review ${due} due` : 'Study'}</Link>
      </PageHead>
      <div className="stack">
        {adding && <WordForm onCancel={() => setAdding(false)} onSave={(w) => { addWord(w); setAdding(false); }} />}
        {editing && <WordForm initial={editing} onCancel={() => setEditing(null)} onSave={(w) => { updateWord(editing.id, w); setEditing(null); }} />}
        <div className="status-row">
          <div className="stat-card s-grammar"><span className="ico"><Icon name="check" /></span><div><b>{counts.learned}</b><span>learned</span></div></div>
          <div className="stat-card s-vocab"><span className="ico"><Icon name="vocab" /></span><div><b>{counts.learning}</b><span>learning</span></div></div>
          <div className="stat-card s-review"><span className="ico"><Icon name="lock" /></span><div><b>{counts.new}</b><span>not started</span></div></div>
          <div className="stat-card s-speaking"><span className="ico"><Icon name="review" /></span><div><b>{due}</b><span>due today</span></div></div>
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
              <div className={`wordrow ${w.custom ? 'own' : ''}`} key={w.id}>
                <div>
                  <b style={{ fontFamily: 'var(--display)', fontSize: 16 }}>{w.word}</b> <span className="muted small">{w.pos}</span>
                  <div className="bn" style={{ fontSize: 16 }}>{w.bn}</div>
                </div>
                <div className="syn small"><span className="muted">≈ {w.synonyms.join(', ')}</span>{w.example && <><br /><i>{w.example}</i></>}</div>
                <div className="row">
                  <button type="button" className="btn ghost sm icon" onClick={() => sayWord(w.word)} aria-label={`Pronounce ${w.word}`}><Icon name="volume" /></button>
                  {w.custom && <>
                    <button type="button" className="btn ghost sm icon" onClick={() => { setEditing(w); setAdding(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label={`Edit ${w.word}`}><Icon name="edit" /></button>
                    <button type="button" className="btn ghost sm icon danger" onClick={() => window.confirm(`Delete “${w.word}”?`) && removeWord(w.id)} aria-label={`Delete ${w.word}`}><Icon name="trash" /></button>
                  </>}
                  <span className={`chip ${st === 'learned' ? 'ok' : st === 'learning' ? 'accent' : ''}`}>{w.custom ? 'mine · ' : ''}{st === 'new' ? 'new' : st}</span>
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
  const { state, plan, allWords, rateWord } = useStore();
  const { task, finish, done } = useTask();
  const today = todayKey();

  const planned = useMemo(() => {
    if (!task) return null;
    const t = plan.days.find((d) => d.date === task.date)?.tasks.find((x) => x.id === task.id);
    return t?.variant === 'new' ? t.ref : null;
  }, [task, plan]);
  const [extra, setExtra] = useState(null);
  const batch = planned ?? extra;

  const build = (b) => {
    const fresh = [
      ...(b ? WORDS.slice(b.start, b.start + b.count) : []),
      ...state.customWords, // your own words are always included until studied
    ].filter((w) => !state.vocab[w.id]).map((w) => w.id);
    const due = allWords.filter((w) => isDue(state.vocab[w.id], today) && !fresh.includes(w.id)).map((w) => w.id);
    return [...due, ...fresh];
  };

  const [queue, setQueue] = useState(() => build(batch));
  const [flipped, setFlipped] = useState(false);
  const [finished, setFinished] = useState(false);
  const [total] = useState(queue.length);

  const firstUnseen = WORDS.findIndex((w) => !state.vocab[w.id]);
  const current = allWords.find((w) => w.id === queue[0]);
  const isNew = current && !state.vocab[current.id];

  function grade(g) {
    rateWord(current.id, g);
    setFlipped(false);
    const rest = queue.slice(1);
    const next = g === 'again' ? [...rest, current.id] : rest;
    setTimeout(() => setQueue(next), 120);
    if (!next.length) { setFinished(true); finish(); }
  }

  if (!current) {
    return (
      <>
        <PageHead kicker="Vocabulary" title={finished ? 'Session complete' : 'Nothing due right now'} back={task ? '/' : '/words'} />
        <div className="card stack">
          <p>{finished ? 'Well done. Each word will come back just before you are likely to forget it.' : 'You have no words due for review.'}</p>
          <TaskDone show={done} />
          {!done && task && !finished && <div><button type="button" className="btn primary" onClick={finish}>Mark this task done</button></div>}
          <div className="row">
            {firstUnseen >= 0 && <button type="button" className="btn" onClick={() => { const b = { start: firstUnseen, count: 12 }; setExtra(b); setQueue(build(b)); setFinished(false); }}>Learn 12 more new words</button>}
            <Link className="btn ghost" to="/words">Browse or add words</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead kicker={`Vocabulary · ${current.topic}`} title="Study" sub={`${total - queue.length + 1} of ${total} · tap the card to flip it`} back={task ? '/' : '/words'} />
      <div className="stack" style={{ maxWidth: 640 }}>
        <div className="xpbar" style={{ height: 8 }}><i style={{ width: `${((total - queue.length) / Math.max(1, total)) * 100}%`, background: 'var(--vocab)' }} /></div>
        <div className="flipwrap">
          <div className={`flip ${flipped ? 'on' : ''}`} onClick={() => setFlipped(!flipped)} role="button" tabIndex={0} aria-label="Flip card"
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setFlipped(!flipped))}>
            <div className="face front">
              <div className="row" style={{ justifyContent: 'center' }}>
                {isNew ? <span className="chip accent">new word</span> : <span className="chip">review</span>}
                <span className="chip">{current.pos}</span>
                {current.custom && <span className="chip skill s-vocab">my word</span>}
              </div>
              <p className="word">{current.word}</p>
              <button type="button" className="btn ghost sm" onClick={(e) => { e.stopPropagation(); sayWord(current.word); }}><Icon name="volume" />Pronounce</button>
              <p className="muted small">Think of the meaning, then tap to flip</p>
            </div>
            <div className="face back">
              <p className="meaning">{current.bn}</p>
              <p className="muted">≈ {current.synonyms.join(', ')}</p>
              {current.example && <p><i>{current.example}</i></p>}
            </div>
          </div>
        </div>
        {!flipped
          ? <button type="button" className="btn primary lg" onClick={() => setFlipped(true)}>Show meaning</button>
          : (
            <>
              <div className="grades">
                {['again', 'hard', 'good', 'easy'].map((g) => {
                  const days = diffDays(today, review(state.vocab[current.id], g, today).due);
                  return (
                    <button key={g} type="button" className={`btn g-${g}`} onClick={() => grade(g)}>
                      {g[0].toUpperCase() + g.slice(1)}<small>{days === 0 ? 'again now' : days === 1 ? 'tomorrow' : `in ${days} days`}</small>
                    </button>
                  );
                })}
              </div>
              <div className="row" style={{ justifyContent: 'center' }}>
                <ExplainButton prompt={`Explain the English word "${current.word}" (${current.pos}) for an IELTS student: its meaning, 3 common collocations, and 2 example sentences for Writing Task 2 or Speaking.`} label="Explain more with the tutor" />
              </div>
            </>
          )}
      </div>
    </>
  );
}
