import { SfxParams, SfxPreset, WaveformType } from '../types';

export const DEFAULT_SFX_PARAMS: SfxParams = {
  waveform: 'square',
  baseFrequency: 440,
  frequencySlide: -0.2,
  vibratoDepth: 0,
  vibratoSpeed: 10,
  attackTime: 0.01,
  decayTime: 0.1,
  sustainLevel: 0.3,
  sustainTime: 0.1,
  releaseTime: 0.15,
  filterCutoff: 3000,
  filterResonance: 1,
  filterType: 'none',
  bitDepth: 16,
  sampleRateReduction: 1,
  masterVolume: 0.8,
};

export function generatePreset(preset: SfxPreset): SfxParams {
  switch (preset) {
    case 'laser':
      return {
        waveform: Math.random() > 0.5 ? 'sawtooth' : 'square',
        baseFrequency: 800 + Math.random() * 600,
        frequencySlide: -0.7 - Math.random() * 0.2,
        vibratoDepth: 0,
        vibratoSpeed: 10,
        attackTime: 0.005,
        decayTime: 0.12 + Math.random() * 0.08,
        sustainLevel: 0.1,
        sustainTime: 0.02,
        releaseTime: 0.08,
        filterCutoff: 4000,
        filterResonance: 3,
        filterType: 'lowpass',
        bitDepth: 16,
        sampleRateReduction: 1,
        masterVolume: 0.85,
      };

    case 'jump':
      return {
        waveform: 'square',
        baseFrequency: 160 + Math.random() * 80,
        frequencySlide: 0.6 + Math.random() * 0.3,
        vibratoDepth: 0,
        vibratoSpeed: 8,
        attackTime: 0.01,
        decayTime: 0.15 + Math.random() * 0.05,
        sustainLevel: 0.4,
        sustainTime: 0.05,
        releaseTime: 0.12,
        filterCutoff: 5000,
        filterResonance: 2,
        filterType: 'none',
        bitDepth: 16,
        sampleRateReduction: 1,
        masterVolume: 0.8,
      };

    case 'explosion':
      return {
        waveform: 'noise',
        baseFrequency: 100 + Math.random() * 50,
        frequencySlide: -0.4,
        vibratoDepth: 0,
        vibratoSpeed: 5,
        attackTime: 0.01,
        decayTime: 0.35 + Math.random() * 0.2,
        sustainLevel: 0.25,
        sustainTime: 0.1,
        releaseTime: 0.4 + Math.random() * 0.3,
        filterCutoff: 800 + Math.random() * 600,
        filterResonance: 4,
        filterType: 'lowpass',
        bitDepth: 8,
        sampleRateReduction: 2,
        masterVolume: 0.9,
      };

    case 'coin':
      return {
        waveform: 'square',
        baseFrequency: 659.25, // E5
        frequencySlide: 0.4,
        vibratoDepth: 0,
        vibratoSpeed: 0,
        attackTime: 0.01,
        decayTime: 0.08,
        sustainLevel: 0.5,
        sustainTime: 0.15,
        releaseTime: 0.25,
        filterCutoff: 6000,
        filterResonance: 1,
        filterType: 'none',
        bitDepth: 16,
        sampleRateReduction: 1,
        masterVolume: 0.85,
      };

    case 'powerup':
      return {
        waveform: Math.random() > 0.5 ? 'triangle' : 'square',
        baseFrequency: 220 + Math.random() * 100,
        frequencySlide: 0.75,
        vibratoDepth: 0.25,
        vibratoSpeed: 14,
        attackTime: 0.02,
        decayTime: 0.2,
        sustainLevel: 0.6,
        sustainTime: 0.3,
        releaseTime: 0.2,
        filterCutoff: 5000,
        filterResonance: 2,
        filterType: 'none',
        bitDepth: 16,
        sampleRateReduction: 1,
        masterVolume: 0.8,
      };

    case 'hit':
      return {
        waveform: Math.random() > 0.5 ? 'noise' : 'sawtooth',
        baseFrequency: 300 + Math.random() * 200,
        frequencySlide: -0.6,
        vibratoDepth: 0,
        vibratoSpeed: 0,
        attackTime: 0.005,
        decayTime: 0.08 + Math.random() * 0.05,
        sustainLevel: 0.1,
        sustainTime: 0.02,
        releaseTime: 0.05,
        filterCutoff: 1200,
        filterResonance: 3,
        filterType: 'lowpass',
        bitDepth: 8,
        sampleRateReduction: 2,
        masterVolume: 0.9,
      };

    case 'blip':
      return {
        waveform: 'triangle',
        baseFrequency: 500 + Math.random() * 400,
        frequencySlide: 0,
        vibratoDepth: 0,
        vibratoSpeed: 0,
        attackTime: 0.005,
        decayTime: 0.04,
        sustainLevel: 0.2,
        sustainTime: 0.01,
        releaseTime: 0.03,
        filterCutoff: 4000,
        filterResonance: 1,
        filterType: 'none',
        bitDepth: 16,
        sampleRateReduction: 1,
        masterVolume: 0.75,
      };

    case 'random':
    default: {
      const waveforms: WaveformType[] = ['square', 'sawtooth', 'triangle', 'sine', 'noise'];
      const chosenWaveform = waveforms[Math.floor(Math.random() * waveforms.length)];
      return {
        waveform: chosenWaveform,
        baseFrequency: Math.round(100 + Math.random() * 1200),
        frequencySlide: Number(((Math.random() * 1.6) - 0.8).toFixed(2)),
        vibratoDepth: Math.random() > 0.6 ? Number((Math.random() * 0.5).toFixed(2)) : 0,
        vibratoSpeed: Math.round(4 + Math.random() * 20),
        attackTime: Number((0.005 + Math.random() * 0.05).toFixed(3)),
        decayTime: Number((0.05 + Math.random() * 0.3).toFixed(2)),
        sustainLevel: Number((Math.random() * 0.6).toFixed(2)),
        sustainTime: Number((Math.random() * 0.25).toFixed(2)),
        releaseTime: Number((0.05 + Math.random() * 0.4).toFixed(2)),
        filterCutoff: Math.round(400 + Math.random() * 5000),
        filterResonance: Math.round(Math.random() * 10),
        filterType: Math.random() > 0.4 ? 'lowpass' : 'none',
        bitDepth: Math.random() > 0.7 ? 8 : 16,
        sampleRateReduction: Math.random() > 0.8 ? 2 : 1,
        masterVolume: 0.85,
      };
    }
  }
}

export function exportPresetToJson(params: SfxParams, name = 'garden_sfx_preset'): string {
  const payload = {
    version: '1.0',
    generator: 'Garden SFX Lab',
    presetName: name,
    exportedAt: new Date().toISOString(),
    params
  };
  return JSON.stringify(payload, null, 2);
}

export function parsePresetFromJson(jsonStr: string): SfxParams | null {
  try {
    const data = JSON.parse(jsonStr);
    const candidate = data.params || data;
    if (typeof candidate.baseFrequency === 'number' && typeof candidate.waveform === 'string') {
      return {
        ...DEFAULT_SFX_PARAMS,
        ...candidate
      };
    }
  } catch {}
  return null;
}
