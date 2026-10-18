// Draws a Writing Task 1 visual from data: line graph, bar chart, pie charts,
// table or process diagram.

const COLORS = ['#1f4fd6', '#e8553d', '#0f8a5f', '#b7791f', '#7c3aed'];

function Legend({ names }) {
  return (
    <div className="row small" style={{ justifyContent: 'center', marginTop: 8 }}>
      {names.map((n, i) => (
        <span key={n} className="row" style={{ gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[i % COLORS.length], display: 'inline-block' }} />{n}
        </span>
      ))}
    </div>
  );
}

function Axes({ W, H, m, max, step, labels, unit, children }) {
  const y = (v) => H - m.b - (v / max) * (H - m.t - m.b);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Chart">
      {Array.from({ length: Math.round(max / step) + 1 }, (_, i) => {
        const v = step * i;
        return (
          <g key={i}>
            <line x1={m.l} x2={W - m.r} y1={y(v)} y2={y(v)} stroke="currentColor" opacity="0.12" />
            <text x={m.l - 8} y={y(v) + 4} textAnchor="end">{Math.round(v)}</text>
          </g>
        );
      })}
      {labels.map((l, i) => (
        <text key={l} x={m.l + ((i + 0.5) * (W - m.l - m.r)) / labels.length} y={H - m.b + 18} textAnchor="middle">{l}</text>
      ))}
      <text x={m.l} y={10} textAnchor="start">{unit}</text>
      {children(y)}
    </svg>
  );
}

export default function Chart({ item }) {
  const { chart, labels = [], series = [], unit } = item;

  if (chart === 'process') {
    return <ol className="process">{item.steps.map((s) => <li key={s}>{s}</li>)}</ol>;
  }

  if (chart === 'table') {
    return (
      <div style={{ overflowX: 'auto' }}>
        <table className="data">
          <thead><tr><th>{unit}</th>{labels.map((l) => <th key={l}>{l}</th>)}</tr></thead>
          <tbody>{series.map((s) => <tr key={s.name}><td><b>{s.name}</b></td>{s.values.map((v, i) => <td key={i}>{v}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
  }

  if (chart === 'pie') {
    return (
      <div>
        <div className="grid2">
          {series.map((s) => {
            const total = s.values.reduce((a, b) => a + b, 0);
            let angle = -Math.PI / 2;
            return (
              <figure key={s.name} style={{ margin: 0, textAlign: 'center' }}>
                <svg className="chart" viewBox="-110 -110 220 220" style={{ maxWidth: 260, margin: '0 auto' }} role="img" aria-label={`Pie chart ${s.name}`}>
                  {s.values.map((v, i) => {
                    const a0 = angle, a1 = angle + (v / total) * 2 * Math.PI;
                    angle = a1;
                    const large = a1 - a0 > Math.PI ? 1 : 0;
                    const mid = (a0 + a1) / 2;
                    return (
                      <g key={i}>
                        <path d={`M0 0 L${100 * Math.cos(a0)} ${100 * Math.sin(a0)} A100 100 0 ${large} 1 ${100 * Math.cos(a1)} ${100 * Math.sin(a1)} Z`} fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth="1.5" />
                        <text x={64 * Math.cos(mid)} y={64 * Math.sin(mid) + 4} textAnchor="middle" style={{ fill: '#fff', fontWeight: 700 }}>{v}%</text>
                      </g>
                    );
                  })}
                </svg>
                <figcaption><b>{s.name}</b></figcaption>
              </figure>
            );
          })}
        </div>
        <Legend names={labels} />
      </div>
    );
  }

  const W = 640, H = 330, m = { l: 44, r: 12, t: 22, b: 34 };
  // a round step (1, 2, 5, 10, 20, 25, 50…) giving about six gridlines
  const peak = Math.max(...series.flatMap((s) => s.values), 1);
  const step = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000].find((s) => s >= peak / 6) || 1000;
  const max = Math.ceil(peak / step) * step;
  const slot = (W - m.l - m.r) / labels.length;

  if (chart === 'bar') {
    const bw = (slot * 0.7) / series.length;
    return (
      <div>
        <Axes W={W} H={H} m={m} max={max} step={step} labels={labels} unit={unit}>
          {(y) => series.map((s, si) => s.values.map((v, i) => (
            <rect key={`${si}-${i}`} x={m.l + i * slot + slot * 0.15 + si * bw} y={y(v)} width={bw - 2} height={H - m.b - y(v)} fill={COLORS[si % COLORS.length]} rx="2" />
          )))}
        </Axes>
        <Legend names={series.map((s) => s.name)} />
      </div>
    );
  }

  return (
    <div>
      <Axes W={W} H={H} m={m} max={max} step={step} labels={labels} unit={unit}>
        {(y) => series.map((s, si) => {
          const pts = s.values.map((v, i) => `${m.l + (i + 0.5) * slot},${y(v)}`);
          return (
            <g key={s.name}>
              <polyline points={pts.join(' ')} fill="none" stroke={COLORS[si % COLORS.length]} strokeWidth="2.5" />
              {s.values.map((v, i) => <circle key={i} cx={m.l + (i + 0.5) * slot} cy={y(v)} r="3.5" fill={COLORS[si % COLORS.length]} />)}
            </g>
          );
        })}
      </Axes>
      <Legend names={series.map((s) => s.name)} />
    </div>
  );
}
