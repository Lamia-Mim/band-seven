// Turns a planned task ({ kind, ref, variant }) into what the student sees:
// a title, a one-line detail, a rough time and the page that does it.

import { GRAMMAR, WORDS, READING, LISTENING, TASK1, TASK2, PART1, CUE_CARDS } from '../data/index.js';
import { NEW_WORDS_PER_DAY } from './plan.js';

const CHARTS = { line: 'line graph', bar: 'bar chart', pie: 'pie charts', table: 'table', process: 'process diagram' };

export const SECTION_OF = {
  vocab: 'Vocabulary', grammar: 'Grammar', reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking',
  review: 'Review', 'mock-listening': 'Mock test', 'mock-reading': 'Mock test', 'mock-writing': 'Mock test', 'mock-speaking': 'Mock test',
  tips: 'Exam ready', checklist: 'Exam ready',
};

export function describe(task, date) {
  const q = `?task=${date}~${task.id}`;
  const { kind, ref, variant } = task;
  switch (kind) {
    case 'vocab': {
      if (variant === 'new') {
        const first = WORDS[ref * NEW_WORDS_PER_DAY];
        return { title: `${NEW_WORDS_PER_DAY} new words`, detail: `${first?.topic ?? 'Vocabulary'} · plus any words due for review`, minutes: 15, to: `/words/study${q}` };
      }
      return { title: 'Vocabulary review', detail: 'Review the words that are due today', minutes: 10, to: `/words/study${q}` };
    }
    case 'grammar':
      return { title: GRAMMAR[ref].title, detail: GRAMMAR[ref].summary, minutes: 15, to: `/grammar/${GRAMMAR[ref].id}${q}` };
    case 'reading':
      return variant === 'app'
        ? { title: READING[ref].title, detail: READING[ref].level, minutes: 20, to: `/reading/${READING[ref].id}${q}` }
        : { title: 'One passage from your book', detail: 'Cambridge IELTS or an official practice test, then enter your score', minutes: 20, to: `/book/reading${q}` };
    case 'listening':
      return variant === 'app'
        ? { title: LISTENING[ref].title, detail: LISTENING[ref].level, minutes: 10, to: `/listening/${LISTENING[ref].id}${q}` }
        : { title: 'One section from your book', detail: 'Cambridge IELTS or an official practice test, then enter your score', minutes: 10, to: `/book/listening${q}` };
    case 'writing':
      return variant === 'task1'
        ? { title: `Task 1 · ${CHARTS[TASK1[ref].chart]}`, detail: 'At least 150 words', minutes: 20, to: `/writing/${TASK1[ref].id}${q}` }
        : { title: `Task 2 · ${TASK2[ref].kind.toLowerCase()} essay`, detail: 'At least 250 words', minutes: 40, to: `/writing/${TASK2[ref].id}${q}` };
    case 'speaking':
      if (variant === 'part1') return { title: `Part 1 · ${PART1[ref].topic}`, detail: 'Four questions · record your answers', minutes: 8, to: `/speaking/part1/${ref}${q}` };
      if (variant === 'full') return { title: 'Full speaking test', detail: 'Parts 1, 2 and 3, recorded', minutes: 15, to: `/speaking/full/${ref}${q}` };
      return { title: 'Part 2 · cue card', detail: CUE_CARDS[ref].title, minutes: 8, to: `/speaking/card/${ref}${q}` };
    case 'review':
      return { title: 'Your mistakes this week', detail: 'Go back over every question you got wrong', minutes: 20, to: `/review${q}` };
    case 'mock-listening':
      return variant === 'app'
        ? { title: 'Full Listening test', detail: '4 sections · 40 questions', minutes: 30, to: `/mock/listening${q}` }
        : { title: 'Full Listening test from your book', detail: 'A complete test in one sitting, then enter your score', minutes: 40, to: `/book/listening${q}&full=1` };
    case 'mock-reading':
      return variant === 'app'
        ? { title: 'Full Reading test', detail: '3 passages · 40 questions', minutes: 60, to: `/mock/reading${q}` }
        : { title: 'Full Reading test from your book', detail: 'One sitting, then enter your score', minutes: 60, to: `/book/reading${q}&full=1` };
    case 'mock-writing':
      return { title: 'Full Writing test', detail: 'Task 1 and Task 2', minutes: 60, to: `/mock/writing/${ref}${q}` };
    case 'mock-speaking':
      return { title: 'Full Speaking test', detail: 'Parts 1, 2 and 3, recorded', minutes: 15, to: `/speaking/full/${ref}${q}` };
    case 'tips':
      return { title: 'Read your Examiner Secret cards', detail: 'A calm review of everything you unlocked', minutes: 15, to: `/rewards${q}` };
    case 'checklist':
      return { title: 'Exam-day checklist', detail: 'ID, route, timing: get everything ready', minutes: 10, to: `/exam-day${q}` };
    default:
      return { title: kind, detail: '', minutes: 10, to: '/' };
  }
}

// "?task=2026-10-19~reading" → { date, id }
export function taskFromSearch(search) {
  const v = new URLSearchParams(search).get('task');
  if (!v) return null;
  const [date, id] = v.split('~');
  return date && id ? { date, id } : null;
}
