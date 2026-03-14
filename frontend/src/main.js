import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const STORAGE_KEY = "angaram-ai-session-v1";

const state = {
  sessionId: "",
  puzzle: null,
  wordInputs: [],
  solvedWords: [],
  circleLetters: [],
  finalGuess: Array(5).fill(""),
  finalSolved: false,
  status: "loading",
  message: "Loading the launch puzzle set...",
  remainingPuzzles: null,
  totalPuzzles: null,
  interestClicks: 0,
  interestSent: false,
  celebrationTick: 0,
};

const app = document.querySelector("#app");

function saveState() {
  if (!state.puzzle || !state.sessionId) {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }

  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      sessionId: state.sessionId,
      puzzle: state.puzzle,
      wordInputs: state.wordInputs,
      solvedWords: state.solvedWords,
      circleLetters: state.circleLetters,
      finalGuess: state.finalGuess,
      finalSolved: state.finalSolved,
      remainingPuzzles: state.remainingPuzzles,
      totalPuzzles: state.totalPuzzles,
    }),
  );
}

function restoreState() {
  const raw = sessionStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return false;
  }

  try {
    const saved = JSON.parse(raw);

    if (!saved?.sessionId || !saved?.puzzle) {
      return false;
    }

    state.sessionId = saved.sessionId;
    state.puzzle = saved.puzzle;
    state.wordInputs = saved.wordInputs || [];
    state.solvedWords = saved.solvedWords || [];
    state.circleLetters = saved.circleLetters || [];
    state.finalGuess = saved.finalGuess || Array(5).fill("");
    state.finalSolved = Boolean(saved.finalSolved);
    state.remainingPuzzles = saved.remainingPuzzles ?? null;
    state.totalPuzzles = saved.totalPuzzles ?? null;
    state.status = "ready";
    state.message = "Restored your current puzzle.";
    return true;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return false;
  }
}

