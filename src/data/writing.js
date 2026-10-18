// Writing prompts. Task 1 charts are drawn by the app from the data below
// (the figures are invented for practice). Some prompts have a model answer,
// which unlocks after you submit your own.

export const TASK1 = [
  {
    id: 't1-1',
    chart: 'line',
    prompt: 'The graph below shows how residents of a city travelled to work between 1990 and 2020.',
    unit: '% of commuters',
    labels: ['1990', '1995', '2000', '2005', '2010', '2015', '2020'],
    series: [
      { name: 'Car', values: [45, 52, 58, 55, 48, 40, 36] },
      { name: 'Bus', values: [30, 26, 22, 20, 21, 24, 25] },
      { name: 'Bicycle', values: [5, 4, 4, 6, 10, 15, 19] },
      { name: 'Walking', values: [20, 18, 16, 19, 21, 21, 20] },
    ],
    model: `The line graph illustrates how people in a city commuted to work between 1990 and 2020, broken down into four modes of transport: car, bus, bicycle and walking.

Overall, the car remained the most common way to travel throughout the period, although its share fell after 2000. The most striking change was the rise of cycling, which almost quadrupled, while bus use and walking changed relatively little.

In 1990, 45% of commuters drove to work, and this figure climbed steadily to a peak of 58% in 2000. After that, however, car use declined, reaching 36% by 2020. Bus travel followed the opposite pattern: it dropped from 30% to a low of 20% in 2005 before recovering to 25% at the end of the period.

Cycling was the least popular option for the first fifteen years, accounting for only 4–6% of journeys. From 2005 onwards, though, it grew rapidly, reaching 19% in 2020, almost the same as walking. The proportion of people who walked fluctuated only slightly, staying between 16% and 21% throughout.`,
  },
  {
    id: 't1-2',
    chart: 'bar',
    prompt: 'The chart below shows the average number of hours per week that people aged 18–30 spent on five leisure activities in 2005 and 2025.',
    unit: 'hours per week',
    labels: ['Social media', 'Television', 'Sport', 'Reading', 'Video games'],
    series: [
      { name: '2005', values: [2, 14, 5, 4, 3] },
      { name: '2025', values: [16, 6, 4, 2, 7] },
    ],
  },
  {
    id: 't1-3',
    chart: 'pie',
    prompt: 'The pie charts below show how a university spent its budget in 2000 and 2020.',
    unit: '% of budget',
    labels: ['Staff salaries', 'Buildings', 'Research', 'Library', 'IT'],
    series: [
      { name: '2000', values: [55, 20, 10, 8, 7] },
      { name: '2020', values: [48, 12, 18, 4, 18] },
    ],
    model: `The pie charts compare how a university divided its budget among five areas of spending in 2000 and 2020.

Overall, staff salaries took the largest share in both years, but the university shifted money away from buildings and the library towards research and information technology.

In 2000, more than half of the budget (55%) went on staff salaries, followed by buildings at one fifth. Research, the library and IT each received a relatively small share, ranging from 7% to 10%.

By 2020, the proportion spent on salaries had fallen to 48%, though it was still the biggest single item. Spending on IT rose most dramatically, from 7% to 18%, matching the share given to research, which had also almost doubled. In contrast, the share allocated to buildings dropped from 20% to 12%, and the library’s portion halved to just 4%, making it the smallest category in 2020.`,
  },
  {
    id: 't1-4',
    chart: 'table',
    prompt: 'The table below shows the number of international students (in thousands) at universities in five cities in 2010, 2015 and 2020.',
    unit: 'thousands of students',
    labels: ['2010', '2015', '2020'],
    series: [
      { name: 'Northport', values: [42, 55, 61] },
      { name: 'Eastvale', values: [30, 28, 25] },
      { name: 'Southbridge', values: [12, 24, 40] },
      { name: 'Westford', values: [18, 19, 21] },
      { name: 'Lakeside', values: [8, 6, 15] },
    ],
  },
  {
    id: 't1-5',
    chart: 'process',
    prompt: 'The diagram below shows how instant noodles are produced.',
    steps: [
      'Flour is delivered by truck and stored in silos.',
      'Flour is mixed with water and oil to make dough.',
      'The dough is rolled into thin sheets.',
      'The sheets are cut into strips.',
      'The strips are steamed.',
      'The noodles are shaped into discs.',
      'The discs are fried in oil.',
      'The noodles are cooled.',
      'Flavourings and dried vegetables are added; cups are sealed and labelled.',
    ],
  },
  {
    id: 't1-6',
    chart: 'line',
    prompt: 'The graph below shows electricity production from four sources in a country between 1980 and 2020.',
    unit: 'terawatt hours (TWh)',
    labels: ['1980', '1990', '2000', '2010', '2020'],
    series: [
      { name: 'Coal', values: [60, 70, 75, 65, 50] },
      { name: 'Natural gas', values: [10, 20, 35, 45, 48] },
      { name: 'Nuclear', values: [15, 20, 20, 18, 15] },
      { name: 'Renewables', values: [2, 3, 6, 15, 35] },
    ],
  },
];

