import { randomUUID } from "node:crypto";

export class PuzzleStore {
  constructor(ttlMinutes = 30) {
    this.ttlMs = ttlMinutes * 60 * 1000;
    this.sessions = new Map();
  }

  create(puzzleData) {
    const id = randomUUID();
    const expiresAt = Date.now() + this.ttlMs;

    this.sessions.set(id, {
      ...puzzleData,
      expiresAt,
    });

    this.cleanup();
    return id;
  }

  get(id) {
    const session = this.sessions.get(id);

    if (!session) {
      return null;
    }

    if (session.expiresAt < Date.now()) {
      this.sessions.delete(id);
      return null;
    }

    return session;
  }

  cleanup() {
    const now = Date.now();

    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(id);
      }
    }
  }
}
