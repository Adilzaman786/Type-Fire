// Web Audio API Synthesizer for tactile typing sounds and game audio effects
import { SwitchSound } from '../types/typing';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundMode: SwitchSound = 'mechanical';
  private volume: number = 0.5;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setSoundMode(mode: SwitchSound) {
    this.soundMode = mode;
  }

  public getSoundMode(): SwitchSound {
    return this.soundMode;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  // Play standard keystroke sound
  public playKey(isSpace: boolean = false) {
    if (this.soundMode === 'off') return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const isBlue = this.soundMode === 'cherry-blue' || this.soundMode === 'clicky';
    const isBrown = this.soundMode === 'cherry-brown' || this.soundMode === 'mechanical';
    const isTypewriter = this.soundMode === 'typewriter';
    const isSubtle = this.soundMode === 'subtle';

    if (isBlue) {
      // Cherry MX Blue: High tactile click snap + metallic spring transient
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(isSpace ? 650 : 920 + Math.random() * 120, now);
      clickOsc.frequency.exponentialRampToValueAtTime(260, now + 0.018);

      clickGain.gain.setValueAtTime(0.32 * this.volume, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.022);

      // Plastic bottom-out thump
      const thumpOsc = ctx.createOscillator();
      const thumpGain = ctx.createGain();
      thumpOsc.type = 'triangle';
      thumpOsc.frequency.setValueAtTime(isSpace ? 130 : 220, now + 0.004);
      thumpOsc.frequency.exponentialRampToValueAtTime(70, now + 0.038);

      thumpGain.gain.setValueAtTime(0.24 * this.volume, now + 0.004);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);

      thumpOsc.connect(thumpGain);
      thumpGain.connect(ctx.destination);
      thumpOsc.start(now + 0.004);
      thumpOsc.stop(now + 0.042);

    } else if (isBrown) {
      // Cherry MX Brown / Red: Creamy Thocky Deep Sound (Lube / Foam acoustic profile)
      const baseFreq = isSpace ? 110 : 180 + Math.random() * 30;
      
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.05);

      // Lowpass biquad filter for smooth creamy thock
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.38 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.055);

      // Soft contact tap
      const tapBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.01, ctx.sampleRate);
      const tapData = tapBuffer.getChannelData(0);
      for (let i = 0; i < tapData.length; i++) {
        tapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (tapData.length * 0.2));
      }
      const tap = ctx.createBufferSource();
      tap.buffer = tapBuffer;
      const tapGain = ctx.createGain();
      tapGain.gain.setValueAtTime(0.14 * this.volume, now);
      tapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
      tap.connect(tapGain);
      tapGain.connect(ctx.destination);
      tap.start(now);

    } else if (isTypewriter) {
      // Heavy vintage mechanical typewriter clack + metal linkage
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(isSpace ? 160 : 340 + Math.random() * 40, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.045);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(650, now);
      filter.Q.setValueAtTime(2.5, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.28 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);

      // If spacebar pressed, ring the classic vintage typewriter carriage return bell!
      if (isSpace) {
        this.playTypewriterBell();
      }

    } else if (isSubtle) {
      // Soft gentle quiet tap
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.02);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.022);
    }
  }

  // Vintage Typewriter Carriage Bell Chime
  public playTypewriterBell() {
    if (this.soundMode === 'off') return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + 0.01;
    // Harmonic dual sine chime at 2093Hz (C7) and 3136Hz (G7)
    const bellFreqs = [2093, 3136];
    bellFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(idx === 0 ? 0.22 * this.volume : 0.12 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    });
  }

  // Play error feedback sound (soft buzz/thump)
  public playError() {
    if (this.soundMode === 'off') return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

    gain.gain.setValueAtTime(0.18 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Play success / level complete chord
  public playSuccess() {
    if (this.soundMode === 'off') return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.18 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    });
  }

  // Laser zap sound for typing game (meteor destroy)
  public playLaser() {
    if (this.soundMode === 'off') return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

    gain.gain.setValueAtTime(0.2 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Explosion sound for game
  public playExplosion() {
    if (this.soundMode === 'off') return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    noise.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  }
}

export const soundEngine = new SoundEngine();
