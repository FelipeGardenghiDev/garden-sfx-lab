import { SfxParams } from '../types';

let sharedAudioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedAudioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedAudioCtx = new AudioCtxClass();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

/**
 * Procedurally synthesizes an AudioBuffer from SfxParams using OfflineAudioContext.
 * 100% Client-side, free DSP.
 */
export async function renderSfxBuffer(params: SfxParams): Promise<AudioBuffer> {
  const attack = Math.max(0.002, params.attackTime);
  const decay = Math.max(0.005, params.decayTime);
  const sustainTime = Math.max(0.005, params.sustainTime);
  const release = Math.max(0.005, params.releaseTime);
  const totalDuration = Math.min(5.0, Math.max(0.05, attack + decay + sustainTime + release));

  const sampleRate = 44100;
  const numSamples = Math.ceil(sampleRate * totalDuration);
  const offlineCtx = new OfflineAudioContext(1, numSamples, sampleRate);

  // Envelope Gain Node (ADSR)
  const envGain = offlineCtx.createGain();
  const peakVolume = Math.max(0.0001, Math.min(1.0, params.masterVolume));
  const sustainVolume = Math.max(0.0001, peakVolume * Math.max(0.01, params.sustainLevel));

  envGain.gain.setValueAtTime(0.0001, 0);
  // Attack
  envGain.gain.linearRampToValueAtTime(peakVolume, attack);
  // Decay
  envGain.gain.linearRampToValueAtTime(sustainVolume, attack + decay);
  // Sustain
  envGain.gain.setValueAtTime(sustainVolume, attack + decay + sustainTime);
  // Release
  envGain.gain.exponentialRampToValueAtTime(0.0001, totalDuration);

  // Filter
  let lastNode: AudioNode = envGain;
  if (params.filterType !== 'none') {
    const filter = offlineCtx.createBiquadFilter();
    filter.type = params.filterType;
    filter.frequency.setValueAtTime(Math.max(20, Math.min(20000, params.filterCutoff)), 0);
    filter.Q.setValueAtTime(Math.max(0.1, params.filterResonance), 0);
    envGain.connect(filter);
    lastNode = filter;
  }
  lastNode.connect(offlineCtx.destination);

  // Generator Source (Oscillator or Noise)
  if (params.waveform === 'noise') {
    const noiseBuffer = offlineCtx.createBuffer(1, numSamples, sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < numSamples; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    const noiseSource = offlineCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.connect(envGain);
    noiseSource.start(0);
  } else {
    const osc = offlineCtx.createOscillator();
    osc.type = params.waveform;
    const baseFreq = Math.max(20, Math.min(8000, params.baseFrequency));
    osc.frequency.setValueAtTime(baseFreq, 0);

    // Frequency sweep / pitch slide
    if (params.frequencySlide !== 0) {
      const endFreq = Math.max(20, Math.min(8000, baseFreq * Math.pow(2, params.frequencySlide * 2.5)));
      osc.frequency.exponentialRampToValueAtTime(endFreq, totalDuration);
    }

    // Vibrato LFO
    if (params.vibratoDepth > 0) {
      const lfo = offlineCtx.createOscillator();
      lfo.frequency.setValueAtTime(Math.max(0.1, params.vibratoSpeed), 0);
      const lfoGain = offlineCtx.createGain();
      lfoGain.gain.setValueAtTime(params.vibratoDepth * baseFreq * 0.25, 0);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(0);
      lfo.stop(totalDuration);
    }

    osc.connect(envGain);
    osc.start(0);
    osc.stop(totalDuration);
  }

  const renderedBuffer = await offlineCtx.startRendering();

  // Lo-Fi sample rate reduction & bit depth quantization in-buffer
  if (params.sampleRateReduction > 1 || params.bitDepth < 16) {
    const data = renderedBuffer.getChannelData(0);
    const stepReduction = Math.max(1, Math.floor(params.sampleRateReduction));
    const quantSteps = Math.pow(2, Math.max(2, Math.min(16, params.bitDepth))) - 1;

    let holdSample = 0;
    for (let i = 0; i < data.length; i++) {
      if (i % stepReduction === 0) {
        let sample = data[i];
        if (params.bitDepth < 16) {
          sample = Math.round((sample * 0.5 + 0.5) * quantSteps) / quantSteps;
          sample = (sample - 0.5) * 2;
        }
        holdSample = sample;
      }
      data[i] = holdSample;
    }
  }

  return renderedBuffer;
}

/**
 * Plays the generated sound live and routes signal through analyser for the oscilloscope.
 */
export async function playSfx(
  params: SfxParams,
  analyser?: AnalyserNode
): Promise<AudioBuffer> {
  const ctx = getAudioContext();
  const buffer = await renderSfxBuffer(params);

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  if (analyser) {
    source.connect(analyser);
    analyser.connect(ctx.destination);
  } else {
    source.connect(ctx.destination);
  }

  source.start();
  return buffer;
}
