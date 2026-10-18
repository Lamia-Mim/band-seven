// Completion, streaks and rewards: pure functions of the plan and of which
// tasks are done, so they are easy to test and never drift out of sync.

import { addDays } from './dates.js';

export const isDayDone = (day, done) => !!day && day.tasks.every((t) => done[day.date]?.includes(t.id));

export function completedDays(plan, done) {
  return plan.days.filter((d) => isDayDone(d, done)).length;
}

// Consecutive finished days ending on `date` (or the day before, if today
// isn't finished yet)
export function streak(plan, done, date) {
  const byDate = new Map(plan.days.map((d) => [d.date, d]));
  let cursor = isDayDone(byDate.get(date), done) ? date : addDays(date, -1);
  let n = 0;
  while (byDate.has(cursor) && isDayDone(byDate.get(cursor), done)) {
    n++;
    cursor = addDays(cursor, -1);
  }
  return n;
}

// What finishing `date` unlocks. Call it once per day (the store remembers
// which days were rewarded). Tips: the next card for every finished day.
// Phrase packs: the next pack each time the streak reaches 7, 14, 21…
// Phase guides: finishing a phase's last day.
export function rewardsFor(plan, done, date, unlocked, counts) {
  const day = plan.days.find((d) => d.date === date);
  if (!isDayDone(day, done)) return { unlocked, events: [] };
  const events = [];
  const next = { ...unlocked, guides: [...unlocked.guides] };

  if (unlocked.tips < counts.tips) {
    events.push({ type: 'tip', index: unlocked.tips });
    next.tips = unlocked.tips + 1;
  }

  const run = streak(plan, done, date);
  if (run > 0 && run % 7 === 0 && unlocked.packs < counts.packs) {
    events.push({ type: 'pack', index: unlocked.packs });
    next.packs = unlocked.packs + 1;
  }

  const phaseEnd = plan.ends.indexOf(day.index + 1);
  if (phaseEnd !== -1 && !next.guides.includes(phaseEnd)) {
    events.push({ type: 'guide', index: phaseEnd });
    next.guides.push(phaseEnd);
  }

  return { unlocked: next, events };
}
