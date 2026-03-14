import express from "express";
import cors from "cors";
import { getEnv } from "./lib/env.js";
import { PuzzleStore } from "./lib/puzzleStore.js";
import { generatePuzzle } from "./lib/generatePuzzle.js";

const env = getEnv();
const app = express();
const store = new PuzzleStore(env.sessionTtlMinutes);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS."));
    },
  }),
);
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    provider: "gemini",
    model: env.geminiModel,
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/puzzle", async (_request, response) => {
  try {
    const { publicPuzzle, privatePuzzle } = await generatePuzzle({
      apiKey: env.geminiApiKey,
      model: env.geminiModel,
    });

    const sessionId = store.create(privatePuzzle);

    response.json({
      sessionId,
      puzzle: publicPuzzle,
    });
  } catch (error) {
    response.status(503).json({
      error: "Unable to generate puzzle right now.",
      details: error.message,
    });
  }
});

app.post("/api/guess-word", (request, response) => {
  const { sessionId, wordIndex, guess } = request.body || {};
  const puzzle = store.get(sessionId);

  if (!puzzle) {
    response.status(404).json({ error: "Puzzle session not found or expired." });
    return;
  }

  const index = Number(wordIndex);
  const word = puzzle.words[index];

  if (!word) {
    response.status(400).json({ error: "Invalid word index." });
    return;
  }

  const normalizedGuess = String(guess || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  const correct = normalizedGuess === word.answer;

  response.json({
    correct,
    circleLetter: correct ? word.answer[word.circleIndex] : null,
  });
});

app.post("/api/guess-final", (request, response) => {
  const { sessionId, guess } = request.body || {};
  const puzzle = store.get(sessionId);

  if (!puzzle) {
    response.status(404).json({ error: "Puzzle session not found or expired." });
    return;
  }

  const normalizedGuess = String(guess || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  response.json({
    correct: normalizedGuess === puzzle.finalAnswer,
  });
});

app.listen(env.port, () => {
  console.log(`Angaram AI backend listening on http://localhost:${env.port}`);
});