export const TASK2 = [
  {
    id: 't2-1', kind: 'Opinion',
    prompt: 'Some people think that university education should be free for all students. To what extent do you agree or disagree?',
    model: `In many countries, students graduate with large debts, which has led some people to argue that university should be free for everyone. While I accept that cost should never stop a talented student from studying, I do not believe that making higher education completely free is the fairest or most effective solution.

Supporters of free tuition make a strong case. A university degree increasingly determines a person’s income, so fees can lock young people from poor families out of well-paid careers. Society also benefits from a highly educated workforce: doctors, engineers and teachers trained at public expense contribute to the economy and pay taxes for decades. From this perspective, tuition is an investment rather than a cost.

However, free tuition for all has significant drawbacks. Universities must be funded somehow, and if students do not pay, the burden falls on all taxpayers, including many people who never attend university and earn far less than graduates. In practice, free systems often benefit middle-class families most, because their children are more likely to reach university in the first place. Moreover, when governments cannot afford to fund every place, they may limit student numbers or allow teaching quality to decline.

A better approach, in my view, is targeted support. Students from low-income families could receive full scholarships and living grants, while others repay their fees through loans that are collected only once they earn above a certain salary. This keeps university open to everyone with ability while asking those who benefit most to contribute.

In conclusion, although the aim of free university education is admirable, I believe that means-tested grants combined with income-based repayment would achieve the same goal more fairly.`,
  },
  { id: 't2-2', kind: 'Discussion', prompt: 'Some people believe that children should start school at the age of four, while others think that seven is a better age. Discuss both views and give your own opinion.' },
  {
    id: 't2-3', kind: 'Problem and solution',
    prompt: 'In many cities, traffic congestion is getting worse. What are the main causes of this problem, and what solutions can you suggest?',
    model: `Traffic congestion has become a daily reality in many cities, wasting time and polluting the air. This essay will examine the main causes of the problem and suggest some practical solutions.

The most obvious cause is the rapid growth in car ownership. As incomes rise, more families can afford a private car, and in cities where public transport is slow or unreliable, driving seems the only sensible choice. A second cause is poor urban planning. When homes, offices and schools are built far apart, people are forced to travel long distances every day, and if most workplaces are concentrated in a single business district, a huge number of journeys converge on the same roads at the same hours.

Several measures could ease the situation. First, governments should invest in fast, frequent and affordable public transport. Dhaka’s metro rail, for instance, has made some journeys far quicker than travelling by road, and people will leave their cars at home when a genuinely faster option exists. Second, cities could make driving less attractive at peak times, for example through congestion charges like those used in London and Singapore, with the revenue spent on better buses. Finally, in the long term, planners should encourage mixed-use neighbourhoods where people can live, work and shop within a short distance, and employers could reduce rush-hour traffic by allowing flexible working hours.

In conclusion, congestion is caused mainly by rising car ownership and poorly planned cities. Better public transport, charges on driving at busy times and smarter planning would together go a long way towards solving the problem.`,
  },
  {
    id: 't2-4', kind: 'Advantages and disadvantages',
    prompt: 'More and more people are working from home. Do the advantages of this trend outweigh the disadvantages?',
    model: `A growing number of employees now work from home for at least part of the week. In my opinion, for most office workers, the advantages of this trend outweigh the disadvantages, provided that it is managed well.

The benefits are considerable. The most obvious is the time and money saved on commuting. In large cities, workers may spend two or three hours a day travelling, so working from home gives them more time for rest, exercise and family. It also reduces traffic and pollution. Furthermore, many people find that they can concentrate better at home, away from the interruptions of an open-plan office, which can increase productivity. For employers, a smaller office can mean significantly lower costs.

Nevertheless, there are real drawbacks. Working alone can lead to isolation, especially for young employees who live by themselves and rely on the workplace for social contact. New staff may also learn more slowly, because they miss the informal advice they would receive from experienced colleagues. In addition, when the home becomes the office, it can be difficult to switch off, and some people end up working longer hours than before.

However, these problems can largely be solved by a hybrid model, in which employees come to the office two or three days a week for meetings, training and teamwork, and work from home on the other days. This keeps most of the benefits while limiting the risks.

In conclusion, although working from home can cause loneliness and blur the line between work and private life, its advantages in time, cost and productivity are greater, particularly when combined with regular days in the office.`,
  },
  { id: 't2-5', kind: 'Opinion', prompt: 'Governments should spend money on public transport rather than on building new roads. To what extent do you agree or disagree?' },
  {
    id: 't2-6', kind: 'Two-part question',
    prompt: 'Many young people today want to study at universities abroad. Why is this? Is it a positive or negative development?',
    model: `Every year, more young people leave their home countries to study at foreign universities. This essay will explain why this trend is growing and argue that, on balance, it is a positive development.

There are several reasons for the popularity of studying abroad. Firstly, degrees from universities in countries such as the UK, Canada and Australia are widely respected by employers, so students believe that a foreign qualification will improve their career prospects. Secondly, some subjects and research facilities are simply not available at home. In addition, many students see studying abroad as a chance to become fluent in English, to gain independence and, in some cases, to find work and settle in the country after graduating.

In my view, this development is largely positive. Students gain not only knowledge but also cross-cultural skills and confidence that are valuable in a global job market. Their home countries can also benefit: graduates who return bring new ideas and international connections, and those who stay abroad often send money home to support their families.

Admittedly, there is a risk of a “brain drain” if many of the most talented young people never come back. However, this is better addressed by creating attractive opportunities at home than by discouraging students from going abroad.

In conclusion, young people study overseas mainly to improve their career prospects and gain experiences unavailable at home. Although the loss of talent is a genuine concern, the benefits for both individuals and their countries make this a positive trend.`,
  },
  { id: 't2-7', kind: 'Discussion', prompt: 'Some people think that the best way to reduce crime is to give longer prison sentences. Others believe there are better alternatives. Discuss both views and give your opinion.' },
  { id: 't2-8', kind: 'Opinion', prompt: 'Advertising aimed at children should be banned. To what extent do you agree or disagree?' },
  { id: 't2-9', kind: 'Problem and solution', prompt: 'Obesity among children is increasing in many countries. What are the causes of this, and what can be done to solve the problem?' },
  { id: 't2-10', kind: 'Advantages and disadvantages', prompt: 'Online shopping is replacing traditional shops. Do the advantages of this outweigh the disadvantages?' },
  { id: 't2-11', kind: 'Opinion', prompt: 'Unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree?' },
  { id: 't2-12', kind: 'Discussion', prompt: 'Some people believe that museums and art galleries should be free to enter. Others think visitors should pay. Discuss both views and give your own opinion.' },
  { id: 't2-13', kind: 'Two-part question', prompt: 'People today spend less time with their families than in the past. Why is this? What effects does it have?' },
  { id: 't2-14', kind: 'Opinion', prompt: 'Modern technology has made people less sociable. To what extent do you agree or disagree?' },
  { id: 't2-15', kind: 'Problem and solution', prompt: 'Many people find it difficult to maintain a healthy balance between work and their personal lives. What are the causes, and what measures could be taken?' },
  { id: 't2-16', kind: 'Discussion', prompt: 'Some people think that rich countries should help poorer countries with money and expertise. Others believe they should solve their own problems first. Discuss both views and give your opinion.' },
  { id: 't2-17', kind: 'Opinion', prompt: 'The money spent on space exploration would be better spent on solving problems on Earth. To what extent do you agree or disagree?' },
  { id: 't2-18', kind: 'Advantages and disadvantages', prompt: 'An increasing number of older people now live alone. Does this trend have more advantages or disadvantages?' },
  { id: 't2-19', kind: 'Opinion', prompt: 'Schools should teach practical skills such as managing money instead of academic subjects like history. To what extent do you agree or disagree?' },
  { id: 't2-20', kind: 'Two-part question', prompt: 'Many languages are disappearing around the world. Why is this happening? Does it matter if languages die out?' },
  { id: 't2-21', kind: 'Opinion', prompt: 'Governments should put a tax on sugary foods and drinks to improve public health. To what extent do you agree or disagree?' },
  { id: 't2-22', kind: 'Discussion', prompt: 'Some people think the news media should focus on positive stories, while others believe it should report problems. Discuss both views and give your opinion.' },
  { id: 't2-23', kind: 'Problem and solution', prompt: 'Plastic waste is polluting the world’s oceans. What are the causes of this problem, and what can be done about it?' },
  { id: 't2-24', kind: 'Opinion', prompt: 'Zoos should be closed because it is wrong to keep animals in captivity. To what extent do you agree or disagree?' },
];

