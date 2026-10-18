// Dates are handled as local "YYYY-MM-DD" keys, so a study day never shifts
// because of time zones or daylight saving.

const DAY = 86400000;

export function toKey(d) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const todayKey = () => toKey(new Date());

export function addDays(key, n) {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

// Whole days from a to b (b - a)
export function diffDays(a, b) {
  return Math.round((fromKey(b) - fromKey(a)) / DAY);
}

export function formatDay(key, opts = { weekday: 'short', day: 'numeric', month: 'short' }) {
  return fromKey(key).toLocaleDateString('en-GB', opts);
}
