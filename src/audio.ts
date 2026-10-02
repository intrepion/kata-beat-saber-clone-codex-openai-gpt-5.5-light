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
  const master = context.createGain();
  master.gain.value = muted ? 0 : 0.18;
  master.connect(context.destination);

  const startTime = context.currentTime + countInSeconds;
  const stopAt = startTime + durationSeconds + 1;
  const bpm = 112;
  const secondsPerBeat = 60 / bpm;
  const oscillators: OscillatorNode[] = [];
  const gains: GainNode[] = [];

  for (let beat = -4; beat < durationSeconds / secondsPerBeat; beat += 1) {
    const when = startTime + beat * secondsPerBeat;
    const isAccent = beat % 4 === 0;
    schedulePulse(context, master, when, isAccent ? 220 : 330, isAccent ? 0.16 : 0.08, oscillators, gains);

    if (beat >= 0 && beat % 2 === 0) {
      schedulePulse(context, master, when + 0.02, 660, 0.06, oscillators, gains);
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

function schedulePulse(
  context: AudioContext,
  destination: AudioNode,
  when: number,
  frequency: number,
  gainValue: number,
  oscillators: OscillatorNode[],
  gains: GainNode[]
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = frequency < 300 ? "sawtooth" : "triangle";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(gainValue, when + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, when + 0.18);
  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start(when);
  oscillator.stop(when + 0.2);
  oscillators.push(oscillator);
  gains.push(gain);
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
