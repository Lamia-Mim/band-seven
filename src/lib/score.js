// Marking for Reading and Listening question groups.
// Gap answers ignore case, extra spaces and trailing punctuation, but spelling
// must be right, as in the real test.

export const normalise = (s) => String(s ?? '').toLowerCase().replace(/[“”"’']/g, "'").replace(/\s+/g, ' ').trim().replace(/[.,;:!?]+$/g, '').trim();

// Value stored for an option in a "choose" group: the roman numeral of a
// heading ("ii  Using the sky…" → "ii"), otherwise the option itself
export const optionValue = (opt) => opt.match(/^([ivx]+)\s{2}/)?.[1] ?? opt;

export function isCorrect(group, item, given) {
  if (given == null || given === '') return false;
  if (group.type === 'gap') return item.answer.some((a) => normalise(a) === normalise(given));
  return String(given) === String(item.answer);
}

export function scoreGroups(groups, answers) {
  const results = [];
  for (const g of groups) {
    for (const item of g.items) {
      const given = answers[item.n];
      results.push({
        n: item.n,
        prompt: item.prompt,
        given: given ?? '',
        answer: g.type === 'gap' ? item.answer[0] : g.type === 'mcq' ? `${item.answer}) ${item.options[item.answer.charCodeAt(0) - 65]}` : item.answer,
        correct: isCorrect(g, item, given),
      });
    }
  }
  return { raw: results.filter((r) => r.correct).length, total: results.length, results };
}
