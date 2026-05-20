const sgNames = ['Wei Ming', 'Priya', 'Raju', 'Ahmad', 'Siti', 'Jun', 'Xiao Ling', 'Ryan', 'Mei', 'Arjun'];
const sgObjects = ['fishballs', 'stickers', 'balloons', 'marbles', 'biscuits', 'sweets', 'apples', 'books', 'erasers', 'stars', 'fish', 'flowers', 'pencils', 'shells', 'buttons'];
const emojiMap = {
  'fishballs': '🍢', 'stickers': '🏷️', 'balloons': '🎈', 'marbles': '🔮', 'biscuits': '🍪',
  'sweets': '🍬', 'apples': '🍎', 'books': '📚', 'erasers': '🧽', 'stars': '🌟',
  'fish': '🐟', 'flowers': '🌸', 'pencils': '✏️', 'shells': '🐚', 'buttons': '🔘'
};
const actionVerbs = ['ate', 'gave away', 'lost', 'used', 'broke'];
const themes = [
  'Hawker Centre', 'Playground', 'School Library', 'Night Safari', 'Gardens by Bay',
  'MRT Adventure', 'Sentosa Beach', 'Sports Day', 'Birthday Party', 'Math Champions'
];

export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export function generateDistractors(correct, min = 0, max = 20, count = 3) {
  const distractors = new Set();
  let attempts = 0;
  while (distractors.size < count && attempts < 50) {
    const offset = (Math.random() > 0.5 ? 1 : -1) * (Math.ceil(Math.random() * 3));
    const d = correct + offset;
    if (d >= min && d <= max && d !== correct) distractors.add(d);
    attempts++;
  }
  [correct - 1, correct + 1, correct + 2, correct - 2].forEach(d => {
    if (d >= min && d <= max && d !== correct && distractors.size < count)
      distractors.add(d);
  });
  return shuffleArray([correct, ...distractors]).slice(0, 4);
}

function generateNumbers(difficulty) {
  let whole, part1, part2;
  if (difficulty === 1) { // Easy: within 10
    whole = Math.floor(Math.random() * 6) + 5; // 5-10
  } else if (difficulty === 2) { // Medium: within 15
    whole = Math.floor(Math.random() * 6) + 10; // 10-15
  } else { // Hard: within 20
    whole = Math.floor(Math.random() * 6) + 15; // 15-20
  }
  part1 = Math.floor(Math.random() * (whole - 1)) + 1; // 1 to whole-1
  part2 = whole - part1;
  return { whole, part1, part2 };
}

function getBase(id, type, difficulty) {
  const { whole, part1, part2 } = generateNumbers(difficulty);
  const characterName = pick(sgNames);
  const objectName = pick(sgObjects);
  const objectEmoji = emojiMap[objectName];
  const actionVerb = pick(actionVerbs);
  
  return {
    id, type, difficulty,
    whole, part1, part2,
    characterName, objectName, objectEmoji, actionVerb,
    hint1Visual: 'bond', hint2Visual: 'counters'
  };
}

// Q1: word_mcq
function genQ1(id, diff) {
  const b = getBase(id, 'word_mcq', diff);
  b.missingSlot = 'part2';
  b.questionText = `${b.characterName} had ${b.whole} ${b.objectName}. He ${b.actionVerb} ${b.part1}. How many ${b.objectName} did he have left?`;
  b.answerSentence = `${b.characterName} had [${b.part2}] ${b.objectName} left.`;
  b.visual = 'counters_with_story';
  b.options = generateDistractors(b.part2);
  b.correctAnswer = b.part2;
  b.hint1Text = `Draw a number bond. The whole is ${b.whole}. One part is ${b.part1}.`;
  b.hint2Text = `Show ${b.whole} ${b.objectName}. Take away ${b.part1}. Count what is left.`;
  b.explanation = `${b.whole} – ${b.part1} = ${b.part2}. ${b.characterName} had ${b.part2} ${b.objectName} left.`;
  return b;
}

// Q2: word_bond
function genQ2(id, diff) {
  const b = getBase(id, 'word_bond', diff);
  b.missingSlot = 'part2';
  b.questionText = `${b.characterName} had ${b.whole} ${b.objectName}. She ${b.actionVerb} ${b.part1}. How many ${b.objectName} were left?`;
  b.answerSentence = `${b.characterName} had [${b.part2}] ${b.objectName} left.`;
  b.visual = 'bond_with_story';
  b.options = generateDistractors(b.part2);
  b.correctAnswer = b.part2;
  b.hint1Text = `Put ${b.whole} at the top of the number bond. Put ${b.part1} in one circle.`;
  b.hint2Text = `${b.whole} take away ${b.part1}. Start at ${b.whole} and count back ${b.part1} steps.`;
  b.explanation = `${b.whole} – ${b.part1} = ${b.part2}. ${b.characterName} had ${b.part2} ${b.objectName} left.`;
  return b;
}

