import { APP_TAGLINE, APP_TITLE } from "./appInfo";
import { NeonSaberGame } from "./game";
import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Missing #app root");
}

app.innerHTML = `
  <main class="game-shell" aria-label="${APP_TITLE}">
    <div class="arena" data-testid="arena"></div>
    <header class="hud" aria-label="Track status">
      <div class="brand">${APP_TITLE}</div>
      <div class="hud-panel">
        <span>Score <strong data-testid="score">0</strong></span>
        <span>Combo <strong data-testid="combo">0</strong></span>
        <span>Misses <strong data-testid="misses">0</strong></span>
        <span>Best <strong data-testid="best-score">None</strong></span>
      </div>
    </header>
    <aside class="controls" aria-label="Player options">
      <label><input data-testid="mute-toggle" type="checkbox" /> Mute</label>
      <label><input data-testid="reduced-motion-toggle" type="checkbox" /> Reduced motion</label>
      <div data-testid="timing-feedback" aria-live="polite">Ready</div>
    </aside>
    <section class="center-panel">
      <div class="start-card">
        <h1>${APP_TITLE}</h1>
        <p>${APP_TAGLINE}</p>
        <button class="primary-button" data-testid="start-button" type="button">Start Track</button>
      </div>
    </section>
  </main>
`;

const maybeArena = app.querySelector<HTMLDivElement>("[data-testid='arena']");
const startButton = app.querySelector<HTMLButtonElement>("[data-testid='start-button']");
const scoreEl = app.querySelector<HTMLElement>("[data-testid='score']");
const comboEl = app.querySelector<HTMLElement>("[data-testid='combo']");
const missesEl = app.querySelector<HTMLElement>("[data-testid='misses']");
const feedbackEl = app.querySelector<HTMLElement>("[data-testid='timing-feedback']");
const bestEl = app.querySelector<HTMLElement>("[data-testid='best-score']");
const overlayEl = app.querySelector<HTMLElement>(".center-panel");
const reducedMotionInput = app.querySelector<HTMLInputElement>("[data-testid='reduced-motion-toggle']");
const muteInput = app.querySelector<HTMLInputElement>("[data-testid='mute-toggle']");

if (
  !maybeArena ||
  !startButton ||
  !scoreEl ||
  !comboEl ||
  !missesEl ||
  !feedbackEl ||
  !bestEl ||
  !overlayEl ||
  !reducedMotionInput ||
  !muteInput
) {
  throw new Error("Missing game UI");
}

const game = new NeonSaberGame({
  arena: maybeArena,
  scoreEl,
  comboEl,
  missesEl,
  feedbackEl,
  bestEl,
  overlayEl,
  reducedMotionInput,
  muteInput
});

startButton.addEventListener("click", game.start);
