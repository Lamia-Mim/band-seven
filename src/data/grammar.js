// Grammar lessons for IELTS Academic, from the basics up. Each has short
// explanations, the mistakes Bangla speakers make most often, and a quiz.

export const GRAMMAR = [
  {
    id: 'g1',
    title: 'Present tenses',
    summary: 'Simple, continuous and perfect: what each one says about time.',
    sections: [
      { heading: 'Present simple: facts and habits', text: 'Use it for things that are generally true or happen regularly. In Speaking Part 1 most answers about your life use it.', examples: ['Dhaka has a population of over 20 million.', 'I usually study in the evening.'] },
      { heading: 'Present continuous: now, or around now', text: 'Use it for actions in progress and temporary situations.', examples: ['I am preparing for IELTS at the moment.', 'More people are working from home these days.'] },
      { heading: 'Present perfect: past action, present result', text: 'Use it when the time is not finished or not stated, and the result matters now. Signal words: since, for, already, yet, recently.', examples: ['I have lived in Chattogram since 2015.', 'Online shopping has grown rapidly in recent years.'] },
    ],
    mistakes: [
      { wrong: 'I am living here since 2019.', right: 'I have lived (have been living) here since 2019.', why: '“since” needs the present perfect, not the present continuous.' },
      { wrong: 'Nowadays people uses phones everywhere.', right: 'Nowadays people use phones everywhere.', why: '“people” is plural, so no -s on the verb.' },
      { wrong: 'I am knowing the answer.', right: 'I know the answer.', why: 'State verbs (know, believe, own, like) are not normally used in the continuous.' },
    ],
    quiz: [
      { q: 'I ___ English for six years.', options: ['study', 'am studying', 'have been studying', 'studied since'], answer: 2, explain: '“for six years” up to now: present perfect continuous.' },
      { q: 'Water ___ at 100 °C.', options: ['boils', 'is boiling', 'has boiled', 'boil'], answer: 0, explain: 'A general fact: present simple.' },
      { q: 'Look! It ___ outside.', options: ['rains', 'is raining', 'has rained', 'rain'], answer: 1, explain: 'Happening now: present continuous.' },
      { q: 'I ___ this word before, but I can’t remember it.', options: ['see', 'am seeing', 'have seen', 'seeing'], answer: 2, explain: 'Past experience with a present result: present perfect.' },
      { q: 'She ___ that technology makes life easier.', options: ['is believing', 'believes', 'believe', 'has believing'], answer: 1, explain: '“believe” is a state verb: present simple.' },
    ],
  },
  {
    id: 'g2',
    title: 'Past simple or present perfect?',
    summary: 'The tense choice that matters most in Writing Task 1.',
    sections: [
      { heading: 'Past simple: finished time', text: 'If a graph shows past years (2005, 2010), the time is finished, so use the past simple.', examples: ['In 2010, sales rose to 40,000 units.', 'The number of visitors fell sharply between 1990 and 2000.'] },
      { heading: 'Present perfect: up to now', text: 'Use it when the period continues to the present, or in Task 2 for recent changes.', examples: ['Air travel has become much cheaper over the past two decades.'] },
      { heading: 'Future forms for projections', text: 'For graphs with future years, use “is expected to”, “is predicted to”, “will”.', examples: ['By 2040, the figure is expected to reach 60%.'] },
    ],
    mistakes: [
      { wrong: 'In 2015, the price has increased.', right: 'In 2015, the price increased.', why: 'A finished time (in 2015) takes the past simple.' },
      { wrong: 'The graph showed that…', right: 'The graph shows that…', why: 'The graph shows it now: present simple for describing the chart itself.' },
      { wrong: 'Sales was increased in 2012.', right: 'Sales increased in 2012.', why: '“increase” is not passive here; things increase by themselves.' },
    ],
    quiz: [
      { q: 'Between 2000 and 2010, coal use ___ by half.', options: ['has fallen', 'fell', 'falls', 'was fallen'], answer: 1, explain: 'Finished period: past simple.' },
      { q: 'Since 2015, renewable energy ___ steadily.', options: ['grew', 'has grown', 'grows', 'is grown'], answer: 1, explain: '“Since” to now: present perfect.' },
      { q: 'The chart ___ the number of students in five countries.', options: ['showed', 'shows', 'has shown', 'is showing'], answer: 1, explain: 'Describe what the chart shows in the present simple.' },
      { q: 'By 2030, the population ___ 10 million.', options: ['reached', 'has reached', 'is projected to reach', 'reaches'], answer: 2, explain: 'A future projection.' },
      { q: 'Exports ___ their peak in 2008.', options: ['reached', 'have reached', 'were reached', 'reach'], answer: 0, explain: 'A finished year: past simple, active.' },
    ],
  },
  {
    id: 'g3',
    title: 'Subject–verb agreement',
    summary: 'Singular subjects take singular verbs, even when the sentence is long.',
    sections: [
      { heading: 'Find the real subject', text: 'Words between the subject and the verb do not change the verb. Ask “what is doing the action?”', examples: ['The number of cars on our roads is rising.', 'The proportion of students who own laptops has increased.'] },
      { heading: '“The number of” vs “a number of”', text: '“The number of” is singular (one number). “A number of” means “several” and is plural.', examples: ['The number of tourists was low.', 'A number of tourists were unhappy.'] },
      { heading: 'Uncountable and collective subjects', text: 'Uncountable nouns take singular verbs: information, research, traffic, money.', examples: ['Research shows that sleep improves memory.'] },
    ],
    mistakes: [
      { wrong: 'The number of students are increasing.', right: 'The number of students is increasing.', why: 'The subject is “the number”, which is singular.' },
      { wrong: 'Each of the countries have a capital.', right: 'Each of the countries has a capital.', why: '“Each” is singular.' },
      { wrong: 'People is more stressed today.', right: 'People are more stressed today.', why: '“People” is plural.' },
    ],
    quiz: [
      { q: 'The percentage of households with internet ___ doubled.', options: ['have', 'has', 'are', 'were'], answer: 1, explain: '“The percentage” is singular.' },
      { q: 'A number of experts ___ this idea.', options: ['supports', 'support', 'is supporting', 'has supported'], answer: 1, explain: '“A number of” = several: plural.' },
      { q: 'Every child ___ access to education.', options: ['need', 'needs', 'are needing', 'have needed'], answer: 1, explain: '“Every” takes a singular verb.' },
      { q: 'The information on these websites ___ often wrong.', options: ['are', 'is', 'were', 'have been'], answer: 1, explain: '“Information” is uncountable: singular.' },
      { q: 'Neither of the options ___ perfect.', options: ['are', 'is', 'were', 'have been'], answer: 1, explain: '“Neither” is singular in formal writing.' },
    ],
  },
  {
    id: 'g4',
    title: 'Articles: a, an, the, or nothing',
    summary: 'Bangla has no articles, so this is the most common error for Bangla speakers.',
    sections: [
      { heading: 'a / an: one, not specific', text: 'Use with singular countable nouns mentioned for the first time. “an” before a vowel sound (an hour, a university).', examples: ['I bought a new laptop.', 'It took an hour.'] },
      { heading: 'the: specific, or already known', text: 'Use when the reader knows which one: mentioned before, the only one, or defined by the sentence.', examples: ['The laptop I bought is fast.', 'the government, the environment, the internet', 'The proportion of women rose.'] },
      { heading: 'No article: general plural and uncountable', text: 'For things in general, use the plural or an uncountable noun with no article.', examples: ['Children need exercise.', 'Education is important.', 'Technology has changed society.'] },
    ],
    mistakes: [
      { wrong: 'Government should invest in public transport.', right: 'The government should invest in public transport.', why: 'There is one government in a country: “the”.' },
      { wrong: 'The education is important for the children.', right: 'Education is important for children.', why: 'General statements take no article.' },
      { wrong: 'It is very useful tool.', right: 'It is a very useful tool.', why: 'A singular countable noun needs an article.' },
    ],
    quiz: [
      { q: '___ unemployment is a serious problem in many countries.', options: ['The', 'A', 'An', '(no article)'], answer: 3, explain: 'General, uncountable: no article.' },
      { q: 'She is studying at ___ university in London.', options: ['an', 'a', 'the', '(no article)'], answer: 1, explain: '“university” starts with a “you” sound: “a”.' },
      { q: '___ graph shows changes in energy use.', options: ['A', 'The', 'An', '(no article)'], answer: 1, explain: 'The specific graph in the task: “The”.' },
      { q: 'Many people now shop on ___ internet.', options: ['an', 'a', 'the', '(no article)'], answer: 2, explain: 'There is only one internet: “the”.' },
      { q: 'I think ___ honest person is easy to work with.', options: ['a', 'an', 'the', '(no article)'], answer: 1, explain: '“honest” starts with a vowel sound (silent h): “an”.' },
    ],
  },
  {
    id: 'g5',
    title: 'Countable and uncountable nouns',
    summary: 'Information, advice, research, equipment: never with -s.',
    sections: [
      { heading: 'Uncountable nouns in IELTS', text: 'These have no plural and no “a/an”: information, advice, research, knowledge, evidence, equipment, furniture, traffic, pollution, homework, progress, feedback.', examples: ['They gave us useful advice.', 'Recent research suggests…'] },
      { heading: 'How to count them', text: 'Use “a piece of”, “an item of”, or a countable word instead.', examples: ['a piece of advice', 'two studies (instead of “two researches”)'] },
      { heading: 'much/many, less/fewer', text: 'many / fewer with countable; much / less with uncountable.', examples: ['fewer cars, less traffic', 'many tips, much advice'] },
    ],
    mistakes: [
      { wrong: 'He gave me many informations.', right: 'He gave me a lot of information.', why: '“information” is uncountable.' },
      { wrong: 'There were less people than last year.', right: 'There were fewer people than last year.', why: '“people” is countable: “fewer”.' },
      { wrong: 'Students should do researches.', right: 'Students should do research.', why: '“research” is uncountable.' },
    ],
    quiz: [
      { q: 'Could you give me some ___ about the test?', options: ['advices', 'advice', 'an advice', 'many advice'], answer: 1, explain: 'Uncountable.' },
      { q: 'There is ___ traffic in the city centre than before.', options: ['fewer', 'less', 'many', 'a few'], answer: 1, explain: 'Traffic is uncountable: “less”.' },
      { q: 'The lab bought new ___.', options: ['equipments', 'equipment', 'an equipment', 'equipment pieces of'], answer: 1, explain: 'Uncountable.' },
      { q: 'How ___ people took part?', options: ['much', 'many', 'less', 'little'], answer: 1, explain: 'People is countable.' },
      { q: 'She has made great ___ this month.', options: ['progresses', 'a progress', 'progress', 'many progress'], answer: 2, explain: 'Uncountable.' },
    ],
  },
  {
    id: 'g6',
    title: 'Describing trends: verbs, nouns and prepositions',
    summary: 'The language of Writing Task 1 line graphs and bar charts.',
    sections: [
      { heading: 'Verbs and nouns', text: 'rise / increase / grow / climb · fall / decrease / decline / drop · fluctuate · remain stable · peak at · hit a low of. You can use a noun instead: “a sharp rise”.', examples: ['Sales rose sharply in March.', 'There was a sharp rise in sales in March.'] },
      { heading: 'by, to, from … to, at', text: '“by” = the amount of change; “to” = the new level; “from … to” = both ends; “at” = a level.', examples: ['Prices rose by 10% to $55.', 'It fell from 40% to 25%.', 'It peaked at 80 in 2010.'] },
      { heading: 'Adjectives and adverbs', text: 'dramatic(ally), sharp(ly), significant(ly), steady/steadily, gradual(ly), slight(ly). Adverb with a verb, adjective with a noun.', examples: ['increased gradually', 'a gradual increase'] },
    ],
    mistakes: [
      { wrong: 'The price increased with 5%.', right: 'The price increased by 5%.', why: 'The amount of change takes “by”.' },
      { wrong: 'There was a sharply rise.', right: 'There was a sharp rise.', why: 'Adjective before a noun.' },
      { wrong: 'The number reached to 50.', right: 'The number reached 50.', why: '“reach” takes a direct object, no “to”.' },
    ],
    quiz: [
      { q: 'Unemployment fell ___ 8% ___ 5%.', options: ['by / at', 'from / to', 'to / by', 'at / from'], answer: 1, explain: 'Start and end: from … to.' },
      { q: 'Profits rose ___ 20%, reaching $2m.', options: ['by', 'to', 'at', 'with'], answer: 0, explain: 'The size of the change: “by”.' },
      { q: 'There was a ___ decline in sales.', options: ['gradually', 'gradual', 'gradualy', 'graduated'], answer: 1, explain: 'Adjective before the noun “decline”.' },
      { q: 'The figure ___ at 90 in 2015 and then fell.', options: ['peaked', 'peak', 'was peaked', 'peaking'], answer: 0, explain: '“peaked at”, past simple.' },
      { q: 'Visitor numbers ___ between 2000 and 2005, going up and down.', options: ['remained stable', 'fluctuated', 'levelled off', 'plunged'], answer: 1, explain: 'Up and down: “fluctuated”.' },
    ],
  },
  {
    id: 'g7',
    title: 'Comparatives and superlatives',
    summary: 'Comparing figures accurately in Task 1 and ideas in Task 2.',
    sections: [
      { heading: 'Forms', text: 'Short adjectives: -er / -est (cheaper, the cheapest). Long adjectives: more / the most (more expensive). Irregular: good → better → best, bad → worse → worst.', examples: ['Rail travel is cheaper than air travel.', 'Japan had the highest figure.'] },
      { heading: 'Making comparisons precise', text: 'twice as … as, three times higher than, slightly / significantly / much more … than.', examples: ['Coffee sales were twice as high as tea sales.', 'Spending was significantly lower in 2020.'] },
      { heading: 'Contrast with whereas / while', text: 'Join two contrasting figures in one sentence.', examples: ['Men spent 3 hours online, whereas women spent 4.'] },
    ],
    mistakes: [
      { wrong: 'It is more better than before.', right: 'It is better than before.', why: '“better” is already comparative.' },
      { wrong: 'The most highest number…', right: 'The highest number…', why: 'Do not double the superlative.' },
      { wrong: 'twice more than', right: 'twice as much as / twice as many as', why: 'Use “twice as … as”.' },
    ],
    quiz: [
      { q: 'France had ___ number of visitors of all five countries.', options: ['the larger', 'the largest', 'the most large', 'more large'], answer: 1, explain: 'Of all: superlative.' },
      { q: 'Living in a city is ___ than living in a village.', options: ['more expensive', 'expensiver', 'most expensive', 'more expensiver'], answer: 0, explain: 'Long adjective: more …' },
      { q: 'Sales in May were ___ in April.', options: ['twice as high as', 'twice higher', 'two times more high', 'twice high than'], answer: 0, explain: 'twice as … as.' },
      { q: 'This method is ___ than the old one.', options: ['more good', 'better', 'best', 'gooder'], answer: 1, explain: 'Irregular: better.' },
      { q: 'Women spent 5 hours, ___ men spent only 2.', options: ['whereas', 'however', 'despite', 'although of'], answer: 0, explain: '“whereas” joins two contrasting clauses.' },
    ],
  },
  {
    id: 'g8',
    title: 'Relative clauses: who, which, that, where',
    summary: 'Build complex sentences, which examiners look for at Band 7.',
    sections: [
      { heading: 'Defining clauses (no commas)', text: 'They tell us which person or thing. “that” can replace who/which.', examples: ['Students who sleep well perform better.', 'The city where I grew up is very crowded.'] },
      { heading: 'Non-defining clauses (with commas)', text: 'They add extra information. Use who/which, never “that”.', examples: ['Dhaka, which is the capital, is very crowded.', 'My teacher, who is from Sylhet, speaks four languages.'] },
      { heading: 'Which for a whole idea', text: '“which” can refer to the whole previous clause.', examples: ['Many people work from home, which reduces traffic.'] },
    ],
    mistakes: [
      { wrong: 'Dhaka, that is the capital, is crowded.', right: 'Dhaka, which is the capital, is crowded.', why: 'No “that” in non-defining clauses.' },
      { wrong: 'The people which live there…', right: 'The people who live there…', why: '“who” for people.' },
      { wrong: 'The book that I read it was useful.', right: 'The book that I read was useful.', why: 'Do not repeat the object (“it”).' },
    ],
    quiz: [
      { q: 'Teachers ___ inspire students are valuable.', options: ['which', 'who', 'where', 'whose'], answer: 1, explain: 'People: who.' },
      { q: 'Paris, ___ I visited last year, is beautiful.', options: ['that', 'which', 'where', 'who'], answer: 1, explain: 'Non-defining, a thing: which.' },
      { q: 'This is the village ___ my grandparents live.', options: ['which', 'where', 'who', 'that'], answer: 1, explain: 'A place + a full clause: where.' },
      { q: 'Prices rose sharply, ___ worried consumers.', options: ['that', 'which', 'what', 'who'], answer: 1, explain: '“which” for the whole idea.' },
      { q: 'A person ___ car was stolen called the police.', options: ['who', 'whose', 'which', 'that his'], answer: 1, explain: 'Possession: whose.' },
    ],
  },
  {
    id: 'g9',
    title: 'Conditionals',
    summary: 'Talk about results, possibilities and imaginary situations.',
    sections: [
      { heading: 'First conditional: real future', text: 'If + present, will + verb.', examples: ['If the government taxes sugar, people will buy fewer sweet drinks.'] },
      { heading: 'Second conditional: imaginary', text: 'If + past, would + verb. Useful in Speaking Part 3 and Task 2 suggestions.', examples: ['If I were the mayor, I would build more parks.', 'If cities had better buses, fewer people would drive.'] },
      { heading: 'Zero conditional and alternatives', text: 'If + present, present: general truths. Also: unless, provided that, as long as.', examples: ['If you heat ice, it melts.', 'Unless action is taken, pollution will worsen.'] },
    ],
    mistakes: [
      { wrong: 'If I will get Band 7, I will apply.', right: 'If I get Band 7, I will apply.', why: 'No “will” in the if-clause.' },
      { wrong: 'If I was you, I would…', right: 'If I were you, I would…', why: '“were” is the formal choice for all persons.' },
      { wrong: 'If people would recycle more, …', right: 'If people recycled more, …', why: 'Past simple in the if-clause of the second conditional.' },
    ],
    quiz: [
      { q: 'If it ___ tomorrow, we will stay home.', options: ['rains', 'will rain', 'rained', 'would rain'], answer: 0, explain: 'First conditional: present after if.' },
      { q: 'If I ___ more time, I would learn French.', options: ['have', 'had', 'will have', 'would have'], answer: 1, explain: 'Second conditional.' },
      { q: '___ we act now, the problem will get worse.', options: ['If', 'Unless', 'Provided', 'As long'], answer: 1, explain: '“Unless” = if not.' },
      { q: 'If public transport were free, more people ___ it.', options: ['use', 'will use', 'would use', 'used'], answer: 2, explain: 'would + verb.' },
      { q: 'If you mix blue and yellow, you ___ green.', options: ['get', 'would get', 'got', 'will got'], answer: 0, explain: 'Zero conditional: a general truth.' },
    ],
  },
  {
    id: 'g10',
    title: 'The passive voice',
    summary: 'Essential for process diagrams and an academic style.',
    sections: [
      { heading: 'Form', text: 'be + past participle. The tense is carried by “be”.', examples: ['The leaves are collected by hand.', 'The bridge was built in 1990.', 'The tea is then packed and shipped.'] },
      { heading: 'Process diagrams', text: 'Use the present simple passive and sequence words: first, next, after that, once … , finally.', examples: ['First, the clay is dug from the ground. Once it has been shaped, it is fired in a kiln.'] },
      { heading: 'When to use it', text: 'When the action matters more than who does it, or the doer is unknown.', examples: ['It is widely believed that…', 'Plastic waste is often dumped in rivers.'] },
    ],
    mistakes: [
      { wrong: 'The water is boil.', right: 'The water is boiled.', why: 'Passive needs the past participle.' },
      { wrong: 'The accident was happened at night.', right: 'The accident happened at night.', why: '“happen” cannot be passive.' },
      { wrong: 'The cans recycled into new products.', right: 'The cans are recycled into new products.', why: 'Do not drop “be”.' },
    ],
    quiz: [
      { q: 'The beans ___ before they are ground.', options: ['roast', 'are roasted', 'are roast', 'roasted'], answer: 1, explain: 'Present passive: are + past participle.' },
      { q: 'This museum ___ in 1902.', options: ['opened by', 'was opened', 'is opened', 'has opening'], answer: 1, explain: 'Past passive.' },
      { q: 'It ___ that the climate is changing faster.', options: ['believes', 'is believed', 'believed', 'is believing'], answer: 1, explain: 'Impersonal passive: it is believed that.' },
      { q: 'The prices ___ (rise) last year.', options: ['were risen', 'rose', 'are rose', 'had risen by'], answer: 1, explain: '“rise” cannot be passive.' },
      { q: 'Finally, the product ___ to shops.', options: ['delivers', 'is delivered', 'delivered', 'is deliver'], answer: 1, explain: 'Present passive.' },
    ],
  },
  {
    id: 'g11',
    title: 'Linking words and cohesion',
    summary: 'Connect ideas clearly, without overusing linkers.',
    sections: [
      { heading: 'Common linkers by meaning', text: 'Adding: moreover, in addition, furthermore. Contrast: however, whereas, although, on the other hand. Result: therefore, as a result, consequently. Example: for instance, such as.', examples: ['Cars are convenient. However, they cause pollution.', 'Although cars are convenient, they cause pollution.'] },
      { heading: 'Grammar of linkers', text: '“however, therefore, moreover” start a new sentence (or follow a semicolon) and take a comma. “although, whereas, because” join two clauses in one sentence.', examples: ['Prices rose; therefore, demand fell.'] },
      { heading: 'Cohesion without linkers', text: 'Band 7 writing also uses reference words: this, these, such, it, which. Repeating “moreover” in every paragraph looks mechanical.', examples: ['Many cities face traffic jams. This problem…'] },
    ],
    mistakes: [
      { wrong: 'Although it was cheap, but it was useful.', right: 'Although it was cheap, it was useful.', why: 'Do not use “although” and “but” together.' },
      { wrong: 'I want to discuss about this.', right: 'I want to discuss this.', why: '“discuss” takes no preposition.' },
      { wrong: 'On the other hand, … (with no first hand)', right: 'In contrast, …', why: '“On the other hand” needs two sides being compared.' },
    ],
    quiz: [
      { q: 'The plan was expensive. ___, it was approved.', options: ['Although', 'Nevertheless', 'Because', 'Whereas'], answer: 1, explain: 'Contrast across sentences: Nevertheless / However.' },
      { q: '___ the rain, the match continued.', options: ['Although', 'Despite', 'However', 'Even'], answer: 1, explain: '“Despite” + noun.' },
      { q: 'Fuel prices rose; ___, fewer people drove.', options: ['as a result', 'although', 'despite', 'whereas'], answer: 0, explain: 'Result.' },
      { q: 'Which sentence is correct?', options: ['We discussed about the issue.', 'We discussed the issue.', 'We discussed on the issue.', 'We discussed with the issue.'], answer: 1, explain: 'discuss + object.' },
      { q: 'Some prefer cities, ___ others prefer villages.', options: ['whereas', 'however', 'therefore', 'moreover'], answer: 0, explain: '“whereas” joins two clauses.' },
    ],
  },
  {
    id: 'g12',
    title: 'Sentence boundaries and punctuation',
    summary: 'Run-on sentences and comma splices cost easy marks.',
    sections: [
      { heading: 'One sentence, one main idea', text: 'Two complete sentences cannot be joined with only a comma (a “comma splice”). Use a full stop, a semicolon, or a linking word.', examples: ['Wrong: Prices rose, people bought less.', 'Right: Prices rose, so people bought less.'] },
      { heading: 'Commas after introductory phrases', text: 'Put a comma after a long opening phrase or a sentence adverb.', examples: ['In most developed countries, the birth rate is falling.', 'However, this is not always true.'] },
      { heading: 'Capital letters and apostrophes', text: 'Countries, languages and nationalities take capitals (Bangladesh, English). Avoid contractions (don’t, it’s) in essays.', examples: ['It is (not it’s) widely accepted that…'] },
    ],
    mistakes: [
      { wrong: 'Technology is useful, it saves time.', right: 'Technology is useful because it saves time.', why: 'Comma splice: join with a linker.' },
      { wrong: 'its important to study.', right: 'It is important to study.', why: 'Capital letter; no contraction; “its” is possessive.' },
      { wrong: 'many people speak english.', right: 'Many people speak English.', why: 'Languages take capitals.' },
    ],
    quiz: [
      { q: 'Which is correct?', options: ['I was tired, I went to bed.', 'I was tired, so I went to bed.', 'I was tired so, I went to bed.', 'I was tired I went to bed.'], answer: 1, explain: 'Join with “so”.' },
      { q: 'Which is better in an essay?', options: ['It’s clear that…', 'It is clear that…', 'Its clear that…', 'its clear that…'], answer: 1, explain: 'No contractions in formal writing.' },
      { q: 'Choose the correctly punctuated sentence.', options: ['However the results were mixed.', 'However, the results were mixed.', 'However; the results were mixed.', 'However the, results were mixed.'], answer: 1, explain: 'Comma after “However” at the start.' },
      { q: 'Which word needs a capital letter?', options: ['science', 'monday', 'city', 'river'], answer: 1, explain: 'Days of the week: Monday.' },
      { q: 'The dog wagged ___ tail.', options: ['it’s', 'its', 'its’', 'it is'], answer: 1, explain: '“its” = belonging to it.' },
    ],
  },
];
