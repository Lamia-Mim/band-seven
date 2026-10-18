import { useEffect, useRef, useState } from 'react';
import { RESOURCES } from '../data/index.js';
import { addFiles, getFile, listFiles, removeFile } from '../lib/files.js';
import { PageHead } from '../components/ui.jsx';
import { Icon } from '../components/icons.jsx';

const size = (b) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} KB`);

export default function Library() {
  const [files, setFiles] = useState([]);
  const [open, setOpen] = useState(null); // { id, url, type, name }
  const [busy, setBusy] = useState(false);
  const input = useRef(null);

  useEffect(() => { listFiles().then(setFiles).catch(() => setFiles([])); }, []);
  useEffect(() => () => open && URL.revokeObjectURL(open.url), [open]);

  async function upload(e) {
    const list = [...e.target.files].filter((f) => f.type === 'application/pdf' || f.type.startsWith('image/'));
    e.target.value = '';
    if (!list.length) return;
    setBusy(true);
    try { setFiles(await addFiles(list)); } finally { setBusy(false); }
  }

  async function view(f) {
    const blob = await getFile(f.id);
    if (!blob) return;
    setOpen({ ...f, url: URL.createObjectURL(blob) }); // the effect above revokes the previous URL
    setTimeout(() => document.getElementById('viewer')?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  async function remove(f) {
    if (!window.confirm(`Delete “${f.name}” from this device?`)) return;
    if (open?.id === f.id) setOpen(null);
    setFiles(await removeFile(f.id));
  }

  return (
    <>
      <PageHead kicker="Your study materials" title="Library" sub="PDFs and images you add are stored in this browser only. They are never uploaded anywhere.">
        <button type="button" className="btn primary" onClick={() => input.current.click()} disabled={busy}><Icon name="upload" />{busy ? 'Adding…' : 'Add PDFs or images'}</button>
        <input ref={input} type="file" accept="application/pdf,image/*" multiple hidden onChange={upload} />
      </PageHead>
      <div className="stack">
        <section className="card stack">
          <h2>Your files</h2>
          {!files.length && <p className="muted">Nothing here yet. Add the Cambridge IELTS books you own, your notes, or photos of your writing. Only add materials you are allowed to use.</p>}
          {files.map((f) => (
            <div className="row" key={f.id} style={{ padding: '8px 0', borderTop: '1px solid var(--line)' }}>
              <span className="chip">{f.type === 'application/pdf' ? 'PDF' : 'Image'}</span>
              <span style={{ flex: '1 1 200px', overflowWrap: 'anywhere' }}>{f.name}</span>
              <span className="muted small">{size(f.size)}</span>
              <button type="button" className="btn sm" onClick={() => view(f)}>Open</button>
              <button type="button" className="btn ghost sm danger" onClick={() => remove(f)} aria-label={`Delete ${f.name}`}><Icon name="trash" /></button>
            </div>
          ))}
        </section>

        {open && (
          <section className="card stack" id="viewer">
            <div className="row"><h2 style={{ overflowWrap: 'anywhere' }}>{open.name}</h2><span className="spacer" />
              <a className="btn sm" href={open.url} target="_blank" rel="noopener noreferrer"><Icon name="external" />Open full screen</a>
              <button type="button" className="btn ghost sm" onClick={() => setOpen(null)}>Close</button>
            </div>
            {open.type === 'application/pdf'
              ? <iframe title={open.name} src={open.url} style={{ width: '100%', height: '78vh', border: 0, borderRadius: 10, background: 'var(--surface-2)' }} />
              : <img src={open.url} alt={open.name} style={{ maxWidth: '100%', borderRadius: 10 }} />}
          </section>
        )}

        <section className="card stack">
          <h2>Free official practice</h2>
          {RESOURCES.map((r) => (
            <a key={r.url} className="row" href={r.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', padding: '6px 0' }}>
              <Icon name="external" width="16" height="16" /><span style={{ color: 'var(--ink)' }}>{r.name}</span><span className="muted small">{r.by}</span>
            </a>
          ))}
        </section>
      </div>
    </>
  );
}
