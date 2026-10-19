import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import { dayOf, PHASES } from '../lib/plan.js';
import { describe, LABEL_OF, SKILL_OF } from '../lib/tasks.js';
import { isDayDone, levelFor, streak, xpFor, XP } from '../lib/progress.js';
import { isDue } from '../lib/srs.js';
import { addDays, diffDays, formatDay, todayKey } from '../lib/dates.js';
import { Icon, SECTION_ICON } from '../components/icons.jsx';

const TYPE = { study: 'Study day', review: 'Review day', mock: 'Mock test day', rest: 'Rest day', eve: 'Exam eve' };
const BLOCKS = [
  ['Warm-up', 'Spaced-repetition vocabulary: little and often'],
  ['Foundation', 'A short grammar lesson'],
  ['Focus', 'Your main skill session, timed like the real test'],
  ['Practice', 'A second skill to keep everything moving'],
  ['Speak', 'Daily speaking: fluency is a habit'],
  ['Review', 'Learn from your mistakes, where most progress happens'],
  ['Mock test', 'Full test conditions: one sitting, no phone'],
  ['Calm review', 'Nothing new today'],
  ['Get ready', 'Make tomorrow easy'],
];

export default function Today() {
  const { state, plan, allWords, completeTask, undoTask } = useStore();
  const { search } = useLocation();
  const today = todayKey();
  const date = new URLSearchParams(search).get('date') || today;
  const day = dayOf(plan, date);
  const name = state.settings.name;
  const left = diffDays(today, state.settings.examDate);
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const [floats, setFloats] = useState({});
  const [why, setWhy] = useState(false);

  const xp = xpFor(plan, state.done);
  const lvl = levelFor(xp);
  const run = streak(plan, state.done, today, state.shielded);
  const due = allWords.filter((w) => isDue(state.vocab[w.id], today)).length;

  if (!day) {
    return (
      <div className="stack">
        <section className="hero">
          <div>
            <p className="kicker" style={{ color: 'rgba(255,255,255,.8)' }}>{formatDay(date, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <h1>{date === plan.examDate ? 'Exam day. You’ve got this.' : date > plan.examDate ? 'Your plan is complete' : 'Your plan starts soon'}</h1>
            <p className="sub">{date === plan.examDate ? 'Read every instruction, watch the time, and trust your preparation.' : date > plan.examDate ? 'Set a new exam date in Settings to build a fresh plan.' : `It starts on ${formatDay(plan.startDate)}.`}</p>
          </div>
        </section>
        <div className="row"><Link className="btn" to="/rewards">Your rewards</Link><Link className="btn" to="/practice">Free practice</Link></div>
      </div>
    );
  }

  const phase = PHASES[day.phase - 1];
  const doneIds = state.done[date] || [];
  const finished = day.tasks.filter((t) => doneIds.includes(t.id)).length;
  const minutes = day.tasks.reduce((a, t) => a + (t.minutes || 0), 0);
  const viewingOther = date !== today;
  const tomorrow = dayOf(plan, addDays(date, 1));

  function toggle(t) {
    if (doneIds.includes(t.id)) { undoTask(date, t.id); return; }
    completeTask(date, t.id);
    setFloats((f) => ({ ...f, [t.id]: Date.now() }));
    setTimeout(() => setFloats((f) => { const n = { ...f }; delete n[t.id]; return n; }), 1200);
  }

  const groups = BLOCKS.map(([block, hint]) => ({ block, hint, tasks: day.tasks.filter((t) => t.block === block) })).filter((g) => g.tasks.length);

  return (
    <div className="stack" style={{ gap: 22 }}>
      <section className="hero">
        <div>
          <p className="kicker" style={{ color: 'rgba(255,255,255,.85)' }}>{formatDay(date, { weekday: 'long', day: 'numeric', month: 'long' })} · day {day.index + 1} of {plan.n}</p>
          <h1>{viewingOther ? `Your plan for ${formatDay(date)}` : `${hello}${name ? `, ${name}` : ''}`}</h1>
          <p className="sub">{day.type === 'rest' ? 'Rest is part of the plan. Your streak is safe today.' : phase.focus}</p>
          <div className="chips">
            <span className="chip">Phase {day.phase} · {phase.name}</span>
            <span className="chip">{TYPE[day.type]}</span>
            {minutes > 0 && <span className="chip">about {minutes} min</span>}
            {viewingOther && <Link className="chip" to="/" style={{ textDecoration: 'none' }}>← Back to today</Link>}
          </div>
        </div>
        {left > 0 && <div className="countdown-big"><b>{left}</b><span>days to the exam</span></div>}
      </section>

      <section className="status-row">
        <Link to="/rewards" className="stat-card s-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="ico"><Icon name="bolt" /></span>
          <div style={{ flex: 1 }}>
            <b>Level {lvl.level}</b><span>{lvl.name} · {xp} XP</span>
            <div className="xpbar"><i style={{ width: `${Math.round(lvl.progress * 100)}%` }} /></div>
          </div>
        </Link>
        <div className="stat-card s-speaking">
          <span className="ico"><Icon name="flame" className={run ? 'flame' : ''} /></span>
          <div><b>{run} day{run === 1 ? '' : 's'}</b><span>streak · {state.unlocked.shields ?? 0} <Icon name="shield" width="12" height="12" /> shields</span></div>
        </div>
        <Link to="/words/study" className="stat-card s-vocab" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="ico"><Icon name="vocab" /></span>
          <div><b>{due}</b><span>words due for review</span></div>
        </Link>
        <div className="stat-card s-reading">
          <span className="ico"><Icon name="check" /></span>
          <div style={{ flex: 1 }}><b>{finished}/{day.tasks.length || 0}</b><span>tasks done today</span>
            <div className="xpbar"><i style={{ width: `${day.tasks.length ? (finished / day.tasks.length) * 100 : 0}%`, background: 'var(--reading)' }} /></div>
          </div>
        </div>
      </section>

      {isDayDone(day, state.done) && (
        <div className="notice ok row">
          <Icon name="sparkle" width="20" height="20" />
          <span><b>Day complete.</b> Today’s insight is unlocked, and you earned a bonus 25 XP.</span>
          <span className="spacer" />
          <Link className="btn sm" to="/rewards">Open rewards</Link>
        </div>
      )}

      {day.type === 'rest' ? (
        <section className="card stack">
          <h2>Rest day</h2>
          <p className="muted">Your brain consolidates what you learned while you rest. If you feel like it, a light, optional activity:</p>
          <div className="row"><Link className="btn" to="/talk">A relaxed conversation</Link><Link className="btn" to="/rewards">Re-read a masterclass</Link></div>
        </section>
      ) : (
        <section>
          <div className="row" style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: 22 }}>Today’s routine</h2>
            <span className="spacer" />
            <button type="button" className="btn ghost sm" onClick={() => setWhy(!why)}>Why this routine?</button>
          </div>
          {why && (
            <div className="notice" style={{ marginBottom: 16 }}>
              High scorers study a little every day rather than a lot once a week. Each day starts with <b>spaced repetition</b> (reviewing words just before you forget them), then a <b>timed skill session</b>, a second skill so that every skill keeps moving (<b>interleaving</b>), some <b>speaking</b> because fluency is built daily, and a look back at <b>mistakes</b>, which teaches more than new practice. Weekly mocks build stamina for the real three hours.
            </div>
          )}
          <div className="timeline">
            {groups.map((g, gi) => {
              const groupDone = g.tasks.every((t) => doneIds.includes(t.id));
              return (
                <div className="block" key={g.block}>
                  <div className="block-head">
                    <span className={`node ${groupDone ? 'done' : ''}`}>{groupDone ? <Icon name="check" width="20" height="20" /> : gi + 1}</span>
                    <div><h3>{g.block}</h3><p>{g.hint}</p></div>
                  </div>
                  <div className="tasks">
                    {g.tasks.map((t) => {
                      const d = describe(t, date);
                      const isDone = doneIds.includes(t.id);
                      return (
                        <article key={t.id} className={`task s-${SKILL_OF[t.kind]} ${isDone ? 'done' : ''}`}>
                          <div className="task__icon"><Icon name={SECTION_ICON[t.kind] || 'practice'} /></div>
                          <div>
                            <p className="kicker" style={{ color: 'var(--c)' }}>{LABEL_OF[t.kind]} · ~{t.minutes} min <span className="xp">+{XP[t.kind] || 10} XP</span></p>
                            <p className="task__title">{d.title}</p>
                            <p className="task__meta">{d.detail}</p>
                          </div>
                          <div className="row actions">
                            <Link className={`btn sm ${isDone ? '' : 'skill'}`} to={d.to}>{isDone ? 'Open' : 'Start'}</Link>
                            <button type="button" className={`check ${isDone ? 'on' : ''}`} aria-pressed={isDone} aria-label={isDone ? 'Mark as not done' : 'Mark as done'}
                              title={isDone ? 'Mark as not done' : 'Mark as done (for work done outside the app)'} onClick={() => toggle(t)}>
                              <Icon name="check" />
                            </button>
                          </div>
                          {floats[t.id] && <span className="xp-float">+{XP[t.kind] || 10} XP</span>}
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {tomorrow && !viewingOther && (
        <section className="card">
          <p className="kicker">Tomorrow · {TYPE[tomorrow.type]}</p>
          <p className="muted small" style={{ marginTop: 6 }}>{tomorrow.tasks.length ? tomorrow.tasks.map((t) => describe(t, tomorrow.date).title).join(' · ') : 'A day off.'}</p>
        </section>
      )}
    </div>
  );
}
