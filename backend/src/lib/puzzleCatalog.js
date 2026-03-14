import { preparePuzzlePayload } from "./generatePuzzle.js";

const curatedLaunchPuzzles = [
  {
    titleClue: "Streaking object in the night sky",
    finalAnswer: "COMET",
    words: [
      { clue: "Part of a lock that clicks shut", answer: "CATCH", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Person in charge", answer: "OWNER", circleIndex: 0, prefilledIndices: [1, 3] },
      { clue: "Tiny or slight", answer: "SMALL", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Ship's wheel, figuratively", answer: "HELM", circleIndex: 1, prefilledIndices: [0, 2] },
      { clue: "Follow behind slowly", answer: "TRAIL", circleIndex: 0, prefilledIndices: [1, 4] },
    ],
  },
  {
    titleClue: "Spooky presence",
    finalAnswer: "GHOST",
    words: [
      { clue: "Winter handwear", answer: "GLOVE", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Seat with four legs", answer: "CHAIR", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Last letter in Greek", answer: "OMEGA", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Something to weigh with", answer: "SCALE", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Sample on the tongue", answer: "TASTE", circleIndex: 0, prefilledIndices: [1, 4] },
    ],
  },
  {
    titleClue: "Tongue of fire",
    finalAnswer: "FLAME",
    words: [
      { clue: "Icy coating", answer: "FROST", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Moon-related", answer: "LUNAR", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Yellow-orange gem", answer: "AMBER", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "What a violin makes", answer: "MUSIC", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Point at the joint", answer: "ELBOW", circleIndex: 0, prefilledIndices: [1, 4] },
    ],
  },
  {
    titleClue: "Give off light",
    finalAnswer: "SHINE",
    words: [
      { clue: "Simple geometric form", answer: "SHAPE", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Board-game squares", answer: "CHESS", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Pale tusk material", answer: "IVORY", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Body part between leg and foot", answer: "ANKLE", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Historical period", answer: "EPOCH", circleIndex: 0, prefilledIndices: [1, 4] },
    ],
  },
  {
    titleClue: "Tall wading bird",
    finalAnswer: "CRANE",
    words: [
      { clue: "Overcast mass above", answer: "CLOUD", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Loaf food", answer: "BREAD", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Corner measurement", answer: "ANGLE", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Sharp kitchen tool", answer: "KNIFE", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Keen and eager", answer: "EAGER", circleIndex: 0, prefilledIndices: [1, 4] },
    ],
  },
  {
    titleClue: "Sudden burst from a fire",
    finalAnswer: "SPARK",
    words: [
      { clue: "Solid building material", answer: "STONE", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Stage song with orchestra", answer: "OPERA", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Tree fruit or seed head", answer: "ACORN", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Wall unit of clay", answer: "BRICK", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Soft writing stick", answer: "CHALK", circleIndex: 4, prefilledIndices: [1, 3] },
    ],
  },
];

function shuffle(values) {
  const copy = [...values];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

export class PuzzleCatalog {
  constructor(activePuzzleLimit = 20, persistedState = null, onChange = () => {}) {
    this.puzzles = rawPuzzleCatalog.map((rawPuzzle) => preparePuzzlePayload(rawPuzzle));
    const safeLimit = Math.max(1, Math.min(activePuzzleLimit, this.puzzles.length));
    const savedOrder = Array.isArray(persistedState?.order) ? persistedState.order : null;
    const savedPointer = Number.isInteger(persistedState?.pointer) ? persistedState.pointer : 0;
    const hasUsableSavedState =
      savedOrder &&
      savedOrder.length === safeLimit &&
      new Set(savedOrder).size === savedOrder.length &&
      savedOrder.every((index) => Number.isInteger(index) && index >= 0 && index < this.puzzles.length);

    this.order = hasUsableSavedState
      ? savedOrder
      : shuffle(this.puzzles.map((_value, index) => index)).slice(0, safeLimit);
    this.pointer = Math.max(0, Math.min(savedPointer, this.order.length));
    this.onChange = onChange;
    this.persist();
  }

  next() {
    if (this.pointer >= this.order.length) {
      return null;
    }

    const puzzle = this.puzzles[this.order[this.pointer]];
    this.pointer += 1;
    this.persist();
    return puzzle;
  }

  remaining() {
    return Math.max(0, this.order.length - this.pointer);
  }

  total() {
    return this.order.length;
  }

  persist() {
    this.onChange(this.order, this.pointer);
  }
}