// Q3: word_sentence
function genQ3(id, diff) {
  const b = getBase(id, 'word_sentence', diff);
  b.missingSlot = 'part2';
  b.questionText = `Write the subtraction sentence for this story: ${b.characterName} had ${b.whole} ${b.objectName}. He ${b.actionVerb} ${b.part1}.`;
  b.answerSentence = `${b.characterName} had [${b.part2}] ${b.objectName} left.`;
  b.visual = 'sentence_with_bond';
  b.correctAnswer = b.part2;
  b.hint1Text = `Start with the whole: ${b.whole}. Then minus the part taken away: ${b.part1}.`;
  b.hint2Text = `${b.whole} – ${b.part1} = ?`;
  b.explanation = `The sentence is ${b.whole} – ${b.part1} = ${b.part2}.`;
  return b;
}

// Q4: answer_sentence
function genQ4(id, diff) {
  const b = getBase(id, 'answer_sentence', diff);
  b.missingSlot = 'part2';
  b.questionText = `${b.characterName} had ${b.whole} ${b.objectName}. She ${b.actionVerb} ${b.part1}. How many left?`;
  b.answerSentence = `${b.characterName} has [${b.part2}] ${b.objectName} left.`;
  b.visual = 'counters_with_story';
  b.options = generateDistractors(b.part2);
  b.correctAnswer = b.part2;
  b.hint1Text = `Use the number bond to find the missing part.`;
  b.hint2Text = `${b.whole} minus ${b.part1} leaves...`;
  b.explanation = `${b.whole} – ${b.part1} = ${b.part2}.`;
  return b;
}

// Q5: picture_word
function genQ5(id, diff) {
  const b = getBase(id, 'picture_word', diff);
  b.missingSlot = 'part2';
  b.questionText = `Look at the picture! There are ${b.whole} ${b.objectName}. ${b.part1} are crossed out. How many are left?`;
  b.answerSentence = `There are [${b.part2}] left.`;
  b.visual = 'counters_with_story';
  b.options = generateDistractors(b.part2);
  b.correctAnswer = b.part2;
  b.hint1Text = `Count the ${b.objectName} that are NOT crossed out.`;
  b.hint2Text = `${b.whole} take away ${b.part1} is...`;
  b.explanation = `${b.whole} – ${b.part1} = ${b.part2}.`;
  return b;
}

// Q6: find_whole
function genQ6(id, diff) {
  const b = getBase(id, 'find_whole', diff);
  b.missingSlot = 'whole';
  b.questionText = `${b.characterName} ${b.actionVerb} ${b.part1} ${b.objectName}. He has ${b.part2} ${b.objectName} left. How many did he have at the start?`;
  b.answerSentence = `${b.characterName} had [${b.whole}] ${b.objectName} at the start.`;
  b.visual = 'bond_with_story';
  b.options = generateDistractors(b.whole);
  b.correctAnswer = b.whole;
  b.hint1Text = `The two parts are ${b.part1} and ${b.part2}. Add them to find the whole.`;
  b.hint2Text = `${b.part1} + ${b.part2} = ? That is the whole number.`;
  b.explanation = `${b.part1} + ${b.part2} = ${b.whole}. He had ${b.whole} at the start.`;
  return b;
}

// Q7: add_or_subtract
function genQ7(id, diff) {
  const b = getBase(id, 'add_or_subtract', diff);
  const isAdd = Math.random() > 0.5;
  b.missingSlot = 'none';
  if (isAdd) {
    b.questionText = `${b.characterName} had ${b.part1} ${b.objectName}. His friend gave him ${b.part2} MORE. Should we add or subtract to find the total?`;
    b.correctAnswer = 'add';
    b.explanation = `He got MORE, so we add! ${b.part1} + ${b.part2} = ${b.whole}.`;
  } else {
    b.questionText = `${b.characterName} had ${b.whole} ${b.objectName}. He ${b.actionVerb} ${b.part1}. Should we add or subtract to find how many are left?`;
    b.correctAnswer = 'subtract';
    b.explanation = `He ${b.actionVerb} some, so we subtract! ${b.whole} - ${b.part1} = ${b.part2}.`;
  }
  b.answerSentence = "";
  b.visual = 'bond_only';
  b.options = ['add', 'subtract'];
  b.hint1Text = `Did he get more, or lose some?`;
  b.hint2Text = `More means add. Lost means subtract.`;
  return b;
}

