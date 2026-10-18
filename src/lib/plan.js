// Builds the whole study plan from the settings: one entry per day from the
// start date to the day before the exam, each with its tasks.
//
// Pure: depends only on the settings and on how much content exists, so the
// same settings always give the same plan (and the tests can check it).
//
// A task is { id, kind, ref, variant }: what to do and which piece of content.
// Titles and links are added by tasks.js, which knows the content.

import { addDays, diffDays } from './dates.js';

export const PHASES = [
  { id: 1, name: 'Foundation', share: 0.26, focus: 'Grammar basics, the test format and your first vocabulary.' },
  { id: 2, name: 'Skill building', share: 0.35, focus: 'Every question type, with a strategy for each section.' },
  { id: 3, name: 'Exam practice', share: 0.26, focus: 'Timed sections and a full mock test every week.' },
  { id: 4, name: 'Final stretch', share: 0.13, focus: 'Two mocks a week, your weak spots, and rest before the exam.' },
];

export const NEW_WORDS_PER_DAY = 15;

// pools: how many items of each kind of content exist
export function buildPlan(settings, pools) {
  const n = Math.max(1, diffDays(settings.startDate, settings.examDate));
  let acc = 0;
  const ends = PHASES.map((p, i) => {
    acc += p.share;
    return i === PHASES.length - 1 ? n : Math.min(n, Math.max(i + 1, Math.round(n * acc)));
  });

  const seq = { study: 0, vocab: 0, grammar: 0, reading: 0, listening: 0, writing: 0, w1: 0, w2: 0, speaking: 0, p1: 0, p2: 0, mock: 0, mockLR: 0 };
  const days = [];

  for (let i = 0; i < n; i++) {
    const phase = ends.findIndex((e) => i < e) + 1;
    const w = i % 7;
    let type = 'study';
    if (i === n - 1 && n > 7) type = 'rest';
    else if (w === 6) type = phase <= 2 ? 'review' : 'mock';
    else if (phase === 4 && w === 3) type = 'mock';

    const tasks = [];
    const add = (kind, ref = null, variant = null) => tasks.push({ id: kind, kind, ref, variant });

    // Vocabulary every day: new words while they last (not in the final stretch), else review
    if (type === 'study' && phase < 4 && seq.vocab * NEW_WORDS_PER_DAY < pools.words) add('vocab', seq.vocab++, 'new');
    else add('vocab', null, 'review');

    if (type === 'study') {
      if (phase === 1) add('grammar', seq.grammar++ % pools.grammar);
      const sections = settings.load === 4
        ? ['reading', 'listening', 'writing', 'speaking']
        : seq.study % 2 === 0 ? ['reading', 'speaking'] : ['listening', 'writing'];
      seq.study++;
      for (const s of sections) {
        if (s === 'reading' || s === 'listening') {
          const k = seq[s]++;
          k < pools[s] ? add(s, k, 'app') : add(s, null, 'book');
        } else if (s === 'writing') {
          const k = seq.writing++;
          const task1 = phase <= 2 ? k % 2 === 0 : k % 3 === 0;
          task1 ? add('writing', seq.w1++ % pools.task1, 'task1') : add('writing', seq.w2++ % pools.task2, 'task2');
        } else {
          const k = seq.speaking++;
          k % 3 === 2 ? add('speaking', seq.p1++ % pools.part1, 'part1') : add('speaking', seq.p2++ % pools.cueCards, 'part2');
        }
      }
    } else if (type === 'review') {
      add('review');
      add('speaking', seq.p2++ % pools.cueCards, 'full');
    } else if (type === 'mock') {
      if (seq.mock++ % 2 === 0) {
        const variant = seq.mockLR++ < pools.mocks ? 'app' : 'book';
        add('mock-listening', 0, variant);
        add('mock-reading', 0, variant);
      } else {
        add('mock-writing', seq.w2++ % pools.task2, 'full');
        add('mock-speaking', seq.p2++ % pools.cueCards, 'full');
      }
    } else {
      add('tips');
      add('checklist');
    }

    days.push({ index: i, date: addDays(settings.startDate, i), phase, type, tasks });
  }

  return { n, ends, days, startDate: settings.startDate, examDate: settings.examDate };
}

export function dayOf(plan, date) {
  const i = diffDays(plan.startDate, date);
  return i >= 0 && i < plan.n ? plan.days[i] : null;
}

export function phaseRange(plan, phaseId) {
  const start = phaseId === 1 ? 0 : plan.ends[phaseId - 2];
  return { start, end: plan.ends[phaseId - 1] - 1, startDate: plan.days[start]?.date, endDate: plan.days[plan.ends[phaseId - 1] - 1]?.date };
}
