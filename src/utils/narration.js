// ──────────────────────────────────────────────────
// Narration Scripts — Exact Screen Text Match
// ──────────────────────────────────────────────────

import { say, ask, cheer, emphasize, think, celebrate, instruct, pause } from './audio';

// ─── INTRO SCREEN ────────────────────────────────
export function introNarration() {
  return [
    say("Welcome to Word Problems Using Subtraction!"),
    say("In this lesson, you will learn how to solve subtraction word problems."),
    cheer("Let's start our adventure!"),
  ];
}

// ─── WONDER PHASE ────────────────────────────────
export function wonderNarration() {
  return [
    ask("Siti had 10 balloons at her party. Some flew away! Now she has 6. How many flew away?"),
    think("Hmm... I wonder how we can find out?"),
  ];
}

export function wonderDiscoverNarration() {
  return [
    cheer("Let's learn how to solve it together!")
  ];
}

// ─── STORY PHASE ─────────────────────────────────

export function getStoryNarration(slideIndex) {
  switch (slideIndex) {
    case 0:
      return [
        say("Wei Ming is at the hawker centre. He has 9 fishballs!"),
      ];
    case 1:
      return [
        say("He eats 4 fishballs. Yum, yum, yum!"),
      ];
    case 2:
      return [
        ask("How many fishballs does Wei Ming have left?"),
      ];
    case 3:
      return [
        emphasize("What do we know? The whole is 9. One part is 4."),
      ];
    case 4:
      return [
        think("We need to find the other part. This is what is left!"),
      ];
    case 5:
      return [
        instruct("Draw the number bond. Put 9 at the top. Put 4 in one circle."),
        emphasize("Now write the number sentence. 9 minus 4 equals 5."),
      ];
    case 6:
      return [
        celebrate("Wei Ming has 5 fishballs left!"),
      ];
    default:
      return [];
  }
}

// ─── SIMULATE PHASE ──────────────────────────────

export function simulateStation1Intro() {
  return [
    say("Station One! Read the story. Now place the counters."),
    instruct("Great! Now take away the right number of counters."),
    ask("How many are left?")
  ];
}

export function simulateStation2Intro() {
  return [
    say("Station Two! Look at the number bond."),
    say("Drag the numbers into the correct circles."),
    say("The whole goes at the top. The parts go at the bottom.")
  ];
}

export function simulateStation3Intro() {
  return [
    say("Station Three! Write the subtraction sentence."),
    say("Tap each box and type the number."),
    say("Then complete the answer sentence.")
  ];
}

export function simulateAllComplete() {
  return [
    celebrate("Amazing! You solved the word problem!"),
    celebrate("Brilliant! You used the number bond perfectly!"),
    celebrate("You're a maths superstar! Keep going!")
  ]; 
}

// ─── PLAY PHASE ──────────────────────────────────

export function playWorldIntro(worldName) {
  return [
    celebrate(`Welcome to ${worldName}!`),
  ];
}

export function playReadQuestion(questionText) {
  return [
    say(questionText),
  ];
}

export function getHelpNarration(hintLevel = 1) {
  return [];
}

export function getEncouragementNarration() {
  return [];
}

export function playCorrectNarration(streak = 0) {
  return [
    cheer("Wonderful! That's exactly right!")
  ];
}

export function playWrongNarration() {
  return [
    think("Let's try again! Read the problem carefully."),
    think("Almost there! Think about what we need to find."),
    think("Hmm... look at the number bond. It will help you!")
  ];
}

export function playWorldComplete(worldName, score, total) {
  return [
    say(`${worldName} Complete!`),
    say(`Score: ${score} out of ${total}`),
  ];
}

// ─── REFLECT PHASE ───────────────────────────────

export function reflectIntroNarration() {
  return [
    celebrate("Wonderful! You are a Word Problem Champion!"),
    ask("Tell me one thing you learned today!"),
    ask("Can you make up your own subtraction word problem?")
  ];
}

export function reflectCorrectNarration() {
  return [];
}

export function reflectWrongNarration() {
  return [];
}

export function reflectConfidenceNarration() {
  return [];
}

export function reflectCertificateNarration(pct) {
  return [
    say(`You scored ${Math.round(pct)}%`),
  ];
}
