import { Link } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import { PHASES, phaseRange } from '../lib/plan.js';
import { isDayDone, completedDays } from '../lib/progress.js';
import { formatDay, fromKey, todayKey } from '../lib/dates.js';
import { PageHead } from '../components/ui.jsx';

const SHORT = { study: 'Study', review: 'Review', mock: 'Mock', rest: 'Rest' };

export default function Plan() {
  const { state, plan } = useStore();
  const today = todayKey();
  const total = completedDays(plan, state.done);

  return (
    <>
      <PageHead kicker={`${plan.n} days · ${state.settings.load} sections a day`} title="Your plan"
        sub={`From ${formatDay(plan.startDate)} to your exam on ${formatDay(plan.examDate, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}. ${total} of ${plan.n} days complete.`} />
      <div className="stack">
        {PHASES.map((p) => {
          const r = phaseRange(plan, p.id);
          const days = plan.days.slice(r.start, r.end + 1);
          if (!days.length) return null;
          // pad the first week so days line up under their weekday (Mon first)
          const lead = (fromKey(days[0].date).getDay() + 6) % 7;
          return (
            <section className="card phase" key={p.id}>
              <div className="row">
                <h2>Phase {p.id} · {p.name}</h2>
                <span className="spacer" />
                <span className="chip">{formatDay(r.startDate, { day: 'numeric', month: 'short' })} – {formatDay(r.endDate, { day: 'numeric', month: 'short' })}</span>
              </div>
              <p className="muted" style={{ marginTop: 4 }}>{p.focus}</p>
              <div className="days" style={{ marginTop: 12 }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <span key={d} className="kicker" style={{ textAlign: 'center' }}>{d}</span>)}
                {Array.from({ length: lead }, (_, i) => <span key={`pad${i}`} />)}
                {days.map((d) => {
                  const doneCount = (state.done[d.date] || []).filter((id) => d.tasks.some((t) => t.id === id)).length;
                  const status = isDayDone(d, state.done) ? 'done' : doneCount ? 'partial' : d.date < today ? 'missed' : '';
                  return (
                    <Link key={d.date} to={d.date === today ? '/' : `/?date=${d.date}`} className={`day ${status} ${d.date === today ? 'today' : ''}`}
                      aria-label={`${formatDay(d.date)}: ${SHORT[d.type]} day, ${doneCount} of ${d.tasks.length} tasks done`}>
                      <b>{fromKey(d.date).getDate()}</b>
                      <span className="type">{SHORT[d.type]}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
        <p className="muted small">Green: finished · amber: started · red: missed · outlined: today. Tap a day to see its tasks.</p>
      </div>
    </>
  );
}
