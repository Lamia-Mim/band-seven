// Raw score (out of 40) → band, using the conversion tables commonly published
// for practice tests. The exact table varies a little from test to test, so
// these bands are estimates.

const LISTENING = [[39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6], [18, 5.5], [16, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [0, 0]];
const READING_ACADEMIC = [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [0, 0]];

export function bandFor(section, raw, total = 40) {
  const table = section === 'listening' ? LISTENING : READING_ACADEMIC;
  const scaled = Math.round((raw / total) * 40); // a single passage or section counts as a share of 40
  return table.find(([min]) => scaled >= min)[1];
}

// Overall band: the average of the four, rounded to the nearest half band
// (a .25 rounds up to .5 and a .75 up to the next whole band).
export function overallBand(bands) {
  const avg = bands.reduce((a, b) => a + b, 0) / bands.length;
  return Math.floor(avg * 2 + 0.5 + 1e-9) / 2;
}
