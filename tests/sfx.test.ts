import { describe, it, expect } from 'vitest';
import { generatePreset } from '../src/core/presets';
import { audioBufferToWav } from '../src/core/wav-exporter';
import { SfxPreset } from '../src/types';

describe('Garden SFX Lab - Presets & DSP Generator', () => {
  const allPresets: SfxPreset[] = [
    'laser',
    'jump',
    'explosion',
    'coin',
    'powerup',
    'hit',
    'blip',
    'random'
  ];

  it('should generate valid SfxParams for every preset', () => {
    allPresets.forEach((preset) => {
      const params = generatePreset(preset);
      expect(params).toBeDefined();
      expect(params.baseFrequency).toBeGreaterThan(0);
      expect(params.attackTime).toBeGreaterThanOrEqual(0);
      expect(params.decayTime).toBeGreaterThan(0);
      expect(params.masterVolume).toBeGreaterThan(0);
      expect(params.masterVolume).toBeLessThanOrEqual(1);
      expect(['square', 'sawtooth', 'triangle', 'sine', 'noise']).toContain(params.waveform);
    });
  });

  it('laser preset should produce downward frequency sweep', () => {
    const laser = generatePreset('laser');
    expect(laser.frequencySlide).toBeLessThan(0);
    expect(laser.baseFrequency).toBeGreaterThanOrEqual(600);
  });

  it('jump preset should produce upward frequency sweep', () => {
    const jump = generatePreset('jump');
    expect(jump.frequencySlide).toBeGreaterThan(0);
  });

  it('explosion preset should use noise waveform and lowpass filter', () => {
    const explosion = generatePreset('explosion');
    expect(explosion.waveform).toBe('noise');
    expect(explosion.filterType).toBe('lowpass');
  });
});

describe('Garden SFX Lab - WAV PCM Exporter', () => {
  // Mock AudioBuffer implementation for Vitest environment
  function createMockAudioBuffer(channels: number, length: number, sampleRate: number): AudioBuffer {
    const channelData: Float32Array[] = [];
    for (let c = 0; c < channels; c++) {
      const data = new Float32Array(length);
      for (let i = 0; i < length; i++) {
        data[i] = Math.sin((i / sampleRate) * 440 * 2 * Math.PI);
      }
      channelData.push(data);
    }

    return {
      numberOfChannels: channels,
      length,
      sampleRate,
      duration: length / sampleRate,
      getChannelData: (ch: number) => channelData[ch],
      copyFromChannel: () => {},
      copyToChannel: () => {},
    } as unknown as AudioBuffer;
  }

  it('should encode AudioBuffer to standard 16-bit PCM WAV', async () => {
    const sampleRate = 44100;
    const length = 1000;
    const mockBuffer = createMockAudioBuffer(1, length, sampleRate);

    const wavBlob = audioBufferToWav(mockBuffer, 16);
    expect(wavBlob).toBeDefined();
    expect(wavBlob.type).toBe('audio/wav');

    // Expected byte size: 44 bytes header + (1000 samples * 1 channel * 2 bytes/sample) = 2044 bytes
    expect(wavBlob.size).toBe(44 + 2000);

    const arrayBuffer = await wavBlob.arrayBuffer();
    const view = new DataView(arrayBuffer);

    // RIFF Header
    const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
    expect(riff).toBe('RIFF');

    // WAVE Header
    const wave = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
    expect(wave).toBe('WAVE');

    // fmt chunk
    const fmt = String.fromCharCode(view.getUint8(12), view.getUint8(13), view.getUint8(14), view.getUint8(15));
    expect(fmt).toBe('fmt ');

    // Audio format = 1 (PCM)
    expect(view.getUint16(20, true)).toBe(1);
    // Num channels = 1
    expect(view.getUint16(22, true)).toBe(1);
    // Sample rate = 44100
    expect(view.getUint32(24, true)).toBe(44100);
    // Bits per sample = 16
    expect(view.getUint16(34, true)).toBe(16);

    // data chunk
    const dataHeader = String.fromCharCode(view.getUint8(36), view.getUint8(37), view.getUint8(38), view.getUint8(39));
    expect(dataHeader).toBe('data');
    expect(view.getUint32(40, true)).toBe(2000);
  });
});
