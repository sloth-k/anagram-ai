export class InterestTracker {
  constructor() {
    this.uniqueKeys = new Set();
  }

  record(key) {
    if (!key) {
      return {
        recorded: false,
        total: this.total(),
      };
    }

    if (this.uniqueKeys.has(key)) {
      return {
        recorded: false,
        total: this.total(),
      };
    }

    this.uniqueKeys.add(key);

    return {
      recorded: true,
      total: this.total(),
    };
  }

  total() {
    return this.uniqueKeys.size;
  }
}
