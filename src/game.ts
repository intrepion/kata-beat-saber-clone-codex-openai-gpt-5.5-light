import * as THREE from "three";
import { startGeneratedTrack, type TrackAudio } from "./audio";
import {
  BLOCK_TRAVEL_SECONDS,
  FIRST_TRACK_CHART,
  getTrackDurationSeconds,
  scheduleChart,
  type ScheduledBeatBlock
} from "./chart";
import { applyCutResult, getRank, INITIAL_SCORE_STATE, judgeCut, type ScoreState } from "./scoring";
import { readBestScore, saveBestScore } from "./storage";

type ActiveBlock = {
  block: ScheduledBeatBlock;
  mesh: THREE.Mesh;
  judged: boolean;
};

type SaberSample = {
  x: number;
  y: number;
  time: number;
};

type GameOptions = {
  arena: HTMLElement;
  scoreEl: HTMLElement;
  comboEl: HTMLElement;
  missesEl: HTMLElement;
  feedbackEl: HTMLElement;
  bestEl: HTMLElement;
  overlayEl: HTMLElement;
  reducedMotionInput: HTMLInputElement;
  muteInput: HTMLInputElement;
};

const COUNT_IN_SECONDS = 2;
const STRIKE_DISTANCE = 0.62;
const MISS_WINDOW_SECONDS = 0.34;
const GRID_X = [-1.45, 0, 1.45] as const;
const GRID_Y = [-1.05, 0, 1.05] as const;

export class NeonSaberGame {
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(70, 1, 0.1, 100);
  private readonly renderer = new THREE.WebGLRenderer({ antialias: true });
  private readonly clock = new THREE.Clock();
  private readonly scheduled = scheduleChart(FIRST_TRACK_CHART);
  private readonly trackDuration = getTrackDurationSeconds(FIRST_TRACK_CHART);
  private readonly saber = new THREE.Group();
  private readonly saberTip = new THREE.Vector2(0, 0);
  private readonly samples: SaberSample[] = [];
  private readonly activeBlocks: ActiveBlock[] = [];
  private readonly bursts: THREE.Mesh[] = [];
  private scoreState: ScoreState = { ...INITIAL_SCORE_STATE };
  private audio: TrackAudio | null = null;
  private fallbackStartMs = 0;
  private animationId = 0;
  private started = false;
  private ended = false;

