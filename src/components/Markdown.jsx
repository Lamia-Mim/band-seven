// Renders the small subset of Markdown the AI writes (headings, lists, bold,
// italics) as React elements. Never uses innerHTML, so AI text can't inject markup.

function inline(text, key) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g;
  let last = 0, m, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith('**')) out.push(<b key={`${key}-${i++}`}>{t.slice(2, -2)}</b>);
    else if (t.startsWith('`')) out.push(<code key={`${key}-${i++}`}>{t.slice(1, -1)}</code>);
    else out.push(<i key={`${key}-${i++}`}>{t.slice(1, -1)}</i>);
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function Markdown({ text }) {
  const blocks = [];
  let list = null;
  const flush = () => { if (list) { blocks.push(list); list = null; } };
  text.split('\n').forEach((raw, n) => {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (bullet) {
      const ordered = /^\s*\d/.test(line);
      if (!list || list.ordered !== ordered) { flush(); list = { ordered, items: [] }; }
      list.items.push(bullet[1]);
      return;
    }
    flush();
    if (!line.trim()) return;
    const h = line.match(/^#{1,6}\s+(.*)$/);
    blocks.push(h ? { h: h[1], n } : { p: line, n });
  });
  flush();
  return (
    <div className="md">
      {blocks.map((b, i) => {
        if (b.items) {
          const L = b.ordered ? 'ol' : 'ul';
          return <L key={i}>{b.items.map((it, j) => <li key={j}>{inline(it, `${i}-${j}`)}</li>)}</L>;
        }
        if (b.h) return <h4 key={i}>{inline(b.h, i)}</h4>;
        return <p key={i}>{inline(b.p, i)}</p>;
      })}
    </div>
  );
}
