# Use Vite, Three.js, and Focused Game Modules

The implementation will use Vite, TypeScript, Three.js, and Playwright, with focused modules for chart data, generated audio, scoring, saber input, arena rendering, and browser orchestration. The MVP will avoid pointer lock, use a click-to-start screen with a count-in, include saber trail, cut burst, miss flash, score and combo HUD, end summary, and local best score, because these choices make the one-saber loop easier to inspect, test, and tune than a single-file prototype or pointer-lock-first build.
