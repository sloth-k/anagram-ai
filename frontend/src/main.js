import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const state = {
  sessionId: "",
  puzzle: null,
  wordInputs: [],
  solvedWords: [],
  circleLetters: [],
  finalGuess: Array(5).fill(""),
  finalSolved: false,
  status: "loading",
  message: "Generating a fresh puzzle...",
};

const app = document.querySelector("#app");

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
  const title = state.puzzle?.titleClue || "AI puzzle";
  const finalSlots = state.finalGuess;
  const titleLetters = state.circleLetters.filter(Boolean);

  app.innerHTML = `
    <main class="shell">
      <section class="hero">
        <p class="eyebrow">AI-generated daily-style jumble</p>
        <h1>Angaram AI</h1>
        <p class="intro">
          Solve all five clue words. The circled letters unlock the final 5-letter answer.
        </p>
        <div class="hero-card">
          <div>
            <p class="hero-label">Title clue</p>
            <h2>${escapeHtml(title)}</h2>
          </div>
          <button class="ghost-button" data-action="new-puzzle">New puzzle</button>
        </div>
      </section>

      <section class="board">
        <div class="board-header">
          <div>
            <p class="section-kicker">Status</p>
            <h3>${escapeHtml(state.message)}</h3>
          </div>
          <div class="badge">${state.solvedWords.filter(Boolean).length}/5 solved</div>
        </div>

        ${
          state.status === "error"
            ? `<div class="error-panel">
                <p>We could not generate a puzzle right now.</p>
                <button class="primary-button" data-action="new-puzzle">Try again</button>
              </div>`
            : ""
        }

        ${
          state.puzzle
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
                    ${state.puzzle.scrambledLetters
                      .map(
                        (letter) => `
                          <span class="scramble-chip ${titleLetters.includes(letter) ? "is-found" : ""}">
                            ${escapeHtml(letter)}
                          </span>
                        `,
                      )
                      .join("")}
                  </div>
                  <p class="final-copy">
                    Use the circled letters to solve the title clue.
                  </p>
                  <div class="final-slots">
                    ${finalSlots
                      .map(
                        (letter, index) => `
                          <label class="cell final-cell ${state.finalSolved ? "is-correct" : ""}">
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
  `;
}

async function loadPuzzle() {
  state.status = "loading";
  state.message = "Generating a fresh puzzle...";
  state.puzzle = null;
  state.sessionId = "";
  state.wordInputs = [];
  state.solvedWords = [];
  state.circleLetters = [];
  state.finalGuess = Array(5).fill("");
  state.finalSolved = false;
  render();

  try {
    const response = await fetch(`${API_BASE_URL}/api/puzzle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.details || data?.error || "Puzzle generation failed.");
    }

    state.sessionId = data.sessionId;
    state.puzzle = data.puzzle;
    state.wordInputs = data.puzzle.words.map((word) =>
      word.cells.map((cell) => (cell.given ? cell.value : "")),
    );
    state.solvedWords = data.puzzle.words.map(() => false);
    state.circleLetters = data.puzzle.words.map(() => "");
    state.status = "ready";
    state.message = "A fresh puzzle is ready.";
  } catch (error) {
    state.status = "error";
    state.message = error.message;
  }

  render();
}

function syncWordInput(wordIndex, cellIndex, nextValue) {
  state.wordInputs[wordIndex][cellIndex] = nextValue.toUpperCase().replace(/[^A-Z]/g, "");
}

function focusCellInput(wordIndex, cellIndex) {
  const next = document.querySelector(
    `[data-role="cell-input"][data-word-index="${wordIndex}"][data-cell-index="${cellIndex}"]`,
  );

  if (next) {
    next.focus();
    next.select?.();
  }
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

app.addEventListener("click", (event) => {
  const target = event.target;

  if (target.matches('[data-action="new-puzzle"]')) {
    loadPuzzle();
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
});

loadPuzzle();
