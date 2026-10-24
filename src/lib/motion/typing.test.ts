import { describe, expect, it } from "vitest";
import { nextTyping, TYPING, TYPING_START, typingText, type TypingState } from "./typing";

const WORDS = ["ab", "xyz"];

function run(steps: number): { state: TypingState; texts: string[] } {
  let state = TYPING_START;
  const texts: string[] = [];
  for (let i = 0; i < steps; i++) {
    state = nextTyping(state, WORDS).state;
    texts.push(typingText(state, WORDS));
  }
  return { state, texts };
}

describe("typing placeholder", () => {
  it("types, holds, deletes, then moves to the next word", () => {
    expect(run(8).texts).toEqual(["a", "ab", "ab", "a", "", "", "x", "xy"]);
  });

  it("waits longer at the end of a word than between letters", () => {
    const full: TypingState = { word: 0, chars: 2, deleting: false };
    expect(nextTyping(full, WORDS).delay).toBe(TYPING.holdMs);
    expect(nextTyping(TYPING_START, WORDS).delay).toBe(TYPING.typeMs);
  });

  it("loops back to the first word", () => {
    const lastEmpty: TypingState = { word: 1, chars: 0, deleting: true };
    expect(nextTyping(lastEmpty, WORDS).state).toEqual(TYPING_START);
  });
});