  constructor(private readonly options: GameOptions) {
    this.scene.background = new THREE.Color(0x05060c);
    this.camera.position.set(0, 0.7, 6);
    this.camera.lookAt(0, 0, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.options.arena.appendChild(this.renderer.domElement);
    this.buildScene();
    this.resize();
    this.updateBestScore();

    window.addEventListener("resize", this.resize);
    this.options.arena.addEventListener("pointermove", this.handlePointerMove);
    this.options.arena.addEventListener("pointerleave", this.handlePointerLeave);
    window.addEventListener("keydown", this.handleKeyDown);
    this.animationId = requestAnimationFrame(this.renderIdle);
  }

  start = () => {
    this.reset();
    this.started = true;
    this.options.overlayEl.hidden = true;
    this.audio = startGeneratedTrack(
      COUNT_IN_SECONDS,
      this.trackDuration,
      this.options.muteInput.checked
    );
    this.fallbackStartMs = performance.now() + COUNT_IN_SECONDS * 1000;
    this.clock.start();
    cancelAnimationFrame(this.animationId);
    this.animationId = requestAnimationFrame(this.tick);
  };

  dispose() {
    cancelAnimationFrame(this.animationId);
    this.audio?.stop();
    window.removeEventListener("resize", this.resize);
    this.options.arena.removeEventListener("pointermove", this.handlePointerMove);
    this.options.arena.removeEventListener("pointerleave", this.handlePointerLeave);
    window.removeEventListener("keydown", this.handleKeyDown);
    this.renderer.dispose();
  }

  private reset() {
    this.scoreState = { ...INITIAL_SCORE_STATE };
    this.started = false;
    this.ended = false;
    this.feedback("Get ready");
    this.audio?.stop();
    this.audio = null;
    this.samples.length = 0;

    for (const active of this.activeBlocks) {
      this.scene.remove(active.mesh);
    }

    this.activeBlocks.length = 0;
    this.updateHud();
  }

  private buildScene() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    this.scene.add(ambient);

    const cyan = new THREE.PointLight(0x46f7ff, 22, 24);
    cyan.position.set(-2.5, 2, 3);
    this.scene.add(cyan);

    const magenta = new THREE.PointLight(0xff3bc8, 18, 20);
    magenta.position.set(2.5, -1, 1);
    this.scene.add(magenta);

    const tunnel = new THREE.GridHelper(16, 16, 0x46f7ff, 0x17253c);
    tunnel.rotation.x = Math.PI / 2;
    tunnel.position.z = -4;
    this.scene.add(tunnel);

    const planeGeometry = new THREE.RingGeometry(2.8, 2.86, 4);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x46f7ff, transparent: true, opacity: 0.22 });
    const strikePlane = new THREE.Mesh(planeGeometry, planeMaterial);
    strikePlane.rotation.z = Math.PI / 4;
    this.scene.add(strikePlane);

    const blade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.015, 2.2, 16),
      new THREE.MeshBasicMaterial({ color: 0x46f7ff })
    );
    blade.position.y = -0.9;
    this.saber.add(blade);

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 18, 18),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    glow.position.y = 0.24;
    this.saber.add(glow);
    this.scene.add(this.saber);
  }

  private tick = () => {
    const elapsed = this.getElapsedSeconds();
    this.spawnDueBlocks(elapsed);
    this.updateBlocks(elapsed);
    this.updateSaber();

    if (!this.options.reducedMotionInput.checked) {
      this.camera.position.z = 6 + Math.sin(elapsed * Math.PI * 2) * 0.025;
    }

    this.renderer.render(this.scene, this.camera);

    if (!this.ended && elapsed > this.trackDuration) {
      this.endTrack();
    }

    this.animationId = requestAnimationFrame(this.tick);
  };

  private renderIdle = () => {
    this.updateSaber();
    this.renderer.render(this.scene, this.camera);
    this.animationId = requestAnimationFrame(this.renderIdle);
  };

  private spawnDueBlocks(elapsed: number) {
    for (const block of this.scheduled) {
      if (
        block.spawnTimeSeconds <= elapsed &&
        !this.activeBlocks.some((active) => active.block.id === block.id)
      ) {
        this.activeBlocks.push({
          block,
          mesh: this.createBlockMesh(block),
          judged: false
        });
      }
    }
  }

  private updateBlocks(elapsed: number) {
    for (const active of this.activeBlocks) {
      const progress = THREE.MathUtils.clamp(
        (elapsed - active.block.spawnTimeSeconds) / BLOCK_TRAVEL_SECONDS,
        0,
        1.3
      );
      active.mesh.position.z = THREE.MathUtils.lerp(-12, 0, progress);
      active.mesh.rotation.z += 0.01;

      if (!active.judged && elapsed - active.block.hitTimeSeconds > MISS_WINDOW_SECONDS) {
        active.judged = true;
        this.applyMiss();
        this.scene.remove(active.mesh);
      }
    }

    for (let index = this.bursts.length - 1; index >= 0; index -= 1) {
      const burst = this.bursts[index];
      burst.scale.multiplyScalar(1.05);
      const material = burst.material;
      if (material instanceof THREE.MeshBasicMaterial) {
        material.opacity -= 0.025;
        if (material.opacity <= 0) {
          this.scene.remove(burst);
          this.bursts.splice(index, 1);
        }
      }
    }
  }

  private createBlockMesh(block: ScheduledBeatBlock): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(0.82, 0.82, 0.3);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff3bc8,
      emissive: 0x46123a,
      roughness: 0.35
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(GRID_X[block.cell.column], GRID_Y[block.cell.row], -12);
    mesh.userData.blockId = block.id;
    this.scene.add(mesh);
    return mesh;
  }

  private tryCut() {
    if (!this.started || this.ended) {
      return;
    }

    const elapsed = this.getElapsedSeconds();
    const movement = this.getRecentMovement();

    for (const active of this.activeBlocks) {
      if (active.judged) {
        continue;
      }

      const target = new THREE.Vector2(
        GRID_X[active.block.cell.column],
        GRID_Y[active.block.cell.row]
      );
      const distance = target.distanceTo(this.saberTip);
      const offset = elapsed - active.block.hitTimeSeconds;

      if (distance > STRIKE_DISTANCE || Math.abs(offset) > MISS_WINDOW_SECONDS) {
        continue;
      }

      const result = judgeCut({
        expectedDirection: active.block.direction,
        movement,
        timeOffsetSeconds: offset,
        followThrough: Math.min(1, Math.hypot(movement.x, movement.y) * 1.8)
      });

      this.scoreState = applyCutResult(this.scoreState, result);
      active.judged = true;
      this.scene.remove(active.mesh);
      this.updateHud();

      if (result.hit) {
        this.addCutBurst(target.x, target.y);
        this.feedback(result.timing === "clean" ? "Clean cut" : result.timing);
      } else {
        this.feedback(result.directionMatched ? "Timing miss" : "Wrong direction");
      }

      return;
    }
  }

  private applyMiss() {
    this.scoreState = applyCutResult(this.scoreState, {
      hit: false,
      points: 0,
      timing: "miss",
      directionMatched: false
    });
    this.updateHud();
    this.feedback("Miss");
  }

  private addCutBurst(x: number, y: number) {
    const burst = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.025, 8, 24),
      new THREE.MeshBasicMaterial({ color: 0x46f7ff, transparent: true, opacity: 0.85 })
    );
    burst.position.set(x, y, 0.06);
    this.bursts.push(burst);
    this.scene.add(burst);
  }

  private endTrack() {
    this.ended = true;
    this.started = false;
    const rank = getRank(this.scoreState);
    const best = saveBestScore(window.localStorage, {
      score: this.scoreState.score,
      rank
    });
    this.options.overlayEl.hidden = false;
    this.options.overlayEl.innerHTML = `
      <div class="start-card end-card">
        <h1>Rank ${rank}</h1>
        <p>Score ${this.scoreState.score} · Max combo ${this.scoreState.maxCombo} · Misses ${this.scoreState.misses}</p>
        <p>Best ${best.score} · Rank ${best.rank}</p>
        <button class="primary-button" data-testid="restart-button" type="button">Restart Track</button>
      </div>
    `;
    this.options.overlayEl
      .querySelector<HTMLButtonElement>("[data-testid='restart-button']")
      ?.addEventListener("click", this.start);
    this.updateBestScore();
  }

  private updateSaber() {
    this.saber.position.set(this.saberTip.x, this.saberTip.y - 0.22, 0.2);
    const movement = this.getRecentMovement();
    this.saber.rotation.z = -Math.atan2(movement.x, Math.max(Math.abs(movement.y), 0.2));
  }

  private getRecentMovement() {
    const latest = this.samples.at(-1);
    const previous = [...this.samples].reverse().find((sample) => latest && latest.time - sample.time > 35);

    if (!latest || !previous) {
      return { x: 0, y: -1 };
    }

    return {
      x: latest.x - previous.x,
      y: latest.y - previous.y
    };
  }

  private getElapsedSeconds() {
    if (this.audio) {
      return this.audio.context.currentTime - this.audio.startTime;
    }

    return (performance.now() - this.fallbackStartMs) / 1000;
  }

  private feedback(message: string) {
    this.options.feedbackEl.textContent = message;
  }

  private updateHud() {
    this.options.scoreEl.textContent = String(this.scoreState.score);
    this.options.comboEl.textContent = String(this.scoreState.combo);
    this.options.missesEl.textContent = String(this.scoreState.misses);
  }

  private updateBestScore() {
    const best = readBestScore(window.localStorage);
    this.options.bestEl.textContent = best ? `${best.score} ${best.rank}` : "None";
  }

  private handlePointerMove = (event: PointerEvent) => {
    const rect = this.options.arena.getBoundingClientRect();
    const normalizedX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const normalizedY = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    const targetX = normalizedX * 2.15;
    const targetY = normalizedY * 1.45;
    this.saberTip.lerp(new THREE.Vector2(targetX, targetY), 0.62);
    this.samples.push({ x: this.saberTip.x, y: this.saberTip.y, time: performance.now() });

    while (this.samples.length > 8) {
      this.samples.shift();
    }

    this.tryCut();
  };

  private handlePointerLeave = () => {
    this.samples.length = 0;
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key.toLowerCase() === "r") {
      this.start();
    }
  };

  private resize = () => {
    const width = this.options.arena.clientWidth || window.innerWidth;
    const height = this.options.arena.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };
}