function clearSavedState() {
  sessionStorage.removeItem(STORAGE_KEY);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildWordValue(wordIndex) {
  const word = state.puzzle.words[wordIndex];
  return word.cells
    .map((cell, cellIndex) => (cell.given ? cell.value : state.wordInputs[wordIndex]?.[cellIndex] || ""))
    .join("");
}

function canSubmitWord(wordIndex) {
  const word = state.puzzle.words[wordIndex];
  return buildWordValue(wordIndex).length === word.length;
}

function render() {
  const title = state.puzzle?.titleClue || "Launch puzzle";
  const finalSlots = state.finalGuess;
  const solvedCount = state.solvedWords.filter(Boolean).length;
  const allWordsSolved = solvedCount === 5;
  const inventoryLabel =
    state.remainingPuzzles !== null && state.totalPuzzles !== null
      ? `${state.remainingPuzzles} of ${state.totalPuzzles} new puzzles left`
      : "20 handcrafted launch puzzles";
  const revealedScramble = Array.from(
    { length: state.puzzle?.scrambledLetters?.length || 5 },
    () => "",
  );

  state.circleLetters.forEach((letter, wordIndex) => {
    const slotIndex = state.puzzle?.revealSlotsByWord?.[wordIndex];

    if (letter && Number.isInteger(slotIndex) && slotIndex >= 0 && slotIndex < revealedScramble.length) {
      revealedScramble[slotIndex] = letter;
    }
  });

  app.innerHTML = `
    <main class="shell ${state.finalSolved ? "is-celebrating" : ""}">
      <section class="hero">
        <p class="eyebrow">Limited launch puzzle edition</p>
        <h1>Angaram AI</h1>
        <p class="intro">
          Solve all five clue words. The circled letters unlock the final 5-letter answer.
        </p>
        <div class="hero-card">
          <div>
            <p class="hero-label">Title clue</p>
            <h2>${escapeHtml(title)}</h2>
            <p class="final-copy">${escapeHtml(inventoryLabel)}</p>
          </div>
          <button class="ghost-button" data-action="new-puzzle" ${state.status === "exhausted" ? "disabled" : ""}>New puzzle</button>
        </div>
      </section>

      <section class="board">
        <div class="board-header">
          <div>
            <p class="section-kicker">Status</p>
            <h3>${escapeHtml(state.message)}</h3>
          </div>
          <div class="badge">${solvedCount}/5 solved</div>
        </div>

        ${
          state.status === "error"
            ? `<div class="error-panel">
                <p>We could not load a puzzle right now.</p>
                <button class="primary-button" data-action="new-puzzle">Try again</button>
              </div>`
            : ""
        }

        ${
          state.status === "exhausted"
            ? `<div class="error-panel">
                <p>All ${escapeHtml(state.totalPuzzles ?? "launch")} launch puzzles are currently exhausted.</p>
                <p>Subscribe interest to help us justify a paid AI tier for fresh packs.</p>
                <button class="primary-button" data-action="subscribe-interest" ${state.interestSent ? "disabled" : ""}>
                  ${state.interestSent ? "Interest recorded" : "Subscribe for more puzzles"}
                </button>
                <p class="row-state">Interest clicks so far: ${state.interestClicks}</p>
              </div>`
            : ""
        }

        ${
          state.puzzle && state.status !== "exhausted"
            ? `
              <div class="grid">
                <section class="words-panel">
                  ${state.puzzle.words
                    .map((word, wordIndex) => {
                      const currentWord = buildWordValue(wordIndex);
                      const solved = state.solvedWords[wordIndex];

                      return `
                        <article class="word-card ${solved ? "is-solved" : ""}">
                          <div class="word-topline">
                            <span class="word-number">Word ${wordIndex + 1}</span>
                            <span class="word-clue">${escapeHtml(word.clue)}</span>
                          </div>
                          <div class="cells">
                            ${word.cells
                              .map((cell, cellIndex) => {
                                const value = cell.given
                                  ? cell.value
                                  : state.wordInputs[wordIndex]?.[cellIndex] || "";

                                return `
                                  <label class="cell ${cell.given ? "is-given" : ""} ${
                                  cellIndex === word.circleIndex ? "is-circled" : ""
                                } ${solved ? "is-locked" : ""}">
                                    <input
                                      data-role="cell-input"
                                      data-word-index="${wordIndex}"
                                      data-cell-index="${cellIndex}"
                                      maxlength="1"
                                      value="${escapeHtml(value)}"
                                      ${cell.given || solved ? "readonly" : ""}
                                      aria-label="Word ${wordIndex + 1} letter ${cellIndex + 1}"
                                    />
                                  </label>
                                `;
                              })
                              .join("")}
                          </div>
                          <div class="word-actions">
                            <button
                              class="primary-button"
                              data-action="check-word"
                              data-word-index="${wordIndex}"
                              ${!canSubmitWord(wordIndex) || solved ? "disabled" : ""}
                            >
                              ${solved ? "Solved" : "Check word"}
                            </button>
                            <span class="row-state">
                              ${
                                solved
                                  ? `Circled letter: <strong>${escapeHtml(
                                      state.circleLetters[wordIndex] || "",
                                    )}</strong>`
                                  : `${currentWord.length}/${word.length} letters`
                              }
                            </span>
                          </div>
                        </article>
                      `;
                    })
                    .join("")}
                </section>

                <aside class="final-panel">
                  <p class="section-kicker">Circled letters</p>
                  <div class="scramble">
                    ${revealedScramble
                      .map(
                        (letter) => `
                          <span class="scramble-chip ${letter ? "is-found" : ""}">
                            ${letter ? escapeHtml(letter) : "?"}
                          </span>
                        `,
                      )
                      .join("")}
                  </div>
                  <p class="final-copy">
                    ${
                      allWordsSolved
                        ? "Use the circled letters to solve the title clue."
                        : "Each solved word reveals one circled letter."
                    }
                  </p>
                  ${
                    allWordsSolved
                      ? `<div class="scramble scramble-final">
                          ${state.puzzle.scrambledLetters
                            .map(
                              (letter) => `
                                <span class="scramble-chip is-accent">
                                  ${escapeHtml(letter)}
                                </span>
                              `,
                            )
                            .join("")}
                        </div>`
                      : ""
                  }
                  <div class="final-slots">
                    ${finalSlots
                      .map(
                        (letter, index) => `
                          <label class="cell final-cell ${state.finalSolved ? "is-correct is-glowing" : ""}">
                            <input
                              data-role="final-input"
                              data-final-index="${index}"
                              maxlength="1"
                              value="${escapeHtml(letter)}"
                              ${state.finalSolved ? "readonly" : ""}
                              aria-label="Final answer letter ${index + 1}"
                            />
                          </label>
                        `,
                      )
                      .join("")}
                  </div>
                  <div class="final-actions">
                    <button
                      class="primary-button"
                      data-action="check-final"
                      ${state.circleLetters.filter(Boolean).length < 5 || state.finalGuess.some((letter) => !letter) || state.finalSolved ? "disabled" : ""}
                    >
                      ${state.finalSolved ? "Completed" : "Unlock title answer"}
                    </button>
                    <button class="ghost-button" data-action="clear-final" ${
                      state.finalSolved ? "disabled" : ""
                    }>Clear</button>
                  </div>
                  ${
                    state.finalSolved
                      ? `<div class="success-banner">Puzzle complete. You solved the title word.</div>`
                      : ""
                  }
                </aside>
              </div>
            `
            : ""
        }
      </section>
    </main>
    ${
      state.finalSolved
        ? `<div class="celebration-layer" data-celebration="${state.celebrationTick}">
            <div class="celebration-flash"></div>
            <div class="celebration-flash celebration-flash-secondary"></div>
            <div class="firework firework-a wave-one"></div>
            <div class="firework firework-b wave-one"></div>
            <div class="firework firework-c wave-one"></div>
            <div class="firework firework-d wave-one"></div>
            <div class="firework firework-e wave-two"></div>
            <div class="firework firework-f wave-two"></div>
            <div class="firework firework-g wave-two"></div>
            <div class="firework firework-h wave-two"></div>
            <div class="firework firework-i wave-three"></div>
            <div class="firework firework-j wave-three"></div>
            <div class="firework firework-k wave-three"></div>
            <div class="firework firework-l wave-three"></div>
            <div class="streamer streamer-a"></div>
            <div class="streamer streamer-b"></div>
            <div class="streamer streamer-c"></div>
            <div class="streamer streamer-d"></div>
            <div class="streamer streamer-e"></div>
            <div class="streamer streamer-f"></div>
            <div class="victory-banner">Puzzle Complete</div>
          </div>`
        : ""
    }
  `;

  saveState();
}

