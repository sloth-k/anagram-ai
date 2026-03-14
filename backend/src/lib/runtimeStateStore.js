import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const DEFAULT_STATE = {
  catalogOrder: null,
  browserProgress: {},
  interestKeys: [],
};

export class RuntimeStateStore {
  constructor(filePath = resolve(process.cwd(), "data", "runtime-state.json")) {
    this.filePath = filePath;
    this.state = this.load();
  }

  load() {
    try {
      if (!existsSync(this.filePath)) {
        return { ...DEFAULT_STATE };
      }

      const parsed = JSON.parse(readFileSync(this.filePath, "utf8"));
      return {
        ...DEFAULT_STATE,
        ...parsed,
      };
    } catch {
      return { ...DEFAULT_STATE };
    }
  }

  save() {
    mkdirSync(dirname(this.filePath), { recursive: true });
    writeFileSync(this.filePath, JSON.stringify(this.state, null, 2));
  }

  getCatalogState() {
    return {
      order: Array.isArray(this.state.catalogOrder) ? this.state.catalogOrder : null,
      browserProgress:
        this.state.browserProgress && typeof this.state.browserProgress === "object"
          ? this.state.browserProgress
          : {},
    };
  }

  setCatalogState(order, browserProgress) {
    this.state.catalogOrder = order;
    this.state.browserProgress = browserProgress;
    this.save();
  }

  getInterestKeys() {
    return Array.isArray(this.state.interestKeys) ? this.state.interestKeys : [];
  }

  setInterestKeys(keys) {
    this.state.interestKeys = keys;
    this.save();
  }
}
