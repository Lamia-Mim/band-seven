// Spaced repetition for vocabulary, Leitner style: a word moves up a box each
// time you know it and back to box 1 when you don't. Higher boxes come back
// less often.

import { addDays } from './dates.js';

export const INTERVALS = [0, 1, 3, 7, 14, 30]; // days until the next review, by box (1–5)

// grade: 'again' | 'hard' | 'good' | 'easy'
export function review(card, grade, today) {
  const box = card?.box ?? 0;
  const next = grade === 'again' ? 1 : grade === 'hard' ? Math.max(1, box) : grade === 'good' ? Math.min(5, box + 1) : Math.min(5, box + 2);
  const days = grade === 'again' ? 0 : grade === 'hard' ? 1 : INTERVALS[next];
  return { box: next, due: addDays(today, days), seen: (card?.seen ?? 0) + 1 };
}

export const isDue = (card, today) => !!card && card.due <= today;
export const isLearned = (card) => !!card && card.box >= 3;
