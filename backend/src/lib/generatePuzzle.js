import { generateWithGemini } from "./geminiClient.js";

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

function buildFallbackPrefilledIndices(answerLength, circleIndex) {
  const candidates = [];

  for (let index = 0; index < answerLength; index += 1) {
    if (index !== circleIndex) {
      candidates.push(index);
    }
  }

  const targetVisibleCount = Math.max(2, Math.min(candidates.length, answerLength - 2));
  const preferredOrder = [
    0,
    answerLength - 1,
    Math.floor(answerLength / 2),
    1,
    answerLength - 2,
    2,
    answerLength - 3,
  ];
  const selected = [];

  for (const index of preferredOrder) {
    if (index !== circleIndex && index >= 0 && index < answerLength && !selected.includes(index)) {
      selected.push(index);
    }

    if (selected.length >= targetVisibleCount) {
      break;
    }
  }

  for (const index of candidates) {
    if (!selected.includes(index)) {
      selected.push(index);
    }

    if (selected.length >= targetVisibleCount) {
      break;
    }
  }

  return selected.sort((a, b) => a - b);
}

function normalizePrefilledIndices(answerLength, circleIndex, values) {
  const safeIndices = uniqueSortedIntegers(values).filter(
    (index) => index >= 0 && index < answerLength && index !== circleIndex,
  );
  const maxVisibleCount = Math.max(2, answerLength - 2);

  if (safeIndices.length >= 2 && safeIndices.length <= maxVisibleCount) {
    return safeIndices;
  }

  const fallback = buildFallbackPrefilledIndices(answerLength, circleIndex);

  if (safeIndices.length === 0) {
    return fallback;
  }

  const repaired = [...new Set([...safeIndices, ...fallback])].filter((index) => index !== circleIndex);
  return repaired.slice(0, maxVisibleCount).sort((a, b) => a - b);
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

    if (!clue) {
      throw new Error(`Word ${index + 1} is missing a clue.`);
    }

    if (answer.length < 4 || answer.length > 8) {
      throw new Error(`Word ${index + 1} length is out of bounds.`);
    }

    if (!Number.isInteger(circleIndex) || circleIndex < 0 || circleIndex >= answer.length) {
      throw new Error(`Word ${index + 1} has an invalid circle index.`);
    }

    const prefilledIndices = normalizePrefilledIndices(answer.length, circleIndex, word?.prefilledIndices || []);

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
  const letters = [...validPuzzle.finalAnswer];
  const scrambleOrder = letters.map((_, index) => index).sort(() => Math.random() - 0.5);
  const scrambledLetters = scrambleOrder.map((index) => letters[index]);
  const revealSlotsByWord = Array(validPuzzle.words.length).fill(-1);

  scrambleOrder.forEach((wordIndex, scrambledIndex) => {
    revealSlotsByWord[wordIndex] = scrambledIndex;
  });

  return {
    titleClue: validPuzzle.titleClue,
    finalLength: validPuzzle.finalAnswer.length,
    scrambledLetters,
    revealSlotsByWord,
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

export function preparePuzzlePayload(rawPuzzle) {
  const normalizedPuzzle = {
    ...rawPuzzle,
    finalAnswer: Array.isArray(rawPuzzle?.words)
      ? rawPuzzle.words
          .map((word) => {
            const answer = normalizeWord(word?.answer);
            const circleIndex = Number(word?.circleIndex);

            if (!answer || !Number.isInteger(circleIndex) || circleIndex < 0 || circleIndex >= answer.length) {
              return "";
            }

            return answer[circleIndex];
          })
          .join("")
      : rawPuzzle?.finalAnswer,
  };

  const privatePuzzle = validatePuzzleShape(normalizedPuzzle);
  const circledWord = privatePuzzle.words.map((word) => word.answer[word.circleIndex]).join("");

  if (circledWord === privatePuzzle.finalAnswer && privatePuzzle.words.length > 1) {
    for (let shift = 1; shift < privatePuzzle.words.length; shift += 1) {
      const reorderedWords = privatePuzzle.words.map(
        (_word, index) => privatePuzzle.words[(index + shift) % privatePuzzle.words.length],
      );
      const reorderedCircledWord = reorderedWords.map((word) => word.answer[word.circleIndex]).join("");

      if (reorderedCircledWord !== privatePuzzle.finalAnswer) {
        privatePuzzle.words = reorderedWords;
        break;
      }
    }
  }

  return {
    publicPuzzle: buildPublicPuzzle(privatePuzzle),
    privatePuzzle,
  };
}

export async function generatePuzzle({ apiKey, model }) {
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY.");
  }

  let lastError = null;
  let retryFeedback = "";

  for (let attempt = 1; attempt <= 8; attempt += 1) {
    try {
      const raw = await generateWithGemini({
        apiKey,
        model,
        systemInstruction: SYSTEM_INSTRUCTION,
        prompt: `${PROMPT}\n\nCreate a brand new puzzle now.${retryFeedback}`,
      });

      const parsed = JSON.parse(raw);
      return preparePuzzlePayload(parsed);
    } catch (error) {
      lastError = error;
      retryFeedback = `\n\nYour previous attempt was invalid for this reason: ${error.message}\nReturn a completely new puzzle that fixes that exact issue and still follows every rule exactly.`;
    }
  }

  throw lastError || new Error("Unable to generate puzzle.");
}
