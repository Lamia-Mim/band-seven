// Masterclasses: in-depth lessons that unlock as you level up. They are the
// main reward, so each one teaches something that moves a band score.
// Section kinds: text (paragraphs), list, compare (two versions), say (words to hear), table.

export const MASTERCLASSES = [
  {
    id: 'mc-essay',
    level: 2,
    title: 'The Band 7 essay blueprint',
    why: 'Most Task 2 essays lose marks on structure and development, not on vocabulary. This is the shape examiners expect.',
    sections: [
      { kind: 'list', heading: 'Four paragraphs, about 270 words', items: [
        'Introduction (2 sentences): paraphrase the topic, then give a clear position.',
        'Body paragraph 1 (90–100 words): your strongest reason, fully developed.',
        'Body paragraph 2 (90–100 words): your second reason, or the other side.',
        'Conclusion (2 sentences): restate your position and sum up both reasons.',
      ] },
      { kind: 'text', heading: 'Develop, don’t list', body: 'A Band 6 paragraph lists three ideas in three sentences. A Band 7 paragraph takes one idea and builds it: Point, Explain, Example, Link. The examiner is looking for “fully extended and well supported ideas”, and depth beats variety.' },
      { kind: 'compare', heading: 'A PEEL paragraph, annotated', left: { label: 'The paragraph', text: 'The strongest argument for investing in public transport is that it tackles congestion at its source. Building new roads tends to attract more drivers, so traffic soon returns to its previous level, whereas a fast metro line can move tens of thousands of commuters an hour without adding a single car. When Dhaka’s metro opened, for instance, some journeys that used to take two hours by road began to take under forty minutes. For this reason, public transport offers a more lasting solution than additional roads.' }, right: { label: 'What each sentence does', text: 'Point: one clear claim.\nExplain: why it is true, with a contrast (“whereas”).\nExample: a specific, real case.\nLink: ties the paragraph back to the question.' } },
      { kind: 'list', heading: 'Band 6 traps to avoid', items: [
        'Memorised openers like “In this day and age” or “Nowadays, with the development of technology”: examiners see them hundreds of times a day.',
        'A position that changes between the introduction and the conclusion.',
        'Three or four reasons per paragraph, each in a single sentence.',
        'Examples that are invented statistics (“90% of people agree”).',
      ] },
    ],
  },
  {
    id: 'mc-compare',
    level: 3,
    title: 'Band 6 vs Band 8: the same paragraph',
    why: 'Seeing exactly what changes between bands is the fastest way to know what to fix in your own writing.',
    sections: [
      { kind: 'text', heading: 'The question', body: '“Some people think children should start learning a foreign language at primary school. Do you agree?”' },
      { kind: 'compare', heading: 'Two answers to the same point', left: { label: 'Band 6', text: 'Firstly, children learn language more easy than adults. For example my cousin learned English very fast. Also it is good for their future because English is very important in the world nowadays. So I think it is good to learn early.' }, right: { label: 'Band 8', text: 'The most compelling reason to start early is that young children acquire languages with remarkable ease. Because their pronunciation is still developing, they can imitate new sounds far more accurately than teenagers, which is why primary-school learners often speak with a more natural accent. Early exposure also makes a second language feel like an ordinary part of life rather than a difficult school subject, and this positive attitude tends to last into secondary education.' } },
      { kind: 'list', heading: 'What the examiner notices', items: [
        'Task response: Band 6 lists two loosely connected reasons; Band 8 develops one reason and explains why it is true.',
        'Coherence: Band 6 relies on “Firstly, Also, So”. Band 8 links ideas with reference and cause (“Because…, which is why…, this positive attitude…”).',
        'Vocabulary: “learn language more easy” vs “acquire languages with remarkable ease”: precise collocations, no errors.',
        'Grammar: Band 6 has an adverb error and simple sentences; Band 8 uses complex sentences accurately.',
        'Example: a personal anecdote (“my cousin”) is weaker than a general, explained observation.',
      ] },
    ],
  },
  {
    id: 'mc-part2',
    level: 4,
    title: 'Speaking Part 2: the story method',
    why: 'Running out of things to say after 50 seconds is the most common Part 2 problem. A story fixes it.',
    sections: [
      { kind: 'list', heading: 'Use your minute like this', items: [
        'One line: who or what it is.',
        'The story: when and where, and one specific moment you remember.',
        'Details: what you saw, heard or felt. Details create fluency.',
        'Then and now: how you felt at the time, and how you feel looking back.',
        'Why it matters: this answers the “and explain…” bullet.',
      ] },
      { kind: 'compare', heading: 'Notes vs answer', left: { label: 'Notes (1 minute)', text: 'Mrs Rahman, maths, class 8\nfailed test → stayed after school\n“mistakes are information”\nscared → confident\nnow: engineering, I still check mistakes' }, right: { label: 'Answer (about 2 minutes)', text: 'I’d like to talk about my maths teacher in class eight, Mrs Rahman. To be honest, maths was my worst subject, and I clearly remember the day I failed a test and was too embarrassed to show my parents. Instead of scolding me, she asked me to stay after school, and we went through every mistake together. What struck me was something she said: that mistakes are just information about what to practise next. At the time I was really scared of maths, but over the next few months I became much more confident, and by the end of the year it was one of my best subjects. Looking back, I think she changed the way I deal with failure in general. I’m studying engineering now, and I still go through my mistakes the way she taught me, which is probably why I chose such a maths-heavy subject.' } },
      { kind: 'list', heading: 'Extend naturally', items: [
        'Compare: “Unlike most teachers I’d had before, she…”',
        'Imagine: “If I hadn’t had her as a teacher, I probably wouldn’t have…”',
        'Return to feelings: “What I appreciate most now is…”',
      ] },
    ],
  },
  {
    id: 'mc-task1',
    level: 5,
    title: 'Task 1 language bank',
    why: 'Varied, precise language for trends and comparisons is what lifts Task 1 vocabulary from 6 to 7.',
    sections: [
      { kind: 'table', heading: 'Describing change', rows: [
        ['Up', 'rise, increase, grow, climb, surge (fast), double, triple'],
        ['Down', 'fall, decrease, decline, drop, plunge (fast), halve'],
        ['No change', 'remain stable, level off, plateau, stay at'],
        ['Up and down', 'fluctuate, vary, be volatile'],
        ['Highest / lowest', 'peak at, reach a high of, hit a low of, bottom out at'],
      ] },
      { kind: 'table', heading: 'How much and how fast', rows: [
        ['Big', 'dramatic(ally), sharp(ly), significant(ly), substantial(ly)'],
        ['Medium', 'steady/steadily, moderate(ly), considerable/considerably'],
        ['Small', 'slight(ly), marginal(ly), gradual(ly)'],
      ] },
      { kind: 'list', heading: 'Approximations', items: ['just under / just over a quarter', 'roughly a third', 'nearly half', 'the vast majority (about 80%+)', 'a small minority (under 10%)', 'approximately 40%'] },
      { kind: 'list', heading: 'Overview starters', items: ['Overall, it is clear that…', 'The most striking feature is…', 'In general, X saw an upward trend, while Y declined.', 'X remained the most popular choice throughout the period.'] },
    ],
  },
  {
    id: 'mc-listening',
    level: 6,
    title: 'Listening traps decoded',
    why: 'Most lost Listening marks come from six predictable traps. Once you can name them, you stop falling for them.',
    sections: [
      { kind: 'table', heading: 'The six traps', rows: [
        ['Correction', '“The meeting’s on Tuesday… sorry, no, Thursday.” The second answer wins.'],
        ['Distractor', 'All three options are mentioned; only one is confirmed. Wait for the speaker to commit.'],
        ['Number pairs', '13 vs 30, 15 vs 50: listen for stress. thirTEEN vs THIRty.'],
        ['Plurals', 'If you hear “boxes”, “box” is wrong. Check the grammar of the gap.'],
        ['Paraphrase', 'The question says “inexpensive”, the speaker says “it won’t cost much”.'],
        ['Negatives', '“Everything except the café is open.” Words like except, apart from, not change the answer.'],
      ] },
      { kind: 'text', heading: 'A daily habit', body: 'After every Listening practice, read the script and underline exactly where each answer was given, and what trap was used. Doing this for two weeks trains your ear faster than doing twice as many tests.' },
    ],
  },
  {
    id: 'mc-reading',
    level: 7,
    title: 'Reading at speed: skim, scan, locate',
    why: 'Band 7 Reading is 30 out of 40 in 60 minutes. That needs a method, not faster reading.',
    sections: [
      { kind: 'list', heading: 'The three-step method', items: [
        'Skim (2 minutes): read the title and the first sentence of each paragraph. Know what each paragraph is about.',
        'Read the questions: underline names, numbers, dates and capitalised words. These are easy to scan for.',
        'Scan and read closely: find the keyword, then read the two sentences around it slowly. The answer is almost always there.',
      ] },
      { kind: 'table', heading: 'Time plan', rows: [['Passage 1', '17 minutes'], ['Passage 2', '20 minutes'], ['Passage 3', '23 minutes'], ['Rule', 'Never leave a blank: guess before you move on']] },
      { kind: 'list', heading: 'TRUE / FALSE / NOT GIVEN decision', items: [
        'Find the part of the text the statement is about.',
        'Does the text say the same thing in other words? → TRUE',
        'Does the text say the opposite? → FALSE',
        'Is the specific detail simply not there? → NOT GIVEN. Don’t use your own knowledge.',
      ] },
    ],
  },
  {
    id: 'mc-pron',
    level: 8,
    title: 'Pronunciation for Bangla speakers',
    why: 'Pronunciation is a quarter of the Speaking score. A few sounds that are different in Bangla cause most of the problems.',
    sections: [
      { kind: 'say', heading: 'V and W are different sounds', body: 'Bangla “ভ” sits between them. For V, touch your top teeth to your bottom lip; for W, round your lips with no teeth.', words: ['very', 'well', 'village', 'wine', 'vine', 'wet', 'vet', 'environment'] },
      { kind: 'say', heading: 'Z is not J', body: 'Z is a buzzing S. “Zero” is not “jero”.', words: ['zero', 'zone', 'organise', 'amazing', 'busy', 'easy'] },
      { kind: 'say', heading: 'No extra vowel before S', body: 'Say “school”, not “ischool”. Start straight on the S.', words: ['school', 'street', 'study', 'student', 'special', 'spring'] },
      { kind: 'say', heading: 'TH sounds', body: 'Put your tongue lightly between your teeth. “Think” is not “tink”, “this” is not “dis”.', words: ['think', 'three', 'thank you', 'this', 'weather', 'although'] },
      { kind: 'say', heading: 'Word stress', body: 'Stressing the wrong syllable makes words hard to recognise. The capital letters show the stress.', words: ['deVELopment', 'phoTOgraphy', 'ecoNOMic', 'enVIRonment', 'comFORtable', 'TECHnology'] },
    ],
  },
  {
    id: 'mc-collocations',
    level: 9,
    title: 'Collocation power pack',
    why: 'Natural word partnerships are the quickest way to sound like Band 7+ in both Writing and Speaking.',
    sections: [
      { kind: 'table', heading: 'Environment', rows: [['tackle climate change', 'জলবায়ু পরিবর্তন মোকাবিলা করা'], ['cut carbon emissions', 'কার্বন নির্গমন কমানো'], ['renewable energy sources', 'নবায়নযোগ্য শক্তির উৎস'], ['endangered species', 'বিপন্ন প্রজাতি'], ['raise awareness', 'সচেতনতা বাড়ানো'], ['a sustainable lifestyle', 'টেকসই জীবনযাপন'], ['have a detrimental effect on', 'ক্ষতিকর প্রভাব ফেলা']] },
      { kind: 'table', heading: 'Education', rows: [['acquire knowledge', 'জ্ঞান অর্জন করা'], ['a well-rounded education', 'সর্বাঙ্গীণ শিক্ষা'], ['academic performance', 'শিক্ষাগত ফলাফল'], ['broaden your horizons', 'দৃষ্টিভঙ্গি প্রসারিত করা'], ['critical thinking skills', 'বিশ্লেষণী চিন্তার দক্ষতা'], ['tuition fees', 'টিউশন ফি']] },
      { kind: 'table', heading: 'Technology', rows: [['rely heavily on', 'অনেক বেশি নির্ভর করা'], ['cutting-edge technology', 'সর্বাধুনিক প্রযুক্তি'], ['the digital divide', 'ডিজিটাল বৈষম্য'], ['a double-edged sword', 'দুই দিকেই ধার আছে এমন জিনিস'], ['keep pace with', 'তাল মিলিয়ে চলা'], ['screen time', 'স্ক্রিনে কাটানো সময়']] },
      { kind: 'table', heading: 'Health', rows: [['a sedentary lifestyle', 'কম নড়াচড়ার জীবনযাপন'], ['a balanced diet', 'সুষম খাদ্য'], ['take regular exercise', 'নিয়মিত ব্যায়াম করা'], ['mental wellbeing', 'মানসিক সুস্থতা'], ['life expectancy', 'গড় আয়ু'], ['chronic diseases', 'দীর্ঘস্থায়ী রোগ']] },
      { kind: 'table', heading: 'Work', rows: [['job satisfaction', 'কাজের সন্তুষ্টি'], ['work-life balance', 'কাজ ও ব্যক্তিগত জীবনের ভারসাম্য'], ['career prospects', 'ক্যারিয়ারের সম্ভাবনা'], ['climb the career ladder', 'পদোন্নতি পেয়ে এগিয়ে যাওয়া'], ['job security', 'চাকরির নিরাপত্তা'], ['gain experience', 'অভিজ্ঞতা অর্জন করা']] },
    ],
  },
];
