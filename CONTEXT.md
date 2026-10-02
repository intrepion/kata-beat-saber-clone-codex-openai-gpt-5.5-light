# Beat Saber Clone Context

This context defines the shared language for a mouse-first rhythm game inspired by Beat Saber. The project prioritizes recognizable beat timing, block approach, and flow while adapting the core loop to ordinary browser pointer input.

## Language

**Cursor Rhythm Game**:
A rhythm-action game where every playable beat is touched with the mouse cursor as beat blocks reach the strike plane.
_Avoid_: Saber simulator, two-saber mode, VR mode

**Beat Cursor**:
The player's mouse-controlled touch point in the strike plane.
_Avoid_: Saber, sword, blade

**Strike Plane**:
The screen-facing play space where the beat cursor can touch incoming beat blocks.
_Avoid_: Cursor layer, hit area, mouse plane

**Beat Block**:
An incoming target that reaches the strike plane on a beat and asks the player to touch it with the beat cursor.
_Avoid_: Note, cube, target

**Block Grid**:
The 3x3 set of readable strike-plane positions where beat blocks can arrive during the first playable track.
_Avoid_: Lanes, columns, target matrix

**Touch Window**:
The forgiving timing interval around a beat block's arrival when cursor contact can score.
_Avoid_: Cut direction, gesture window, swipe timing

**Chart**:
The authored sequence of beat blocks, timings, grid positions, and difficulty pacing for a track.
_Avoid_: Map, level script, song data

**Generated Track**:
A browser-generated synth rhythm track paired with an authored chart, used instead of licensed or uploaded music for the first playable version.
_Avoid_: Placeholder audio, metronome, soundtrack

**Neon Electro Pulse**:
The first generated track's musical personality: steady electronic beat, clean synth bass, and bright lead accents that support readable slicing.
_Avoid_: Industrial arena, minimal trainer, generic music

**Neon Duotone**:
The game's original visual identity: cyan beat cursor, magenta beat blocks, and a dark tunnel used for high-contrast readability.
_Avoid_: Rainbow arcade, monochrome trainer, generic neon

**Complete Track**:
A finite generated track with a start, pacing curve, ending, score, combo, misses, and restart path.
_Avoid_: Endless mode, demo loop, feel prototype

**Tutorial Ramp**:
The first chart's difficulty shape, starting with single cardinal cuts before introducing diagonals and cross-grid movement.
_Avoid_: Immediate arcade, adaptive difficulty, hard mode

**Direct Cursor Control**:
The control feel where the beat cursor follows mouse position without simulated blade inertia.
_Avoid_: Light smoothing, heavy inertia, lag

**Generous Timing**:
The first playable track's forgiving cut window, used to reveal whether mouse misses feel fair before strict rhythm scoring is tuned.
_Avoid_: Standard strictness, dynamic forgiveness, perfect-only scoring

**Beat Pulse**:
A subtle camera or lighting response to the rhythm that adds energy without changing the player's required mouse precision.
_Avoid_: Camera shake, tunnel lurch, dramatic sway

**Count-In**:
A short pre-track rhythm lead-in after the start click that lets the player place the beat cursor before beat blocks arrive.
_Avoid_: Countdown, loading delay, pre-roll

**Touch Burst**:
The immediate visual feedback emitted when a beat block is touched successfully.
_Avoid_: Explosion, particle reward, cut burst

**Miss**:
A beat block that reaches the end of its touch window without cursor contact.
_Avoid_: Fail, mistake, dropped note

**Flow**:
The felt state of reading, moving, and cutting beat blocks cleanly enough that the player experiences continuous rhythm rather than isolated clicks.
_Avoid_: Streak, vibe, momentum

**Best Score**:
The player's locally saved highest result for the complete track, used to make replay meaningful without requiring accounts or online services.
_Avoid_: Leaderboard, profile, stats history

**Rank**:
The end-summary grade derived from accuracy, combo, and misses for a completed track.
_Avoid_: Level, tier, progression

**Visible Timing Feedback**:
An on-screen indication of whether a cut was early, late, missed, or clean enough to help players improve without relying only on audio.
_Avoid_: Debug text, hidden timing, score popup

**Reduced Motion**:
The player option that limits camera and beat-pulse motion while preserving playable timing and scoring.
_Avoid_: Low graphics mode, accessibility mode, no effects

**Browser Proof**:
Evidence from the running browser that the player can start a track, touch sample beat blocks, change score and combo state, register misses, reach the end state, and produce a visual screenshot.
_Avoid_: Build proof, syntax proof, assumed playability
