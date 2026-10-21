export type WaveformType = 'square' | 'sawtooth' | 'triangle' | 'sine' | 'noise';

export type SfxPreset = 
  | 'laser' 
  | 'jump' 
  | 'explosion' 
  | 'coin' 
  | 'powerup' 
  | 'hit' 
  | 'blip' 
  | 'random';

export interface SfxParams {
  waveform: WaveformType;
  baseFrequency: number;     // Hz (ex: 440)
  frequencySlide: number;    // Sweep de frequência (-1.0 a 1.0)
  vibratoDepth: number;      // 0 a 1
  vibratoSpeed: number;      // Hz
  
  // ADSR Envelope
  attackTime: number;        // segundos
  decayTime: number;         // segundos
  sustainLevel: number;      // 0 a 1
  sustainTime: number;       // segundos
  releaseTime: number;       // segundos
  
  // Filtro
  filterCutoff: number;      // Hz (ex: 2000)
  filterResonance: number;   // Q factor (0 a 20)
  filterType: 'lowpass' | 'highpass' | 'none';
  
  // Bitcrusher / Lo-Fi
  bitDepth: number;          // 1 a 16
  sampleRateReduction: number; // 1 a 16
  masterVolume: number;      // 0 a 1
}

export interface SoundHistoryItem {
  id: string;
  name: string;
  preset: SfxPreset | 'custom';
  timestamp: number;
  params: SfxParams;
  duration: number;
}
