import { GRAMMAR } from './grammar.js';
import { WORDS } from './vocab.js';
import { READING } from './reading.js';
import { LISTENING } from './listening.js';
import { TASK1, TASK2 } from './writing.js';
import { PART1, CUE_CARDS } from './speaking.js';

export { GRAMMAR, WORDS, READING, LISTENING, TASK1, TASK2, PART1, CUE_CARDS };

// How much of each kind of content exists; the plan rotates through it
export const POOLS = {
  words: WORDS.length,
  grammar: GRAMMAR.length,
  reading: READING.length,
  listening: LISTENING.length,
  task1: TASK1.length,
  task2: TASK2.length,
  part1: PART1.length,
  cueCards: CUE_CARDS.length,
  mocks: 1, // the three passages and four sections together make one full test
};

// Official free practice material (checked links)
export const RESOURCES = [
  { name: 'Official IELTS preparation resources', by: 'ielts.org', url: 'https://ielts.org/take-a-test/preparation-resources' },
  { name: 'Official sample test questions', by: 'ielts.org', url: 'https://ielts.org/take-a-test/preparation-resources/sample-test-questions' },
  { name: 'IELTS Academic: test format', by: 'ielts.org', url: 'https://ielts.org/take-a-test/test-types/ielts-academic-test' },
  { name: 'IDP IELTS preparation', by: 'IDP', url: 'https://ielts.idp.com/prepare' },
  { name: 'Cambridge English IELTS preparation', by: 'Cambridge English', url: 'https://www.cambridgeenglish.org/exams-and-tests/ielts/preparation/' },
];
