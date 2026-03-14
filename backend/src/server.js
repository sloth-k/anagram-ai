import "dotenv/config";
import express from "express";
import cors from "cors";
import { getEnv } from "./lib/env.js";
import { PuzzleStore } from "./lib/puzzleStore.js";
import { MemoryRateLimiter } from "./lib/rateLimiter.js";
import { PuzzleCache } from "./lib/puzzleCache.js";
import { PuzzleCatalog } from "./lib/puzzleCatalog.js";
import { InterestTracker } from "./lib/interestTracker.js";

const env = getEnv();
const app = express();
const store = new PuzzleStore(env.sessionTtlMinutes);
const puzzleCache = new PuzzleCache(env.puzzleCacheMinutes);
const puzzleCatalog = new PuzzleCatalog(env.activePuzzleLimit);
const interestTracker = new InterestTracker();
const rateLimiter = new MemoryRateLimiter({
  windowMinutes: env.rateLimitWindowMinutes,
  maxRequests: env.rateLimitMaxRequests,
});

function getClientKey(request) {
  const forwardedFor = request.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return request.ip || request.socket.remoteAddress || "unknown";
}

function applyRateLimit(request, response, next) {
  const result = rateLimiter.check(getClientKey(request));

  response.setHeader("X-RateLimit-Limit", String(env.rateLimitMaxRequests));
  response.setHeader("X-RateLimit-Remaining", String(result.remaining));
  response.setHeader("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));

  if (!result.allowed) {
    response.status(429).json({
      error: "Too many requests. Please wait a few minutes and try again.",
      retryAfterSeconds: Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000)),
    });
    return;
  }

  next();
}

function createSessionResponse(puzzlePayload) {
  const sessionId = store.create(puzzlePayload.privatePuzzle);

  return {
    sessionId,
    puzzle: puzzlePayload.publicPuzzle,
  };
}

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
app.set("trust proxy", true);

app.get("/health", (_request, response) => {
  response.json({
    ok: true,
    mode: "catalog",
    remainingPuzzles: puzzleCatalog.remaining(),
    totalPuzzles: puzzleCatalog.total(),
    interestClicks: interestTracker.total(),
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/puzzle", async (request, response) => {
  const forceNew = Boolean(request.body?.forceNew);

  if (!forceNew) {
    const cachedPuzzle = puzzleCache.get();

    if (cachedPuzzle) {
      response.json(createSessionResponse(cachedPuzzle));
      return;
    }
  }

  applyRateLimit(request, response, () => {});

  if (response.headersSent) {
    return;
  }

  try {
    const nextPuzzle = puzzleCatalog.next();

    if (!nextPuzzle) {
      response.status(410).json({
        error: "All launch puzzles have been solved.",
        exhausted: true,
        remainingPuzzles: 0,
        totalPuzzles: puzzleCatalog.total(),
        interestClicks: interestTracker.total(),
      });
      return;
    }

    puzzleCache.set(nextPuzzle);
    response.json({
      ...createSessionResponse(nextPuzzle),
      remainingPuzzles: puzzleCatalog.remaining(),
      totalPuzzles: puzzleCatalog.total(),
    });
  } catch (error) {
    response.status(503).json({
      error: "Unable to load a puzzle right now.",
      details: error.message,
    });
  }
});

app.post("/api/interest", (_request, response) => {
  const clientKey = getClientKey(_request);
  const result = interestTracker.record(clientKey);

  response.json({
    ok: true,
    recorded: result.recorded,
    interestClicks: result.total,
  });
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
