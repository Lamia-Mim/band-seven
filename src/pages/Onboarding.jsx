import { useState } from 'react';
import { useStore } from '../lib/store.jsx';
import { addDays, diffDays, formatDay, todayKey } from '../lib/dates.js';

export default function Onboarding() {
  const { saveSettings } = useStore();
  const today = todayKey();
  const [name, setName] = useState('');
  const [examDate, setExamDate] = useState(addDays(today, 84));
  const [load, setLoad] = useState(2);
  const days = diffDays(today, examDate);
  const valid = days >= 7;

  function start(e) {
    e.preventDefault();
    if (valid) saveSettings({ name: name.trim(), examDate, startDate: today, load, theme: 'system' });
  }

  return (
    <div className="onboard">
      <form className="card raised" onSubmit={start}>
        <div className="row"><img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width="40" height="40" /><p className="kicker">Band Seven · IELTS Academic</p></div>
        <h1>Let’s build your study plan</h1>
        <p className="muted">Tell us when your exam is. You’ll get a daily list of tasks across all four sections, with a reward every time you finish a day.</p>

        <label className="field">Your name <small>Optional, for greetings</small>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Lamia" autoComplete="given-name" />
        </label>

        <label className="field">Exam date
          <input type="date" value={examDate} min={addDays(today, 7)} onChange={(e) => setExamDate(e.target.value)} required />
          <small>{valid ? `${days} days from today · ${formatDay(examDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}. No date yet? Keep the default 12 weeks.` : 'Choose a date at least a week from today.'}</small>
        </label>

        <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="field" style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Sections per day</legend>
          <label className="choice"><input type="radio" name="load" checked={load === 2} onChange={() => setLoad(2)} />
            <span><b>2 sections a day</b><br /><span className="muted small">Reading + Speaking one day, Listening + Writing the next, plus vocabulary. About 1 hour.</span></span>
          </label>
          <label className="choice"><input type="radio" name="load" checked={load === 4} onChange={() => setLoad(4)} />
            <span><b>All 4 sections every day</b><br /><span className="muted small">Reading, Listening, Writing and Speaking daily, plus vocabulary. About 2 hours.</span></span>
          </label>
        </fieldset>

        <button type="submit" className="btn primary lg" disabled={!valid}>Create my plan</button>
        <p className="muted small">Everything stays on this device. You can change these later in Settings.</p>
      </form>
    </div>
  );
}
