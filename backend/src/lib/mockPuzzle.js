const mockPrivatePuzzle = {
  titleClue: "Night sky traveler",
  finalAnswer: "COMET",
  words: [
    {
      clue: "Part of a lock that clicks shut",
      answer: "CATCH",
      circleIndex: 0,
      prefilledIndices: [1, 4],
    },
    {
      clue: "Person in charge",
      answer: "OWNER",
      circleIndex: 0,
      prefilledIndices: [1, 3],
    },
    {
      clue: "Tiny or slight",
      answer: "SMALL",
      circleIndex: 1,
      prefilledIndices: [0, 4],
    },
    {
      clue: "Ship's wheel, figuratively",
      answer: "HELM",
      circleIndex: 1,
      prefilledIndices: [0, 2],
    },
    {
      clue: "Follow behind slowly",
      answer: "TRAIL",
      circleIndex: 0,
      prefilledIndices: [1, 5],
    },
  ],
};

export function createMockPuzzlePayload() {
  const scrambledLetters = ["E", "T", "C", "O", "M"];
  const revealSlotsByWord = [2, 3, 4, 0, 1];

  return {
    privatePuzzle: mockPrivatePuzzle,
    publicPuzzle: {
      titleClue: mockPrivatePuzzle.titleClue,
      finalLength: mockPrivatePuzzle.finalAnswer.length,
      scrambledLetters,
      revealSlotsByWord,
      words: mockPrivatePuzzle.words.map((word) => ({
        clue: word.clue,
        length: word.answer.length,
        circleIndex: word.circleIndex,
        cells: [...word.answer].map((letter, index) => ({
          index,
          given: word.prefilledIndices.includes(index),
          value: word.prefilledIndices.includes(index) ? letter : "",
        })),
      })),
    },
  };
}