// Q8: match_bond
function genQ8(id, diff) {
  const b = getBase(id, 'match_bond', diff);
  b.missingSlot = 'none';
  b.questionText = `${b.characterName} had ${b.whole} ${b.objectName}. He ${b.actionVerb} ${b.part1}. Which number bond matches the story?`;
  b.answerSentence = "";
  b.visual = 'four_bonds_choice';
  b.correctAnswer = `W:${b.whole},P:${b.part1},${b.part2}`;
  b.options = generateDistractors(b.part1, 1, 20, 3).map(d => `W:${b.whole},P:${d},${b.whole-d}`);
  b.options.push(b.correctAnswer);
  b.options = shuffleArray(b.options);
  b.hint1Text = `The story starts with ${b.whole}. That is the whole at the top.`;
  b.hint2Text = `He ${b.actionVerb} ${b.part1}. That is one part.`;
  b.explanation = `The whole is ${b.whole}, and the parts are ${b.part1} and ${b.part2}.`;
  return b;
}

// Q9: true_false
function genQ9(id, diff) {
  const b = getBase(id, 'true_false', diff);
  const isTrue = Math.random() > 0.5;
  const fakePart2 = isTrue ? b.part2 : (b.part2 + (Math.random() > 0.5 ? 1 : -1));
  b.missingSlot = 'none';
  b.questionText = `${b.characterName} had ${b.whole} ${b.objectName}. He ${b.actionVerb} ${b.part1}. The number sentence is: ${b.whole} – ${b.part1} = ${fakePart2}. Is this True or False?`;
  b.answerSentence = "";
  b.visual = 'true_false_card';
  b.options = ['True', 'False'];
  b.correctAnswer = isTrue ? 'True' : 'False';
  b.hint1Text = `Calculate ${b.whole} – ${b.part1}. Does it equal ${fakePart2}?`;
  b.hint2Text = `Use your counters to check!`;
  b.explanation = `${b.whole} – ${b.part1} is ${b.part2}. So the sentence is ${isTrue ? 'True' : 'False'}.`;
  return b;
}

// Q10: word_tile
function genQ10(id, diff) {
  const b = getBase(id, 'word_tile', diff);
  b.missingSlot = 'part2';
  b.questionText = `${b.characterName} had ${b.whole} ${b.objectName}. She ${b.actionVerb} ${b.part1}. Complete the answer sentence!`;
  b.answerSentence = `${b.characterName} has [${b.part2}] ${b.objectName} left.`;
  b.visual = 'word_tiles';
  b.options = shuffleArray([b.characterName, b.part2.toString(), b.objectName, 'left.']);
  b.correctAnswer = `${b.characterName} has ${b.part2} ${b.objectName} left.`;
  b.hint1Text = `Start with the person's name: ${b.characterName}.`;
  b.hint2Text = `The missing number is ${b.part2}.`;
  b.explanation = `The correct sentence is: ${b.characterName} has ${b.part2} ${b.objectName} left.`;
  return b;
}

const generators = [genQ1, genQ2, genQ3, genQ4, genQ5, genQ6, genQ7, genQ8, genQ9, genQ10];

// PRD specific difficulty splits per type (Easy/Medium/Hard)
const diffSplit = {
  0: [1,1,1,1, 2,2,2,2, 3,3], // Q1: 4 easy, 4 med, 2 hard
  1: [1,1,1,1, 2,2,2, 3,3,3], // Q2: 4 easy, 3 med, 3 hard
  2: [1,1,1,1, 2,2,2,2, 3,3], // Q3: 4 easy, 4 med, 2 hard
  3: [1,1,1, 2,2,2,2, 3,3,3], // Q4: 3 easy, 4 med, 3 hard
  4: [1,1,1,1,1, 2,2,2, 3,3], // Q5: 5 easy, 3 med, 2 hard
  5: [1,1,1, 2,2,2,2, 3,3,3], // Q6: 3 easy, 4 med, 3 hard
  6: [1,1,1,1,1, 2,2,2, 3,3], // Q7: 5 easy, 3 med, 2 hard
  7: [1,1,1,1, 2,2,2,2, 3,3], // Q8: 4 easy, 4 med, 2 hard
  8: [1,1,1,1, 2,2,2,2, 3,3], // Q9: 4 easy, 4 med, 2 hard
  9: [1,1,1, 2,2,2,2, 3,3,3], // Q10: 3 easy, 4 med, 3 hard
};

export function generateSessionQuestions() {
  const bank = [];
  
  // Group by type
  for (let typeIdx = 0; typeIdx < 10; typeIdx++) {
    const diffs = diffSplit[typeIdx];
    for (let i = 0; i < 10; i++) {
      const qid = `Q${typeIdx + 1}_${String(i + 1).padStart(3, '0')}`;
      const diff = diffs[i];
      const q = generators[typeIdx](qid, diff);
      bank.push(q);
    }
  }
  
  // Distribute across 10 worlds (10 questions per world)
  // According to PRD: World 1 (Q 1-10 easy), World 2 (Q 11-20 med) etc.
  // We'll just shuffle all questions and assign worlds 0-9
  const selected = shuffleArray(bank);
  selected.forEach((q, index) => {
    q.world = Math.floor(index / 10);
    q.worldTheme = themes[q.world];
  });
  
  return selected;
}
