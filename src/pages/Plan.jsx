import { Link } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import { PHASES, phaseRange, summarise } from '../lib/plan.js';
import { isDayDone, completedDays } from '../lib/progress.js';
import { formatDay, fromKey, todayKey } from '../lib/dates.js';
import { PageHead } from '../components/ui.jsx';
import { Icon } from '../components/icons.jsx';

const SHORT = { study: 'Study', review: 'Review', mock: 'Mock', rest: 'Rest', eve: 'Exam eve' };

export default function Plan() {
  const { state, plan } = useStore();
  const today = todayKey();
  const total = completedDays(plan, state.done);
  const s = summarise(plan);
  const s2 = plan.settings;

  return (
    <>
      <PageHead kicker={`${plan.n} days · ${s2.minutes} min a day · ${s2.daysPerWeek} days a week`} title={`Your journey to Band ${s2.target}`}
        sub={`From ${formatDay(plan.startDate)} to your exam on ${formatDay(plan.examDate, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}. ${total} days complete.`}>
        <Link className="btn" to="/settings"><Icon name="edit" />Change plan</Link>
      </PageHead>
      <div className="stack">
        <div className="summary-grid">
          <div><b>{s.study}</b><span>study days</span></div>
          <div><b>{s.mocks}</b><span>mock days</span></div>
          <div><b>{s.words}</b><span>new words</span></div>
          <div><b>{s.rest}</b><span>rest days</span></div>
        </div>
        <div className="journey">
          {PHASES.map((p) => {
            const r = phaseRange(plan, p.id);
            if (r.empty) return null;
            const days = plan.days.slice(r.start, r.end + 1);
            const when = today > r.endDate ? 'past' : today >= r.startDate ? 'current' : 'future';
            // weeks, Monday first
            const lead = (fromKey(days[0].date).getDay() + 6) % 7;
            const cells = [...Array(lead).fill(null), ...days];
            const weeks = [];
            for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
            return (
              <section className={`station ${when}`} key={p.id}>
                <div className="station-head">
                  <span className="station-num">{when === 'past' ? <Icon name="check" width="22" height="22" /> : p.id}</span>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <h2 style={{ fontSize: 20 }}>{p.name}{when === 'current' && <span className="chip accent" style={{ marginLeft: 8 }}>you are here</span>}</h2>
                    <p className="muted small">{p.focus}</p>
                  </div>
                  <span className="chip">{formatDay(r.startDate, { day: 'numeric', month: 'short' })} – {formatDay(r.endDate, { day: 'numeric', month: 'short' })}</span>
                </div>
                <div className="weeks">
                  <div className="week"><span />{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} style={{ textAlign: 'center' }}>{d}</span>)}</div>
                  {weeks.map((w, wi) => (
                    <div className="week" key={wi}>
                      <span>Week {Math.floor((w.find(Boolean).index) / 7) + 1}</span>
                      {w.map((d, i) => {
                        if (!d) return <span key={i} />;
                        const doneCount = (state.done[d.date] || []).filter((id) => d.tasks.some((t) => t.id === id)).length;
                        const status = d.type === 'rest' ? '' : isDayDone(d, state.done) ? 'done' : state.shielded.includes(d.date) ? 'shielded' : doneCount ? 'partial' : d.date < today ? 'missed' : '';
                        return (
                          <Link key={d.date} to={d.date === today ? '/' : `/?date=${d.date}`} className={`dot ${d.type} ${status} ${d.date === today ? 'today' : ''}`}
                            title={`${formatDay(d.date)} · ${SHORT[d.type]}`} aria-label={`${formatDay(d.date)}: ${SHORT[d.type]} day, ${doneCount} of ${d.tasks.length} tasks done`}>
                            {fromKey(d.date).getDate()}
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
        <div className="legend">
          <span><i style={{ background: 'var(--ok)' }} />finished</span>
          <span><i style={{ background: 'var(--warn-soft)' }} />started</span>
          <span><i style={{ background: 'var(--bad-soft)' }} />missed</span>
          <span><i style={{ background: 'color-mix(in srgb, var(--vocab) 25%, transparent)' }} />shielded</span>
          <span><i style={{ background: 'color-mix(in srgb, var(--speaking) 20%, transparent)' }} />mock</span>
          <span><i style={{ border: '2px dashed var(--line-2)' }} />rest</span>
        </div>
      </div>
    </>
  );
}
