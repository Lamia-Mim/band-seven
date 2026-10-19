// Tutor prompts for explaining a wrong Reading or Listening answer
const answerText = (g, item) => (g.type === 'gap' ? item.answer[0] : g.type === 'mcq' ? `${item.answer}) ${item.options[item.answer.charCodeAt(0) - 65]}` : item.answer);
const givenText = (g, item, given) => (!given ? '(no answer)' : g.type === 'mcq' ? `${given}) ${item.options[given.charCodeAt(0) - 65] ?? ''}` : given);
const optionList = (item) => (item.options ? `\nOptions: ${item.options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join(' ')}` : '');

export function explainReading(passage, g, item, given) {
  const text = passage.paragraphs.map((p, i) => (passage.lettered ? `${String.fromCharCode(65 + i)}. ` : '') + p).join('\n\n');
  const choose = g.options && g.type === 'choose' ? `Options: ${g.options.join(' | ')}\n` : '';
  return `I'm practising IELTS Academic Reading. Explain why my answer was wrong.

Passage "${passage.title}":
${text}

Instruction: ${g.instruction}
${choose}Question ${item.n}: ${item.prompt}${optionList(item)}
My answer: ${givenText(g, item, given)}
Correct answer: ${answerText(g, item)}

Quote the exact sentence from the passage that gives the answer, explain the paraphrase, and say what trap I fell into.`;
}

export function explainListening(section, g, item, given) {
  const text = section.script.map(([who, t]) => `${section.speakers[who].name}: ${t}`).join('\n');
  return `I'm practising IELTS Listening. Explain why my answer was wrong.

Transcript "${section.title}":
${text}

Instruction: ${g.instruction}
Question ${item.n}: ${item.prompt}${optionList(item)}
My answer: ${givenText(g, item, given)}
Correct answer: ${answerText(g, item)}

Quote the exact words in the transcript that give the answer, and name the listening trap (distractor, correction, paraphrase, spelling, plural…) if there was one.`;
}
