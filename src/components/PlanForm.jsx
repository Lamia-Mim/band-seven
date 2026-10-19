// The controls that personalise a plan, shared by onboarding and Settings
import { buildPlan, summarise, SKILLS } from '../lib/plan.js';
import { addDays, diffDays, formatDay, todayKey } from '../lib/dates.js';
import { POOLS } from '../data/index.js';

const SKILL_LABEL = { reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking' };
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ExamDate({ form, set }) {
  const today = todayKey();
  const days = diffDays(form.startDate, form.examDate);
  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="row">
        {[28, 56, 84].map((d) => (
          <button key={d} type="button" className={`btn sm ${diffDays(today, form.examDate) === d ? 'primary' : ''}`} onClick={() => set({ examDate: addDays(today, d) })}>In {d / 7} weeks</button>
        ))}
      </div>
      <input type="date" value={form.examDate} min={addDays(form.startDate, 7)} onChange={(e) => set({ examDate: e.target.value })} aria-label="Exam date" />
      <p className="small muted">{days >= 7 ? <><b>{days} days</b> to prepare · {formatDay(form.examDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</> : 'Choose a date at least a week away.'}</p>
    </div>
  );
}

export function LevelTarget({ form, set }) {
  return (
    <div className="stack">
      <div className="stack" style={{ gap: 8 }}>
        <p style={{ fontWeight: 600 }}>Where are you now?</p>
        {[['low', 'Just starting', 'Around Band 5 or not sure'], ['mid', 'Getting there', 'Around Band 5.5–6'], ['high', 'Almost there', 'Around Band 6.5 already']].map(([v, t, d]) => (
          <label key={v} className="choice"><input type="radio" name="level" checked={form.level === v} onChange={() => set({ level: v })} /><span><b>{t}</b><br /><span className="small muted">{d}</span></span></label>
        ))}
      </div>
      <div className="stack" style={{ gap: 8 }}>
        <p style={{ fontWeight: 600 }}>Your target band</p>
        <div className="seg">{[6, 6.5, 7, 7.5, 8].map((b) => <button key={b} type="button" aria-pressed={form.target === b} onClick={() => set({ target: b })}>{b}</button>)}</div>
      </div>
    </div>
  );
}

export function SkillRatings({ form, set }) {
  return (
    <div className="stack" style={{ gap: 10 }}>
      <p className="small muted">1 = hardest for me, 5 = strongest. Weaker skills get more sessions.</p>
      {SKILLS.map((k) => (
        <div key={k} className={`rating s-${k}`}>
          <b style={{ color: 'var(--c)' }}>{SKILL_LABEL[k]}</b>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" aria-pressed={form.ratings[k] === n} aria-label={`${SKILL_LABEL[k]} ${n}`} onClick={() => set({ ratings: { ...form.ratings, [k]: n } })}>{n}</button>
          ))}
        </div>
      ))}
    </div>
  );
}

export function TimeBudget({ form, set }) {
  return (
    <div className="stack">
      <div className="grid2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
        {[[30, 'Light', '1 skill + words'], [60, 'Steady', '2 skills + speaking'], [90, 'Serious', '3 skills + review'], [120, 'Intensive', 'All 4 skills']].map(([m, t, d]) => (
          <label key={m} className="choice" style={{ flexDirection: 'column', gap: 2 }}>
            <input type="radio" name="minutes" checked={form.minutes === m} onChange={() => set({ minutes: m })} hidden />
            <b style={{ fontFamily: 'var(--display)', fontSize: 22 }}>{m} min</b><span>{t}</span><span className="small muted">{d}</span>
          </label>
        ))}
      </div>
      <div className="row">
        <span style={{ fontWeight: 600 }}>Days a week</span>
        <div className="seg">{[5, 6, 7].map((d) => <button key={d} type="button" aria-pressed={form.daysPerWeek === d} onClick={() => set({ daysPerWeek: d })}>{d}</button>)}</div>
        {form.daysPerWeek < 7 && (
          <label className="row small">Day off{form.daysPerWeek === 5 ? 's start' : ''}
            <select value={form.restDay} onChange={(e) => set({ restDay: +e.target.value })} style={{ width: 'auto' }}>
              {WEEKDAYS.map((w, i) => <option key={w} value={i}>{w}</option>)}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}

export function PlanPreview({ form }) {
  if (diffDays(form.startDate, form.examDate) < 7) return null;
  const s = summarise(buildPlan(form, POOLS));
  const max = Math.max(...Object.values(s.sessions), 1);
  return (
    <div className="stack">
      <div className="summary-grid">
        <div><b>{s.study}</b><span>study days</span></div>
        <div><b>{s.mocks}</b><span>mock test days</span></div>
        <div><b>{s.words}</b><span>new words</span></div>
        <div><b>{s.rest}</b><span>rest days</span></div>
      </div>
      <div className="stack" style={{ gap: 8 }}>
        {SKILLS.map((k) => (
          <div key={k} className={`row s-${k}`} style={{ gap: 10 }}>
            <span style={{ width: 80, fontSize: 13.5, fontWeight: 600 }}>{SKILL_LABEL[k]}</span>
            <div className="xpbar" style={{ flex: 1, height: 10 }}><i style={{ width: `${(s.sessions[k] / max) * 100}%`, background: 'var(--c)' }} /></div>
            <span className="small muted" style={{ minWidth: 84, whiteSpace: 'nowrap', textAlign: 'right' }}>{s.sessions[k]} sessions</span>
          </div>
        ))}
      </div>
    </div>
  );
}
