/** Pure state machine for the typing placeholder, so the timing is easy to test. */

export interface TypingState {
  word: number;
  chars: number;
  deleting: boolean;
}

export const TYPING = {
  typeMs: 90,
  deleteMs: 45,
  holdMs: 1400,
  gapMs: 350,
} as const;

export const TYPING_START: TypingState = { word: 0, chars: 0, deleting: false };

/** Text to show for a state. */
export function typingText(state: TypingState, words: readonly string[]): string {
  const word = words[state.word % words.length] ?? "";
  return word.slice(0, state.chars);
}

/** Next state, and how long to wait before applying it. */
export function nextTyping(state: TypingState, words: readonly string[]): { state: TypingState; delay: number } {
  const word = words[state.word % words.length] ?? "";
  if (!state.deleting) {
    if (state.chars < word.length) return { state: { ...state, chars: state.chars + 1 }, delay: TYPING.typeMs };
    return { state: { ...state, deleting: true }, delay: TYPING.holdMs };
  }
  if (state.chars > 0) return { state: { ...state, chars: state.chars - 1 }, delay: TYPING.deleteMs };
  return { state: { word: (state.word + 1) % words.length, chars: 0, deleting: false }, delay: TYPING.gapMs };
}
