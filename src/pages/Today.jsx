import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import { dayOf, PHASES } from '../lib/plan.js';
import { describe, SECTION_OF } from '../lib/tasks.js';
import { isDayDone, streak } from '../lib/progress.js';
import { addDays, diffDays, formatDay, todayKey } from '../lib/dates.js';
import { Icon, SECTION_ICON } from '../components/icons.jsx';
import { Ring } from '../components/ui.jsx';
import { TIPS } from '../data/rewards.js';

const TYPE = { study: 'Study day', review: 'Review day', mock: 'Mock test day', rest: 'Rest day before the exam' };

export default function Today() {
  const { state, plan, completeTask, undoTask } = useStore();
  const { search } = useLocation();
  const today = todayKey();
  const date = new URLSearchParams(search).get('date') || today;
  const day = dayOf(plan, date);
  const name = state.settings.name;
  const left = diffDays(today, state.settings.examDate);
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (!day) {
    const before = date < plan.startDate;
    return (
      <>
        <header className="head"><div><p className="kicker">{formatDay(date, { weekday: 'long', day: 'numeric', month: 'long' })}</p><h1>{date >= plan.examDate ? (date === plan.examDate ? 'Exam day. Good luck!' : 'Your plan is complete') : before ? 'Your plan hasn’t started yet' : 'No tasks'}</h1></div></header>
        <div className="card stack">
          {date === plan.examDate
            ? <p>Read every instruction, watch the time, and trust your preparation. You have done the work.</p>
            : date > plan.examDate
              ? <p>Well done for finishing. If you have another test coming, set a new exam date in <Link to="/settings">Settings</Link> to build a fresh plan.</p>
              : <p>Your plan starts on {formatDay(plan.startDate)}.</p>}
          <div className="row"><Link className="btn" to="/rewards">Your rewards</Link><Link className="btn" to="/practice">Free practice</Link></div>
        </div>
      </>
    );
  }

  const phase = PHASES[day.phase - 1];
  const doneIds = state.done[date] || [];
  const finished = day.tasks.filter((t) => doneIds.includes(t.id)).length;
  const complete = isDayDone(day, state.done);
  const run = streak(plan, state.done, today);
  const tomorrow = dayOf(plan, addDays(date, 1));
  const viewingOther = date !== today;

  return (
    <>
      <header className="head">
        <div>
          <p className="kicker">{formatDay(date, { weekday: 'long', day: 'numeric', month: 'long' })}{viewingOther ? '' : ` · day ${day.index + 1} of ${plan.n}`}</p>
          <h1>{viewingOther ? `Plan for ${formatDay(date)}` : `${hello}${name ? `, ${name}` : ''}`}</h1>
        </div>
        {viewingOther && <Link className="btn sm" to="/">Back to today</Link>}
      </header>

      <div className="stack">
        <section className="card raised hero-today">
          <div className="stack" style={{ gap: 8 }}>
            <div className="row"><span className="chip accent">Phase {day.phase} · {phase.name}</span><span className="chip">{TYPE[day.type]}</span></div>
            <p className="muted">{phase.focus}</p>
            <div className="row small">
              {left > 0 && <span><b>{left}</b> days to the exam</span>}
              <span>· <b>{run}</b>-day streak</span>
              <span>· <b>{state.unlocked.tips}</b>/{TIPS.length} cards unlocked</span>
            </div>
          </div>
          <Ring value={finished} total={day.tasks.length} />
        </section>

        {complete && (
          <div className="notice ok row">
            <Icon name="star" width="20" height="20" />
            <span><b>Day complete.</b> Your Examiner Secret card for today is unlocked.</span>
            <span className="spacer" />
            <Link className="btn sm" to="/rewards">Open rewards</Link>
          </div>
        )}

        <section className="tasks" aria-label="Tasks">
          {day.tasks.map((t) => {
            const d = describe(t, date);
            const isDone = doneIds.includes(t.id);
            return (
              <article key={t.id} className={`task ${isDone ? 'done' : ''}`}>
                <div className="task__icon"><Icon name={SECTION_ICON[t.kind] || 'practice'} /></div>
                <div>
                  <p className="kicker">{SECTION_OF[t.kind]}</p>
                  <p className="task__title">{d.title}</p>
                  <p className="task__meta">{d.detail} · ~{d.minutes} min</p>
                </div>
                <div className="row actions">
                  <Link className={`btn sm ${isDone ? '' : 'primary'}`} to={d.to}>{isDone ? 'Open' : 'Start'}</Link>
                  <button type="button" className={`check ${isDone ? 'on' : ''}`} aria-pressed={isDone} aria-label={isDone ? 'Mark as not done' : 'Mark as done'}
                    title={isDone ? 'Mark as not done' : 'Mark as done (for work done outside the app)'}
                    onClick={() => (isDone ? undoTask(date, t.id) : completeTask(date, t.id))}>
                    <Icon name="check" />
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        {tomorrow && !viewingOther && (
          <section className="card">
            <p className="kicker">Tomorrow · {TYPE[tomorrow.type]}</p>
            <p className="muted small" style={{ marginTop: 6 }}>{tomorrow.tasks.map((t) => describe(t, tomorrow.date).title).join(' · ')}</p>
          </section>
        )}
      </div>
    </>
  );
}