// Self-check against the four marking criteria, worded as Band 7 targets
export const CHECKLIST = {
  task1: [
    ['Task achievement', ['I wrote an overview of the main trends or differences.', 'I picked out the key features and compared them.', 'My figures are accurate and I gave no personal opinion.', 'I wrote at least 150 words.']],
    ['Coherence and cohesion', ['My paragraphs are logically grouped.', 'I used linking words naturally, not in every sentence.']],
    ['Vocabulary', ['I varied the language of change (rose, a sharp increase, peaked at…).', 'I avoided repeating the words from the question.']],
    ['Grammar', ['I used the correct tense for the time period.', 'I used some complex sentences, and most sentences have no errors.']],
  ],
  task2: [
    ['Task response', ['I answered every part of the question.', 'My position is clear from the introduction to the conclusion.', 'Each main idea is explained and supported with an example.', 'I wrote at least 250 words.']],
    ['Coherence and cohesion', ['Each body paragraph has one clear central idea.', 'Ideas progress logically and I used reference words (this, such, these).', 'I used linkers naturally, not mechanically.']],
    ['Vocabulary', ['I used some less common words and natural collocations.', 'My word choice is precise and spelling is mostly correct.']],
    ['Grammar', ['I used a mix of simple and complex sentences.', 'Most of my sentences have no errors, and punctuation is correct.']],
  ],
};
