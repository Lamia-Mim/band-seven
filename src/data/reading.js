// Original Academic Reading passages written for this app, with IELTS-style
// questions. Together the three make one full Reading test (40 questions).
//
// Question group types:
//   tfng      TRUE / FALSE / NOT GIVEN
//   mcq       options A–D (answer is a letter)
//   choose    pick from a shared list (headings, paragraphs, floors…)
//   gap       type the answer; `answer` lists every accepted spelling

export const TFNG_INSTRUCTION = 'Do the following statements agree with the information given in the passage? Choose TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, or NOT GIVEN if there is no information on this.';

export const READING = [
  {
    id: 'r1',
    title: 'The Return of the Bicycle',
    level: 'Passage 1 · easier',
    paragraphs: [
      'When the first pedal-powered bicycles appeared in Paris in the 1860s, they were heavy wooden machines nicknamed “boneshakers” because of the rough ride they gave on cobbled streets. Within thirty years, however, the invention of the chain drive and the air-filled rubber tyre had transformed the bicycle into a light, comfortable and affordable machine. By the 1890s, cycling clubs had sprung up across Europe and North America, and for many working people the bicycle offered their first taste of independent travel.',
      'The bicycle’s golden age did not last. As cars became cheaper in the decades after the Second World War, city planners in most wealthy countries redesigned streets around motor traffic. Cycle lanes were removed to make room for wider roads and parking, and cycling came to be seen either as a sport for enthusiasts or as transport for those who could not afford anything better. In Britain, the distance travelled by bicycle fell by roughly 80 per cent between 1950 and 1975.',
      'The Netherlands followed a different path, although not at first. Dutch cities, too, built roads for cars in the 1950s and 1960s, and the number of road deaths rose sharply. By 1971, more than 3,000 people a year were being killed on Dutch roads, over 400 of them children. Public anger led to a protest movement whose name translates as “Stop the Child Murder”, and the oil crisis of 1973, when fuel prices quadrupled, strengthened the argument for towns that depended less on cars. Over the following decades, Dutch governments invested heavily in separated cycle paths, traffic-calmed residential streets and secure bicycle parking at railway stations.',
      'The results are striking. Today more than a quarter of all trips in the Netherlands are made by bicycle, and in some cities, such as Groningen, the figure is close to 60 per cent. Researchers who have studied Dutch cycling argue that safety, rather than culture or flat land, explains these numbers. They point out that cycling rates in hilly Dutch cities are not much lower than elsewhere in the country, and that cities in other countries which built similar networks saw rapid increases in cycling, even where the climate is harsher.',
      'The most recent revival has been driven partly by technology. Electric bicycles, which use a battery-powered motor to assist the rider, have extended the distance people are willing to cycle and made hills less of an obstacle. In Germany, more electric bicycles than conventional ones were sold for the first time in 2023. Bike-sharing schemes, in which users unlock bicycles with a mobile phone app, have also appeared in hundreds of cities, although some early schemes collapsed after bicycles were vandalised or abandoned in large numbers.',
      'Supporters of cycling point to its benefits for public health and air quality, and to the fact that a single car parking space can hold as many as ten bicycles. Critics respond that cycling is impractical for elderly people, for families with young children and for long journeys, and that cities should not penalise drivers who have no realistic alternative. Most transport researchers now argue that the question is not whether cars or bicycles should dominate, but how streets can be shared safely by both.',
    ],
    groups: [
      {
        type: 'tfng', instruction: TFNG_INSTRUCTION,
        items: [
          { n: 1, prompt: 'The earliest pedal bicycles were uncomfortable to ride.', answer: 'TRUE' },
          { n: 2, prompt: 'By the 1890s, bicycles were too expensive for most working people.', answer: 'FALSE' },
          { n: 3, prompt: 'After the Second World War, cycle lanes were removed in many wealthy countries.', answer: 'TRUE' },
          { n: 4, prompt: 'The Dutch protest movement was started by a group of parents.', answer: 'NOT GIVEN' },
          { n: 5, prompt: 'In 1973, fuel prices rose to four times their previous level.', answer: 'TRUE' },
          { n: 6, prompt: 'Hilly Dutch cities have much lower cycling rates than flat ones.', answer: 'FALSE' },
        ],
      },
      {
        type: 'gap', instruction: 'Complete the sentences. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer.',
        items: [
          { n: 7, prompt: 'The chain drive and the air-filled ______ made bicycles light and comfortable.', answer: ['rubber tyre', 'rubber tire', 'tyre', 'tire'] },
          { n: 8, prompt: 'In Britain, the distance cycled fell by about ______ between 1950 and 1975.', answer: ['80 per cent', '80 percent', '80%', 'eighty per cent'] },
          { n: 9, prompt: 'Dutch governments built secure bicycle parking at ______.', answer: ['railway stations', 'stations'] },
          { n: 10, prompt: 'In Groningen, nearly ______ of trips are made by bicycle.', answer: ['60 per cent', '60 percent', '60%', 'sixty per cent'] },
        ],
      },
      {
        type: 'mcq', instruction: 'Choose the correct letter, A, B, C or D.',
        items: [
          { n: 11, prompt: 'According to researchers, the main reason for high cycling rates in the Netherlands is', options: ['flat land', 'Dutch culture', 'safety', 'the climate'], answer: 'C' },
          { n: 12, prompt: 'What happened to some early bike-sharing schemes?', options: ['They were too expensive to use.', 'They failed because bicycles were vandalised or abandoned.', 'They were replaced by electric bicycles.', 'They were banned by city governments.'], answer: 'B' },
          { n: 13, prompt: 'What is the writer’s conclusion in the final paragraph?', options: ['Bicycles should replace cars in cities.', 'Cars should have priority on city streets.', 'Streets need to be designed for both cars and bicycles.', 'Cycling is practical only for young people.'], answer: 'C' },
        ],
      },
    ],
  },
  {
    id: 'r2',
    title: 'How Honeybees Find Their Way',
    level: 'Passage 2 · medium',
    lettered: true,
    paragraphs: [
      'A honeybee may fly several kilometres from its hive in search of flowers and still return directly home, often within minutes. For more than a century, scientists have tried to understand how an insect with a brain smaller than a grain of rice performs such precise navigation. The answer, it now appears, is that bees combine several different systems, switching between them according to the conditions.',
      'The most important of these is a sun compass. Bees use the position of the sun to judge direction, and they can do so even when the sun itself is hidden behind clouds. This is possible because sunlight scattered in the atmosphere is polarised in a pattern that depends on the sun’s position, and bees’ eyes contain special receptors that detect this pattern. Because the sun moves across the sky during the day, bees must also take the time into account; experiments in which hives were moved across time zones showed that bees adjust their sense of direction according to an internal clock.',
      'Bees also measure how far they have flown. Early researchers assumed that bees counted the energy they used, but in the 1990s a series of experiments with narrow tunnels overturned this idea. When bees flew through tunnels lined with black and white stripes, they behaved as if they had travelled much further than they really had. The researchers concluded that bees estimate distance from the amount of visual movement they see — the ground and objects passing beneath and beside them — a system sometimes called an “optic odometer”.',
      'Close to the hive, landmarks become more important. Bees memorise the appearance of trees, buildings and other prominent objects along a familiar route, and young bees make a series of short orientation flights before they begin collecting food, during which they appear to learn the surroundings of their home. If familiar landmarks are moved, experienced bees may search in the wrong place, which suggests that they trust these visual memories more than their compass when they are near the hive.',
      'Perhaps the most remarkable feature of bee navigation is that bees can share information about where food is. A forager that returns with news of a rich source performs a “waggle dance” on the vertical surface of the honeycomb. The angle of the dance relative to the vertical indicates the direction of the food relative to the sun, while the duration of the waggle part of the dance communicates distance. Karl von Frisch, who decoded the dance in the 1940s, shared a Nobel Prize for this work in 1973.',
      'Understanding how bees navigate has practical value. Engineers have used the optic odometer as a model for small flying robots that must find their way without satellite positioning. At the same time, studies have shown that some common pesticides impair bees’ ability to navigate, so that affected bees fail to return to the hive. Since bees pollinate around a third of the crops that humans eat, such findings have raised concern among scientists and farmers alike.',
    ],
    groups: [
      {
        type: 'choose', instruction: 'The passage has six paragraphs, A–F. Choose the correct heading for paragraphs B–F from the list of headings.',
        options: ['i  The cost of losing a navigational skill', 'ii  Using the sky even on cloudy days', 'iii  How bees tell each other where to go', 'iv  Why bees prefer certain flowers', 'v  Judging distance by what passes below', 'vi  Learning the area around home', 'vii  Lessons for technology and farming', 'viii  An early theory that was proved right'],
        items: [
          { n: 14, prompt: 'Paragraph B', answer: 'ii' },
          { n: 15, prompt: 'Paragraph C', answer: 'v' },
          { n: 16, prompt: 'Paragraph D', answer: 'vi' },
          { n: 17, prompt: 'Paragraph E', answer: 'iii' },
          { n: 18, prompt: 'Paragraph F', answer: 'vii' },
        ],
      },
      {
        type: 'gap', instruction: 'Complete the summary. Choose NO MORE THAN TWO WORDS from the passage for each answer.',
        items: [
          { n: 19, prompt: 'When the sun is hidden, bees can still find direction by detecting the pattern of ______ light.', answer: ['polarised', 'polarized'] },
          { n: 20, prompt: 'Because the sun moves, bees also rely on an internal ______.', answer: ['clock'] },
          { n: 21, prompt: 'Bees in striped tunnels overestimated distance, showing that they measure it from visual ______, not energy.', answer: ['movement'] },
          { n: 22, prompt: 'Before collecting food, young bees make short ______ flights.', answer: ['orientation'] },
        ],
      },
      {
        type: 'mcq', instruction: 'Choose the correct letter, A, B, C or D.',
        items: [
          { n: 23, prompt: 'The tunnel experiments in the 1990s showed that', options: ['bees count the energy they use.', 'bees cannot fly in narrow spaces.', 'bees judge distance from visual information.', 'bees prefer striped patterns.'], answer: 'C' },
          { n: 24, prompt: 'What happens when landmarks near a hive are moved?', options: ['Bees switch to their sun compass.', 'Experienced bees may search in the wrong place.', 'Young bees stop making orientation flights.', 'Bees abandon the hive.'], answer: 'B' },
          { n: 25, prompt: 'In the waggle dance, distance is shown by', options: ['the angle of the dance.', 'the speed of the dance.', 'how long the waggle part lasts.', 'the number of bees watching.'], answer: 'C' },
          { n: 26, prompt: 'Why are scientists concerned about certain pesticides?', options: ['They kill the flowers bees need.', 'They leave bees unable to find the hive.', 'They change the waggle dance.', 'They damage farming robots.'], answer: 'B' },
        ],
      },
    ],
  },
  {
    id: 'r3',
    title: 'The Science of Forgetting',
    level: 'Passage 3 · harder',
    lettered: true,
    paragraphs: [
      'In 1885 the German psychologist Hermann Ebbinghaus published the results of an unusual experiment in which he was both the researcher and the only participant. Over several years he memorised long lists of meaningless syllables, such as “DAX” and “BOK”, and then tested how many he could remember after different intervals. He chose nonsense syllables deliberately, so that his existing knowledge would not help him. His results produced what is now called the “forgetting curve”: memory loss is fastest in the first hour after learning and then slows down, so that much of what is forgotten is lost within the first day.',
      'Ebbinghaus also discovered something more encouraging. When he relearned a list, it took him less time than learning it had taken originally, even when he believed he had forgotten it completely. Each time he reviewed the material, the curve of forgetting became flatter, meaning that the memory lasted longer. Reviews spread out over several days were far more effective than the same number of repetitions crowded into a single session — a finding now known as the spacing effect.',
      'For most of the twentieth century, the spacing effect was well known among psychologists but largely ignored by teachers. School timetables continued to group a topic into a single block of lessons, after which students moved on and rarely returned to it until revising for an exam. Some researchers have called this one of the clearest examples of a gap between scientific knowledge and educational practice.',
      'A second technique, retrieval practice, has received growing attention since the early 2000s. In a well-known study, students who read a passage and then tried to recall it without looking remembered considerably more a week later than students who spent the same time rereading it. Interestingly, the students who reread the passage predicted that they would remember more — a sign that the feeling of familiarity created by rereading can be misleading.',
      'Not all forgetting is a failure. Many neuroscientists now argue that forgetting is an active process that helps the brain work efficiently, by removing details that are no longer useful and making it easier to generalise from experience. A person who remembered every detail of every day, they suggest, would struggle to recognise patterns or to make quick decisions.',
      'Sleep appears to play an important part in deciding what is kept. During deep sleep, the brain replays recent experiences, and studies in which participants learned pairs of words in the evening found that those who slept before being tested performed better than those who stayed awake for the same length of time. Short daytime naps have shown similar, if smaller, benefits.',
      'These findings have shaped the design of many language-learning apps, which use algorithms to schedule each word for review just before the learner is likely to forget it. Critics point out, however, that such apps tend to focus on isolated vocabulary and may not help learners use words in real conversations, where meaning depends on context.',
    ],
    groups: [
      {
        type: 'tfng', instruction: TFNG_INSTRUCTION,
        items: [
          { n: 27, prompt: 'Ebbinghaus used meaningless syllables so that what he already knew would not affect the results.', answer: 'TRUE' },
          { n: 28, prompt: 'According to the forgetting curve, people forget information at the same rate every day.', answer: 'FALSE' },
          { n: 29, prompt: 'Ebbinghaus’s experiment was later repeated by other researchers with similar results.', answer: 'NOT GIVEN' },
          { n: 30, prompt: 'Relearning a forgotten list took Ebbinghaus as long as learning it the first time.', answer: 'FALSE' },
          { n: 31, prompt: 'Teachers quickly changed their methods once the spacing effect became known.', answer: 'FALSE' },
        ],
      },
      {
        type: 'choose', instruction: 'Which paragraph, A–G, contains the following information?',
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        items: [
          { n: 32, prompt: 'a comparison between what a group expected and what actually happened', answer: 'D' },
          { n: 33, prompt: 'a possible advantage of losing memories', answer: 'E' },
          { n: 34, prompt: 'a criticism of a type of learning technology', answer: 'G' },
          { n: 35, prompt: 'a description of how school teaching was usually organised', answer: 'C' },
        ],
      },
      {
        type: 'mcq', instruction: 'Choose the correct letter, A, B, C or D.',
        items: [
          { n: 36, prompt: 'In the retrieval practice study, the students who reread the passage', options: ['remembered the most after a week.', 'wrongly believed they would remember more.', 'spent less time studying.', 'were tested immediately.'], answer: 'B' },
          { n: 37, prompt: 'What does the writer say about forgetting in paragraph E?', options: ['It is always a sign of illness.', 'It helps the brain to generalise and decide quickly.', 'It can be avoided with enough practice.', 'It mainly affects older people.'], answer: 'B' },
          { n: 38, prompt: 'The study of word pairs found that', options: ['sleeping before the test improved results.', 'evening learning is less effective than morning learning.', 'naps are more useful than a night’s sleep.', 'staying awake improves concentration.'], answer: 'A' },
        ],
      },
      {
        type: 'gap', instruction: 'Complete the sentences. Choose ONE WORD ONLY from the passage for each answer.',
        items: [
          { n: 39, prompt: 'Reviews spread over several days produce the ______ effect.', answer: ['spacing'] },
          { n: 40, prompt: 'Language apps schedule reviews using ______.', answer: ['algorithms'] },
        ],
      },
    ],
  },
];