async function loadPuzzle({ forceNew = false } = {}) {
  state.status = "loading";
  state.message = "Loading the next puzzle...";
  state.puzzle = null;
  state.sessionId = "";
  state.wordInputs = [];
  state.solvedWords = [];
  state.circleLetters = [];
  state.finalGuess = Array(5).fill("");
  state.finalSolved = false;
  state.interestSent = false;
  clearSavedState();
  render();

  try {
    const response = await fetch(`${API_BASE_URL}/api/puzzle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        forceNew,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      if (data?.exhausted) {
        state.status = "exhausted";
        state.message = data.error || "All launch puzzles are exhausted.";
        state.remainingPuzzles = data.remainingPuzzles ?? 0;
        state.totalPuzzles = data.totalPuzzles ?? state.totalPuzzles;
        state.interestClicks = data.interestClicks ?? state.interestClicks;
        render();
        return;
      }

      throw new Error(data?.details || data?.error || "Puzzle loading failed.");
    }

    state.sessionId = data.sessionId;
    state.puzzle = data.puzzle;
    state.wordInputs = data.puzzle.words.map((word) =>
      word.cells.map((cell) => (cell.given ? cell.value : "")),
    );
    state.solvedWords = data.puzzle.words.map(() => false);
    state.circleLetters = data.puzzle.words.map(() => "");
    state.remainingPuzzles = data.remainingPuzzles ?? state.remainingPuzzles;
    state.totalPuzzles = data.totalPuzzles ?? state.totalPuzzles;
    state.status = "ready";
    state.message = "A puzzle is ready.";
  } catch (error) {
    state.status = "error";
    state.message = error.message;
  }

  render();
}

async function sendInterest() {
  const response = await fetch(`${API_BASE_URL}/api/interest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();

  if (!response.ok) {
    state.message = data?.error || "Could not record interest.";
    render();
    return;
  }

  state.interestSent = true;
  state.interestClicks = data.interestClicks ?? state.interestClicks;
  state.message = data.recorded
    ? "Thanks. Your interest was recorded."
    : "Your interest was already recorded from this connection.";
  render();
}

function syncWordInput(wordIndex, cellIndex, nextValue) {
  state.wordInputs[wordIndex][cellIndex] = nextValue.toUpperCase().replace(/[^A-Z]/g, "");
}

function focusCellInput(wordIndex, cellIndex) {
  const word = state.puzzle?.words?.[wordIndex];

  if (!word) {
    return;
  }

  let targetIndex = cellIndex;

  while (
    targetIndex < word.cells.length &&
    (word.cells[targetIndex]?.given || state.solvedWords[wordIndex])
  ) {
    targetIndex += 1;
  }

  if (targetIndex >= word.cells.length) {
    targetIndex = cellIndex;

    while (targetIndex >= 0 && (word.cells[targetIndex]?.given || state.solvedWords[wordIndex])) {
      targetIndex -= 1;
    }
  }

  const next = document.querySelector(
    `[data-role="cell-input"][data-word-index="${wordIndex}"][data-cell-index="${targetIndex}"]`,
  );

  if (next) {
    next.focus();
    next.select?.();
  }
}

function findEditableCellIndex(wordIndex, startIndex, direction) {
  const word = state.puzzle?.words?.[wordIndex];

  if (!word) {
    return -1;
  }

  let targetIndex = startIndex;

  while (targetIndex >= 0 && targetIndex < word.cells.length) {
    if (!word.cells[targetIndex]?.given && !state.solvedWords[wordIndex]) {
      return targetIndex;
    }

    targetIndex += direction;
  }

  return -1;
}

function focusFinalInput(finalIndex) {
  const next = document.querySelector(`[data-role="final-input"][data-final-index="${finalIndex}"]`);

  if (next) {
    next.focus();
    next.select?.();
  }
}

async function checkWord(wordIndex) {
  const guess = buildWordValue(wordIndex);
  state.message = `Checking word ${wordIndex + 1}...`;
  render();

  const response = await fetch(`${API_BASE_URL}/api/guess-word`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionId: state.sessionId,
      wordIndex,
      guess,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    state.message = data?.error || "Could not verify that word.";
    render();
    return;
  }

  if (data.correct) {
    state.solvedWords[wordIndex] = true;
    state.circleLetters[wordIndex] = data.circleLetter;
    state.message =
      state.solvedWords.filter(Boolean).length === 5
        ? "All five words are solved. Crack the title answer."
        : `Word ${wordIndex + 1} is correct.`;
  } else {
    state.message = `Word ${wordIndex + 1} is not quite right yet.`;
  }

  render();
}

function hasAnyEmptyEditableCell(wordIndex) {
  const word = state.puzzle?.words?.[wordIndex];

  if (!word) {
    return true;
  }

  return word.cells.some(
    (cell, cellIndex) => !cell.given && !(state.wordInputs[wordIndex]?.[cellIndex] || ""),
  );
}

async function checkFinal() {
  state.message = "Checking the final answer...";
  render();

  const response = await fetch(`${API_BASE_URL}/api/guess-final`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionId: state.sessionId,
      guess: state.finalGuess.join(""),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    state.message = data?.error || "Could not verify the final answer.";
    render();
    return;
  }

  if (data.correct) {
    state.finalSolved = true;
    state.celebrationTick += 1;
    state.message = "You solved the full puzzle.";
  } else {
    state.message = "That title answer does not fit yet.";
  }

  render();
}

app.addEventListener("input", (event) => {
  const target = event.target;

  if (target.matches('[data-role="cell-input"]')) {
    const wordIndex = Number(target.dataset.wordIndex);
    const cellIndex = Number(target.dataset.cellIndex);
    const nextValue = target.value.slice(-1).toUpperCase().replace(/[^A-Z]/g, "");
    const nextFocusIndex = nextValue ? cellIndex + 1 : cellIndex;

    target.value = nextValue;
    syncWordInput(wordIndex, cellIndex, nextValue);

    render();

    if (
      nextValue &&
      !state.solvedWords[wordIndex] &&
      canSubmitWord(wordIndex) &&
      !hasAnyEmptyEditableCell(wordIndex)
    ) {
      checkWord(wordIndex);
      return;
    }

    focusCellInput(wordIndex, nextFocusIndex);
  }

  if (target.matches('[data-role="final-input"]')) {
    const finalIndex = Number(target.dataset.finalIndex);
    const nextValue = target.value.slice(-1).toUpperCase().replace(/[^A-Z]/g, "");
    state.finalGuess[finalIndex] = nextValue;
    target.value = nextValue;

    render();
    focusFinalInput(nextValue ? finalIndex + 1 : finalIndex);
  }
});

app.addEventListener("keydown", (event) => {
  const target = event.target;

  if (target.matches('[data-role="cell-input"]')) {
    const wordIndex = Number(target.dataset.wordIndex);
    const cellIndex = Number(target.dataset.cellIndex);

    if (event.key === "ArrowLeft") {
      const previousIndex = findEditableCellIndex(wordIndex, cellIndex - 1, -1);

      if (previousIndex >= 0) {
        focusCellInput(wordIndex, previousIndex);
        event.preventDefault();
      }

      return;
    }

    if (event.key === "ArrowRight") {
      const nextIndex = findEditableCellIndex(wordIndex, cellIndex + 1, 1);

      if (nextIndex >= 0) {
        focusCellInput(wordIndex, nextIndex);
        event.preventDefault();
      }

      return;
    }

    if (event.key === "Backspace") {
      const currentValue = state.wordInputs[wordIndex]?.[cellIndex] || "";

      if (currentValue) {
        state.wordInputs[wordIndex][cellIndex] = "";
        target.value = "";
        render();
        focusCellInput(wordIndex, cellIndex);
        event.preventDefault();
        return;
      }

      const previousIndex = (() => {
        const word = state.puzzle?.words?.[wordIndex];

        if (!word) {
          return -1;
        }

        let index = cellIndex - 1;

        while (index >= 0 && word.cells[index]?.given) {
          index -= 1;
        }

        return index;
      })();

      if (previousIndex >= 0) {
        state.wordInputs[wordIndex][previousIndex] = "";
        render();
        focusCellInput(wordIndex, previousIndex);
        event.preventDefault();
      }
    }
  }

  if (target.matches('[data-role="final-input"]') && event.key === "Backspace") {
    const finalIndex = Number(target.dataset.finalIndex);
    const currentValue = state.finalGuess[finalIndex] || "";

    if (currentValue) {
      state.finalGuess[finalIndex] = "";
      render();
      focusFinalInput(finalIndex);
      event.preventDefault();
      return;
    }

    if (finalIndex > 0) {
      state.finalGuess[finalIndex - 1] = "";
      render();
      focusFinalInput(finalIndex - 1);
      event.preventDefault();
    }
  }

  if (target.matches('[data-role="final-input"]') && event.key === "ArrowLeft") {
    const finalIndex = Number(target.dataset.finalIndex);

    if (finalIndex > 0) {
      focusFinalInput(finalIndex - 1);
      event.preventDefault();
    }
  }

  if (target.matches('[data-role="final-input"]') && event.key === "ArrowRight") {
    const finalIndex = Number(target.dataset.finalIndex);

    if (finalIndex < 4) {
      focusFinalInput(finalIndex + 1);
      event.preventDefault();
    }
  }
});

app.addEventListener("click", (event) => {
  const target = event.target;

  if (target.matches('[data-action="new-puzzle"]')) {
    loadPuzzle({ forceNew: true });
  }

  if (target.matches('[data-action="check-word"]')) {
    checkWord(Number(target.dataset.wordIndex));
  }

  if (target.matches('[data-action="check-final"]')) {
    checkFinal();
  }

  if (target.matches('[data-action="clear-final"]')) {
    state.finalGuess = Array(5).fill("");
    render();
  }

  if (target.matches('[data-action="subscribe-interest"]')) {
    sendInterest();
  }
});

if (!restoreState()) {
  loadPuzzle();
} else {
  render();
}
