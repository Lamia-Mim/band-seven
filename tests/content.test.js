// Checks the study content itself for mistakes a student would trip over
import { describe, expect, it } from 'vitest';
import { GRAMMAR, WORDS, READING, LISTENING, TASK1, TASK2, PART1, CUE_CARDS } from '../src/data/index.js';
import { TIPS, PHRASE_PACKS, PHASE_GUIDES } from '../src/data/rewards.js';
import { optionValue } from '../src/lib/score.js';

const numbers = (sections) => sections.flatMap((s) => s.groups.flatMap((g) => g.items.map((i) => i.n)));

function checkGroups(sections) {
  for (const s of sections) {
    for (const g of s.groups) {
      for (const item of g.items) {
        if (g.type === 'mcq') expect(item.answer.charCodeAt(0) - 65).toBeLessThan(item.options.length);
        if (g.type === 'choose') expect(g.options.map(optionValue)).toContain(item.answer);
        if (g.type === 'tfng') expect(['TRUE', 'FALSE', 'NOT GIVEN']).toContain(item.answer);
        if (g.type === 'gap') expect(item.answer.length).toBeGreaterThan(0);
      }
    }
  }
}

describe('content', () => {
  it('has 300 different words, each complete', () => {
    expect(WORDS).toHaveLength(300);
    expect(new Set(WORDS.map((w) => w.word)).size).toBe(300);
    for (const w of WORDS) {
      expect(w.bn).toMatch(/[ঀ-৿]/);
      expect(w.synonyms.length).toBeGreaterThan(0);
      expect(w.example.length).toBeGreaterThan(10);
    }
  });

  it('Reading is a full test numbered 1–40 with valid answers', () => {
    expect(numbers(READING)).toEqual(Array.from({ length: 40 }, (_, i) => i + 1));
    checkGroups(READING);
  });

  it('Listening is a full test numbered 1–40 with valid answers and known speakers', () => {
    expect(numbers(LISTENING)).toEqual(Array.from({ length: 40 }, (_, i) => i + 1));
    checkGroups(LISTENING);
    for (const s of LISTENING) for (const [who] of s.script) expect(s.speakers[who]).toBeTruthy();
  });

  it('grammar quizzes have valid answers', () => {
    expect(GRAMMAR.length).toBeGreaterThanOrEqual(12);
    for (const g of GRAMMAR) for (const q of g.quiz) expect(q.answer).toBeLessThan(q.options.length);
  });

  it('writing and speaking prompts are complete', () => {
    for (const t of TASK1) expect(t.chart === 'process' ? t.steps.length : t.series.every((s) => s.values.length === t.labels.length)).toBeTruthy();
    for (const t of TASK1.filter((x) => x.chart === 'pie')) for (const s of t.series) expect(s.values.reduce((a, b) => a + b, 0)).toBe(100);
    expect(TASK2.length).toBeGreaterThanOrEqual(20);
    expect(PART1.every((p) => p.questions.length === 4)).toBe(true);
    expect(CUE_CARDS.every((c) => c.points.length === 3 && c.part3.length === 3)).toBe(true);
  });

  it('has enough rewards for a 12-week plan', () => {
    expect(TIPS.length).toBeGreaterThanOrEqual(84);
    expect(PHRASE_PACKS.length).toBeGreaterThanOrEqual(6);
    expect(PHASE_GUIDES).toHaveLength(4);
  });
});
