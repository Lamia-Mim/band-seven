import { useState } from 'react';
import { useStore } from '../lib/store.jsx';
import { addDays, diffDays, todayKey } from '../lib/dates.js';
import { PageHead } from '../components/ui.jsx';

export default function Settings() {
  const { state, saveSettings, importData, resetAll } = useStore();
  const s = state.settings;
  const [form, setForm] = useState(s);
  const [msg, setMsg] = useState('');
  const days = diffDays(form.startDate, form.examDate);
  const valid = days >= 7;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'radio' ? +e.target.value : e.target.value });

  function save(e) {
    e.preventDefault();
    if (!valid) return;
    saveSettings(form);
    setMsg('Saved. Your plan has been rebuilt; tasks you already finished stay finished.');
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
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
      <PageHead title="Settings" />
      <div className="stack" style={{ maxWidth: 640 }}>
        <form className="card stack" onSubmit={save}>
          <h2>Your plan</h2>
          <label className="field">Name<input type="text" value={form.name} onChange={set('name')} /></label>
          <label className="field">Exam date<input type="date" value={form.examDate} min={addDays(form.startDate, 7)} onChange={set('examDate')} /></label>
          <label className="field">Plan start date<input type="date" value={form.startDate} max={addDays(form.examDate, -7)} onChange={set('startDate')} /><small>{valid ? `${days} days of study` : 'The exam must be at least a week after the start.'}</small></label>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack">
            <legend style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Sections per day</legend>
            <label className="choice"><input type="radio" name="load" value="2" checked={form.load === 2} onChange={set('load')} /><span><b>2 sections</b> · about 1 hour</span></label>
            <label className="choice"><input type="radio" name="load" value="4" checked={form.load === 4} onChange={set('load')} /><span><b>All 4 sections</b> · about 2 hours</span></label>
          </fieldset>
          <label className="field">Theme
            <select value={form.theme} onChange={set('theme')}><option value="system">Match my device</option><option value="light">Light</option><option value="dark">Dark</option></select>
          </label>
          <div className="row"><button type="submit" className="btn primary" disabled={!valid}>Save</button>{msg && <span className="muted small">{msg}</span>}</div>
        </form>

        <section className="card stack">
          <h2>Backup</h2>
          <p className="muted">Your progress lives in this browser. To move it to another device, download a backup here and restore it there.</p>
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
