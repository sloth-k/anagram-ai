export class MemoryRateLimiter {
  constructor({ windowMinutes = 10, maxRequests = 20 } = {}) {
    this.windowMs = windowMinutes * 60 * 1000;
    this.maxRequests = maxRequests;
    this.entries = new Map();
  }

  check(key) {
    const now = Date.now();
    const current = this.entries.get(key);

    if (!current || current.resetAt <= now) {
      const next = {
        count: 1,
        resetAt: now + this.windowMs,
      };

      this.entries.set(key, next);
      this.cleanup(now);
      return {
        allowed: true,
        remaining: this.maxRequests - next.count,
        resetAt: next.resetAt,
      };
    }

    if (current.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: current.resetAt,
      };
    }

    current.count += 1;
    return {
      allowed: true,
      remaining: this.maxRequests - current.count,
      resetAt: current.resetAt,
    };
  }

  cleanup(now = Date.now()) {
    for (const [key, value] of this.entries.entries()) {
      if (value.resetAt <= now) {
        this.entries.delete(key);
      }
    }
  }
}
