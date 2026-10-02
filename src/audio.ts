export type TrackAudio = {
  context: AudioContext;
  startTime: number;
  stop: () => void;
};

export function startGeneratedTrack(
  countInSeconds: number,
  durationSeconds: number,
  muted: boolean
): TrackAudio | null {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  const context = new AudioContextClass();
  void context.resume();
  const master = context.createGain();
  master.gain.value = muted ? 0 : 0.42;
  master.connect(context.destination);

  const startTime = context.currentTime + countInSeconds;
  const bpm = 112;
  const secondsPerBeat = 60 / bpm;
  const oscillators: OscillatorNode[] = [];
  const gains: GainNode[] = [];

  for (let beat = -4; beat < durationSeconds / secondsPerBeat; beat += 1) {
    const when = startTime + beat * secondsPerBeat;
    if (when < context.currentTime + 0.01) {
      continue;
    }
    const isAccent = beat % 4 === 0;
    scheduleKick(context, master, when, isAccent, oscillators, gains);
    scheduleTone(context, master, when, isAccent ? 110 : 164.81, isAccent ? 0.2 : 0.13, 0.24, "sawtooth", oscillators, gains);
    scheduleTone(context, master, when + secondsPerBeat / 2, 880, 0.045, 0.05, "square", oscillators, gains);

    if (beat >= 0 && beat % 2 === 0) {
      scheduleTone(context, master, when + 0.04, 659.25, 0.14, 0.12, "triangle", oscillators, gains);
    }

    if (beat >= 0 && beat % 4 === 2) {
      scheduleNoiseSnare(context, master, when + 0.01, oscillators, gains);
    }
  }

  return {
    context,
    startTime,
    stop: () => {
      for (const oscillator of oscillators) {
        try {
          oscillator.stop();
        } catch {
          // Oscillators may already be stopped by their scheduled envelope.
        }
      }

      for (const gain of gains) {
        gain.disconnect();
      }

      void context.close();
    }
  };
}

function scheduleTone(
  context: AudioContext,
  destination: AudioNode,
  when: number,
  frequency: number,
  gainValue: number,
  duration: number,
  type: OscillatorType,
  oscillators: OscillatorNode[],
  gains: GainNode[]
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(gainValue, when + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, when + duration);
  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start(when);
  oscillator.stop(when + duration + 0.02);
  oscillators.push(oscillator);
  gains.push(gain);
}

function scheduleKick(
  context: AudioContext,
  destination: AudioNode,
  when: number,
  accent: boolean,
  oscillators: OscillatorNode[],
  gains: GainNode[]
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(accent ? 92 : 74, when);
  oscillator.frequency.exponentialRampToValueAtTime(38, when + 0.16);
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(accent ? 0.95 : 0.68, when + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.22);
  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start(when);
  oscillator.stop(when + 0.24);
  oscillators.push(oscillator);
  gains.push(gain);
}

function scheduleNoiseSnare(
  context: AudioContext,
  destination: AudioNode,
  when: number,
  oscillators: OscillatorNode[],
  gains: GainNode[]
) {
  scheduleTone(context, destination, when, 180, 0.16, 0.09, "square", oscillators, gains);
  scheduleTone(context, destination, when + 0.01, 1200, 0.08, 0.04, "triangle", oscillators, gains);
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
