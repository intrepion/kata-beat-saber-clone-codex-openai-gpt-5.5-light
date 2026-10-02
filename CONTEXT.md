# Beat Saber Clone Context

This context defines the shared language for a mouse-first, single-saber rhythm game inspired by Beat Saber. The project prioritizes recognizable slicing, timing, and flow while adapting the core loop to ordinary browser pointer input.

## Language

**One-Saber Rhythm Game**:
A rhythm-action game where every playable beat is cut with one blade controlled by the mouse.
_Avoid_: Two-saber mode, VR mode, dual-wield mode

**Saber**:
The player's single cutting blade, represented by a visible trail that follows recent mouse movement through the strike space.
_Avoid_: Sword, cursor, pointer

**Strike Plane**:
The screen-facing play space where the mouse-controlled saber can intersect incoming beat blocks.
_Avoid_: Cursor layer, hit area, mouse plane

**Beat Block**:
An incoming target that reaches the strike plane on a beat and asks the player to cut in a specific direction.
_Avoid_: Note, cube, target

**Block Grid**:
The 3x3 set of readable strike-plane positions where beat blocks can arrive during the first playable track.
_Avoid_: Lanes, columns, target matrix

**Cut Direction**:
The intended slash vector shown on a beat block and judged against the saber's recent movement.
_Avoid_: Arrow, gesture, swipe

**Chart**:
The authored sequence of beat blocks, timings, cut directions, and difficulty pacing for a track.
_Avoid_: Map, level script, song data

**Generated Track**:
A browser-generated synth rhythm track paired with an authored chart, used instead of licensed or uploaded music for the first playable version.
_Avoid_: Placeholder audio, metronome, soundtrack

**Neon Electro Pulse**:
The first generated track's musical personality: steady electronic beat, clean synth bass, and bright lead accents that support readable slicing.
_Avoid_: Industrial arena, minimal trainer, generic music

**Complete Track**:
A finite generated track with a start, pacing curve, ending, score, combo, misses, and restart path.
_Avoid_: Endless mode, demo loop, feel prototype

**Tutorial Ramp**:
The first chart's difficulty shape, starting with single cardinal cuts before introducing diagonals and cross-grid movement.
_Avoid_: Immediate arcade, adaptive difficulty, hard mode

**Light Smoothing**:
The saber motion feel where pointer input remains close and trustworthy while retaining enough trail history for cut direction and follow-through judgment.
_Avoid_: Heavy inertia, raw cursor, lag

**Generous Timing**:
The first playable track's forgiving cut window, used to reveal whether mouse misses feel fair before strict rhythm scoring is tuned.
_Avoid_: Standard strictness, dynamic forgiveness, perfect-only scoring

**Beat Pulse**:
A subtle camera or lighting response to the rhythm that adds energy without changing the player's required mouse precision.
_Avoid_: Camera shake, tunnel lurch, dramatic sway

**Slice Follow-Through**:
The continuation of the saber's movement through a beat block after initial contact, used as part of score quality.
_Avoid_: Drag length, swing tail, after-swipe

**Miss**:
A beat block that reaches the end of its timing window without a valid position-and-direction cut.
_Avoid_: Fail, mistake, dropped note

**Flow**:
The felt state of reading, moving, and cutting beat blocks cleanly enough that the player experiences continuous rhythm rather than isolated clicks.
_Avoid_: Streak, vibe, momentum

**Browser Proof**:
Evidence from the running browser that the player can start a track, cut sample beat blocks, change score and combo state, register misses, reach the end state, and produce a visual screenshot.
_Avoid_: Build proof, syntax proof, assumed playability
