import { preparePuzzlePayload } from "./generatePuzzle.js";

const rawPuzzleCatalog = [
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
    titleClue: "Wall block",
    finalAnswer: "BRICK",
    words: [
      { clue: "Wide and open", answer: "BROAD", circleIndex: 0, prefilledIndices: [2, 4] },
      { clue: "Black bird", answer: "RAVEN", circleIndex: 0, prefilledIndices: [1, 3] },
      { clue: "Pale decorative material", answer: "IVORY", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Mass in the sky", answer: "CLOUD", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Sharp kitchen blade", answer: "KNIFE", circleIndex: 0, prefilledIndices: [1, 4] },
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
  {
    titleClue: "Royal headwear",
    finalAnswer: "CROWN",
    words: [
      { clue: "Sugary fairground treat", answer: "CANDY", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Sweeping tool", answer: "BROOM", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Person who possesses", answer: "OWNER", circleIndex: 0, prefilledIndices: [1, 3] },
      { clue: "Huge sea animal", answer: "WHALE", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Corner measure", answer: "ANGLE", circleIndex: 1, prefilledIndices: [0, 4] },
    ],
  },
  {
    titleClue: "Green growth in a pot",
    finalAnswer: "PLANT",
    words: [
      { clue: "Keyboard instrument", answer: "PIANO", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Mass in the sky", answer: "CLOUD", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Metal support block", answer: "ANVIL", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Sharp utensil", answer: "KNIFE", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Striped jungle cat", answer: "TIGER", circleIndex: 0, prefilledIndices: [1, 4] },
    ],
  },
  {
    titleClue: "A vision in sleep",
    finalAnswer: "DREAM",
    words: [
      { clue: "Narrow trench", answer: "DITCH", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "White topping", answer: "CREAM", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Very keen", answer: "EAGER", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Golden-brown resin", answer: "AMBER", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Friendly face expression", answer: "SMILE", circleIndex: 1, prefilledIndices: [0, 4] },
    ],
  },
  {
    titleClue: "Violent weather",
    finalAnswer: "STORM",
    words: [
      { clue: "Give off light", answer: "SHINE", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Hard natural chunk", answer: "STONE", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Stage music work", answer: "OPERA", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Whipped dairy topping", answer: "CREAM", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Not large", answer: "SMALL", circleIndex: 1, prefilledIndices: [0, 4] },
    ],
  },
  {
    titleClue: "Seed from a cereal crop",
    finalAnswer: "GRAIN",
    words: [
      { clue: "Natural ease and style", answer: "GRACE", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Country home", answer: "RANCH", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Brown-orange gem", answer: "AMBER", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Coming after second", answer: "THIRD", circleIndex: 2, prefilledIndices: [0, 4] },
      { clue: "Sharp-cutting tool", answer: "KNIFE", circleIndex: 1, prefilledIndices: [0, 4] },
    ],
  },
  {
    titleClue: "No longer puzzled",
    finalAnswer: "CLUED",
    words: [
      { clue: "Mass overhead", answer: "CLOUD", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Silver concert tube", answer: "FLUTE", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Higher than before", answer: "UPPER", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Woolly farm sound-maker", answer: "SHEEP", circleIndex: 2, prefilledIndices: [0, 4] },
      { clue: "Narrow trench in the road", answer: "DITCH", circleIndex: 0, prefilledIndices: [1, 4] },
    ],
  },
  {
    titleClue: "Follow the path of",
    finalAnswer: "TRACE",
    words: [
      { clue: "Strongly flavored dance", answer: "TANGO", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Daily loaf", answer: "BREAD", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Honey-colored gem", answer: "AMBER", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Board game with bishops", answer: "CHESS", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Part used to bend an arm", answer: "ELBOW", circleIndex: 0, prefilledIndices: [1, 4] },
    ],
  },
  {
    titleClue: "Kitchen mixing tool",
    finalAnswer: "WHISK",
    words: [
      { clue: "Field of grain", answer: "WHEAT", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Specter in a story", answer: "GHOST", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Pale tusk carving material", answer: "IVORY", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Natural rock chunk", answer: "STONE", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Dusty classroom stick", answer: "CHALK", circleIndex: 4, prefilledIndices: [1, 3] },
    ],
  },
  {
    titleClue: "Walk in step",
    finalAnswer: "MARCH",
    words: [
      { clue: "Pleasant tune", answer: "MUSIC", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Aircraft wing surface", answer: "PLANE", circleIndex: 2, prefilledIndices: [0, 4] },
      { clue: "Royal headpiece", answer: "CROWN", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Board game of kings", answer: "CHESS", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Harvest grain", answer: "WHEAT", circleIndex: 1, prefilledIndices: [0, 4] },
    ],
  },
  {
    titleClue: "Mixed smoothly together",
    finalAnswer: "BLEND",
    words: [
      { clue: "Simple and plain", answer: "BASIC", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Concert reedless woodwind", answer: "FLUTE", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Arm joint point", answer: "ELBOW", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Slithering reptile", answer: "SNAKE", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Sidestep quickly", answer: "DODGE", circleIndex: 0, prefilledIndices: [1, 4] },
    ],
  },
  {
    titleClue: "Single reproductive cell of a fungus",
    finalAnswer: "SPORE",
    words: [
      { clue: "Friendly expression", answer: "SMILE", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Grand stage work", answer: "OPERA", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Person who has something", answer: "OWNER", circleIndex: 0, prefilledIndices: [1, 3] },
      { clue: "Rich white topping", answer: "CREAM", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Bendable arm point", answer: "ELBOW", circleIndex: 0, prefilledIndices: [1, 4] },
    ],
  },
  {
    titleClue: "Personal appeal",
    finalAnswer: "CHARM",
    words: [
      { clue: "Sugary sweet", answer: "CANDY", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Phantom in a tale", answer: "GHOST", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Golden fossil resin", answer: "AMBER", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Cream on a cake", answer: "CREAM", circleIndex: 1, prefilledIndices: [0, 4] },
      { clue: "Of little size", answer: "SMALL", circleIndex: 1, prefilledIndices: [0, 4] },
    ],
  },
  {
    titleClue: "Helpful direction for a traveler",
    finalAnswer: "GUIDE",
    words: [
      { clue: "Natural elegance", answer: "GRACE", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Silver concert instrument", answer: "FLUTE", circleIndex: 2, prefilledIndices: [0, 4] },
      { clue: "Pale carving material", answer: "IVORY", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Move aside quickly", answer: "DODGE", circleIndex: 0, prefilledIndices: [1, 4] },
      { clue: "Arm joint", answer: "ELBOW", circleIndex: 0, prefilledIndices: [1, 4] },
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
  constructor(activePuzzleLimit = 20) {
    this.puzzles = rawPuzzleCatalog.map((rawPuzzle) => preparePuzzlePayload(rawPuzzle));
    const safeLimit = Math.max(1, Math.min(activePuzzleLimit, this.puzzles.length));
    this.order = shuffle(this.puzzles.map((_value, index) => index)).slice(0, safeLimit);
    this.pointer = 0;
  }

  next() {
    if (this.pointer >= this.order.length) {
      return null;
    }

    const puzzle = this.puzzles[this.order[this.pointer]];
    this.pointer += 1;
    return puzzle;
  }

  remaining() {
    return Math.max(0, this.order.length - this.pointer);
  }

  total() {
    return this.order.length;
  }
}
