import { useState } from 'react';
import { useStore } from '../lib/store.jsx';
import { diffDays, todayKey } from '../lib/dates.js';
import { PageHead } from '../components/ui.jsx';
import { ExamDate, LevelTarget, PlanPreview, SkillRatings, TimeBudget } from '../components/PlanForm.jsx';
import { useAi } from '../components/ai/Ai.jsx';
import { providerName } from '../lib/ai/providers.js';
import { Icon } from '../components/icons.jsx';

export default function Settings() {
  const { state, saveSettings, saveAi, importData, resetAll } = useStore();
  const { openSetup, ai, ready } = useAi();
  const [form, setForm] = useState(state.settings);
  const [msg, setMsg] = useState('');
  const set = (patch) => { setForm((f) => ({ ...f, ...patch })); setMsg(''); };
  const valid = diffDays(form.startDate, form.examDate) >= 7;

  function save(e) {
    e.preventDefault();
    if (!valid) return;
    // theme and AI are saved separately; don't overwrite them with this form's copy
    saveSettings({ ...form, theme: state.settings.theme, ai: state.settings.ai });
    setMsg('Saved. Your plan has been rebuilt; tasks you already finished stay finished.');
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({ ...state, settings: { ...state.settings, ai: { ...state.settings.ai, geminiKey: undefined, claudeKey: undefined } } }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `band-seven-backup-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function importFile(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data.settings || !data.done) throw new Error('not a backup');
      if (window.confirm('Replace everything on this device with this backup?')) { importData(data); setForm(data.settings); setMsg('Backup restored.'); }
    } catch { setMsg('That file is not a Band Seven backup.'); }
  }

  return (
    <>
      <PageHead title="Settings" sub="Change your plan, your AI tutor and how the app looks." />
      <div className="stack" style={{ maxWidth: 720, gap: 20 }}>
        <form className="card stack" onSubmit={save}>
          <h2>Your plan</h2>
          <label className="field">Name<input type="text" value={form.name || ''} onChange={(e) => set({ name: e.target.value })} /></label>
          <div className="stack" style={{ gap: 6 }}><b>Exam date</b><ExamDate form={form} set={set} /></div>
          <LevelTarget form={form} set={set} />
          <div className="stack" style={{ gap: 6 }}><b>Skill ratings</b><SkillRatings form={form} set={set} /></div>
          <div className="stack" style={{ gap: 6 }}><b>Daily time</b><TimeBudget form={form} set={set} /></div>
          <details><summary className="small" style={{ cursor: 'pointer' }}>Preview the plan</summary><div style={{ marginTop: 12 }}><PlanPreview form={form} /></div></details>
          <div className="row"><button type="submit" className="btn primary" disabled={!valid}>Save and rebuild plan</button>{msg && <span className="muted small">{msg}</span>}</div>
        </form>

        <section className="card stack">
          <h2>AI tutor</h2>
          <div className="row">
            <span className={`chip ${ready ? 'ok' : ''}`}><Icon name="sparkle" width="14" />{ready ? providerName(ai) : 'Not set up'}</span>
            <span className="spacer" />
            <button type="button" className="btn" onClick={openSetup}>{ready ? 'Change' : 'Set up'}</button>
            {ready && <button type="button" className="btn ghost danger" onClick={() => saveAi({ provider: null, geminiKey: '', claudeKey: '' })}>Turn off and remove keys</button>}
          </div>
          <p className="small muted">The on-device option is free and private. Gemini needs a free key; Claude needs your own paid key. Keys stay in this browser and are not included in backups.</p>
        </section>

        <section className="card stack">
          <h2>Appearance</h2>
          <div className="seg">
            {[['system', 'Match device'], ['light', 'Light'], ['dark', 'Dark']].map(([v, l]) => (
              <button key={v} type="button" aria-pressed={(state.settings.theme || 'system') === v} onClick={() => saveSettings({ theme: v })}>{l}</button>
            ))}
          </div>
        </section>

        <section className="card stack">
          <h2>Backup</h2>
          <p className="muted">Your progress lives in this browser. To use another device, download a backup here and restore it there.</p>
          <div className="row">
            <button type="button" className="btn" onClick={exportData}>Download backup</button>
            <label className="btn">Restore backup<input type="file" accept="application/json" hidden onChange={importFile} /></label>
          </div>
        </section>

        <section className="card stack">
          <h2>Start over</h2>
          <p className="muted">Deletes your plan, progress, words and rewards from this device. Library files are kept.</p>
          <div><button type="button" className="btn danger" onClick={() => window.confirm('Delete all progress on this device? This cannot be undone.') && resetAll()}>Delete all progress</button></div>
        </section>
      </div>
    </>
  );
}
