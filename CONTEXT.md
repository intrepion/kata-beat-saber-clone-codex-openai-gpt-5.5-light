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

**Cut Direction**:
The intended slash vector shown on a beat block and judged against the saber's recent movement.
_Avoid_: Arrow, gesture, swipe

**Chart**:
The authored sequence of beat blocks, timings, cut directions, and difficulty pacing for a track.
_Avoid_: Map, level script, song data

**Generated Track**:
A browser-generated synth rhythm track paired with an authored chart, used instead of licensed or uploaded music for the first playable version.
_Avoid_: Placeholder audio, metronome, soundtrack

**Flow**:
The felt state of reading, moving, and cutting beat blocks cleanly enough that the player experiences continuous rhythm rather than isolated clicks.
_Avoid_: Streak, vibe, momentum
