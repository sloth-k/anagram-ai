export class InterestTracker {
  constructor(initialKeys = [], onChange = () => {}) {
    this.uniqueKeys = new Set(initialKeys);
    this.onChange = onChange;
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
    this.onChange([...this.uniqueKeys]);

    return {
      recorded: true,
      total: this.total(),
    };
  }

  total() {
    return this.uniqueKeys.size;
  }
}
