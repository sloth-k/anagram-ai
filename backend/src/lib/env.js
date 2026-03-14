const DEFAULT_ALLOWED_ORIGIN = "http://localhost:5173";

export function getEnv() {
  return {
    port: Number(process.env.PORT || 4000),
    geminiApiKey: process.env.GEMINI_API_KEY || "",
    geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
    sessionTtlMinutes: Number(process.env.SESSION_TTL_MINUTES || 30),
    puzzleCacheMinutes: Number(process.env.PUZZLE_CACHE_MINUTES || 15),
    activePuzzleLimit: Number(process.env.ACTIVE_PUZZLE_LIMIT || 20),
    rateLimitWindowMinutes: Number(process.env.RATE_LIMIT_WINDOW_MINUTES || 10),
    rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 20),
    devPuzzleMode: process.env.DEV_PUZZLE_MODE || "live",
    allowedOrigins: (process.env.ALLOWED_ORIGIN || DEFAULT_ALLOWED_ORIGIN)
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  };
}
