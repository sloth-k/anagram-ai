export class PuzzleCache {
  constructor(ttlMinutes = 15) {
    this.ttlMs = ttlMinutes * 60 * 1000;
    this.cachedPuzzle = null;
  }

  get() {
    if (!this.cachedPuzzle) {
      return null;
    }

    if (this.cachedPuzzle.expiresAt <= Date.now()) {
      this.cachedPuzzle = null;
      return null;
    }

    return this.cachedPuzzle.value;
  }

  set(value) {
    this.cachedPuzzle = {
      value,
      expiresAt: Date.now() + this.ttlMs,
    };
  }
}
