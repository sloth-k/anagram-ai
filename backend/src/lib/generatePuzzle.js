import { generateWithOpenAI } from "./openaiClient.js";

const SYSTEM_INSTRUCTION = `
You create word puzzles similar to a newspaper jumble.
Return valid JSON only.
Do not include markdown, code fences, or explanations.
`;

const PROMPT = `
Generate a fresh puzzle with these exact rules:

1. Create exactly 5 clue-answer words.
2. Each answer must be a common English word using only A-Z letters.
3. Each answer must be between 4 and 8 letters long.
4. Each word must have exactly one circled letter.
5. The 5 circled letters, in row order, must form a meaningful 5-letter final answer.
6. Also create a title clue whose answer is that same 5-letter final answer.
7. Prefill only some letters for each word, leaving enough challenge.
8. Do not use proper nouns, abbreviations, hyphens, apostrophes, or awkward plurals.
9. Make the clues crisp, fair, and newspaper-friendly.
10. Ensure every row has at least 2 hidden letters and at least 2 shown letters.

Return this JSON shape:
{
  "titleClue": "string",
  "finalAnswer": "APPLE",
  "words": [
    {
      "clue": "string",
      "answer": "PLANE",
      "circleIndex": 2,
      "prefilledIndices": [0, 4]
    }
  ]
}

Validation rules:
- finalAnswer must be exactly 5 letters.
- words must contain exactly 5 items.
- circleIndex must be a valid zero-based index.
- prefilledIndices must not include circleIndex.
- The circled letters from the 5 answers must exactly spell finalAnswer.
- Keep answers unique.
- Make sure each prefilledIndices list creates a solvable puzzle.
`;

function normalizeWord(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

function uniqueSortedIntegers(values) {
  return [...new Set(values.map((value) => Number(value)).filter(Number.isInteger))].sort((a, b) => a - b);
}

function validatePuzzleShape(candidate) {
  if (!candidate || typeof candidate !== "object") {
    throw new Error("Puzzle payload must be an object.");
  }

  const titleClue = String(candidate.titleClue || "").trim();
  const finalAnswer = normalizeWord(candidate.finalAnswer);
  const words = Array.isArray(candidate.words) ? candidate.words : [];

  if (!titleClue) {
    throw new Error("Missing title clue.");
  }

  if (finalAnswer.length !== 5) {
    throw new Error("Final answer must be exactly 5 letters.");
  }

  if (words.length !== 5) {
    throw new Error("Puzzle must contain exactly 5 words.");
  }

  const normalizedWords = words.map((word, index) => {
    const clue = String(word?.clue || "").trim();
    const answer = normalizeWord(word?.answer);
    const circleIndex = Number(word?.circleIndex);
    const prefilledIndices = uniqueSortedIntegers(word?.prefilledIndices || []);

    if (!clue) {
      throw new Error(`Word ${index + 1} is missing a clue.`);
    }

    if (answer.length < 4 || answer.length > 8) {
      throw new Error(`Word ${index + 1} length is out of bounds.`);
    }

    if (!Number.isInteger(circleIndex) || circleIndex < 0 || circleIndex >= answer.length) {
      throw new Error(`Word ${index + 1} has an invalid circle index.`);
    }

    if (prefilledIndices.includes(circleIndex)) {
      throw new Error(`Word ${index + 1} reveals the circled letter.`);
    }

    if (prefilledIndices.length < 2) {
      throw new Error(`Word ${index + 1} needs at least 2 prefilled letters.`);
    }

    if (answer.length - prefilledIndices.length < 2) {
      throw new Error(`Word ${index + 1} needs at least 2 hidden letters.`);
    }

    for (const visibleIndex of prefilledIndices) {
      if (visibleIndex < 0 || visibleIndex >= answer.length) {
        throw new Error(`Word ${index + 1} has an out-of-range prefilled index.`);
      }
    }

    return {
      clue,
      answer,
      circleIndex,
      prefilledIndices,
    };
  });

  if (new Set(normalizedWords.map((word) => word.answer)).size !== normalizedWords.length) {
    throw new Error("All answers must be unique.");
  }

  const circledWord = normalizedWords.map((word) => word.answer[word.circleIndex]).join("");

  if (circledWord !== finalAnswer) {
    throw new Error("Circled letters do not match the final answer.");
  }

  return {
    titleClue,
    finalAnswer,
    words: normalizedWords,
  };
}

function buildPublicPuzzle(validPuzzle) {
  return {
    titleClue: validPuzzle.titleClue,
    finalLength: validPuzzle.finalAnswer.length,
    scrambledLetters: [...validPuzzle.finalAnswer].sort(() => Math.random() - 0.5),
    words: validPuzzle.words.map((word) => ({
      clue: word.clue,
      length: word.answer.length,
      circleIndex: word.circleIndex,
      cells: [...word.answer].map((letter, index) => ({
        index,
        given: word.prefilledIndices.includes(index),
        value: word.prefilledIndices.includes(index) ? letter : "",
      })),
    })),
  };
}

export async function generatePuzzle({ apiKey, model }) {
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const raw = await generateWithOpenAI({
        apiKey,
        model,
        instructions: SYSTEM_INSTRUCTION,
        prompt: `${PROMPT}\n\nCreate a brand new puzzle now.`,
      });

      const parsed = JSON.parse(raw);
      const validated = validatePuzzleShape(parsed);

      return {
        publicPuzzle: buildPublicPuzzle(validated),
        privatePuzzle: validated,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Unable to generate puzzle.");
}
