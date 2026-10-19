import { useState } from 'react';
import { useStore } from '../lib/store.jsx';
import { DEFAULT_SETTINGS } from '../lib/plan.js';
import { addDays, diffDays, todayKey } from '../lib/dates.js';
import { ExamDate, LevelTarget, PlanPreview, SkillRatings, TimeBudget } from '../components/PlanForm.jsx';
import { Icon } from '../components/icons.jsx';
import { confetti } from '../lib/confetti.js';

const STEPS = [
  { title: 'Hi! Let’s build a plan that fits you', sub: 'Two minutes of questions, then a day-by-day plan to your exam.' },
  { title: 'When is your exam?', sub: 'The plan uses every day you have, and shortens the basics if time is tight.' },
  { title: 'Your level and your goal', sub: 'This decides how much time goes on foundations.' },
  { title: 'How do your skills feel?', sub: 'Be honest: the plan gives your weakest skills the most practice.' },
  { title: 'How much time can you give?', sub: 'Pick what you can keep up every day. Consistency beats long sessions.' },
  { title: 'Your personal plan', sub: 'Here is what the next weeks look like. You can change it any time in Settings.' },
];

export default function Onboarding() {
  const { saveSettings } = useStore();
  const today = todayKey();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ ...DEFAULT_SETTINGS, name: '', startDate: today, examDate: addDays(today, 84), theme: 'system' });
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const valid = diffDays(form.startDate, form.examDate) >= 7;
  const last = step === STEPS.length - 1;

  function next() {
    if (!last) { setStep(step + 1); return; }
    saveSettings({ ...form, name: form.name.trim() });
    confetti();
  }

  return (
    <div className="onboard">
      <form className="wizard" onSubmit={(e) => { e.preventDefault(); if (valid) next(); }}>
        <div className="row">
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width="40" height="40" style={{ borderRadius: 12 }} />
          <b style={{ fontFamily: 'var(--display)', fontSize: 20 }}>Band Seven</b>
          <span className="spacer" />
          <span className="small muted">{step + 1} / {STEPS.length}</span>
        </div>
        <div className="steps-dots" aria-hidden="true">{STEPS.map((_, i) => <i key={i} className={i <= step ? 'on' : ''} />)}</div>
        <div>
          <h1>{STEPS[step].title}</h1>
          <p className="muted" style={{ marginTop: 6 }}>{STEPS[step].sub}</p>
        </div>

        {step === 0 && (
          <label className="field">What should we call you?
            <input type="text" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Your name" autoComplete="given-name" autoFocus />
          </label>
        )}
        {step === 1 && <ExamDate form={form} set={set} />}
        {step === 2 && <LevelTarget form={form} set={set} />}
        {step === 3 && <SkillRatings form={form} set={set} />}
        {step === 4 && <TimeBudget form={form} set={set} />}
        {step === 5 && <PlanPreview form={form} />}

        <div className="row">
          {step > 0 && <button type="button" className="btn ghost" onClick={() => setStep(step - 1)}>Back</button>}
          <span className="spacer" />
          <button type="submit" className="btn primary lg" disabled={!valid}>{last ? <><Icon name="sparkle" />Start my plan</> : 'Continue'}</button>
        </div>
        {step === 0 && <p className="small muted">Free, no account. Everything stays on this device.</p>}
      </form>
    </div>
  );
}
