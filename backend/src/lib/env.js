const DEFAULT_ALLOWED_ORIGIN = "http://localhost:5173";

export function getEnv() {
  return {
    port: Number(process.env.PORT || 4000),
    geminiApiKey: process.env.GEMINI_API_KEY || "",
    geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
    sessionTtlMinutes: Number(process.env.SESSION_TTL_MINUTES || 30),
    allowedOrigins: (process.env.ALLOWED_ORIGIN || DEFAULT_ALLOWED_ORIGIN)
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  };
}
