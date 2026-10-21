import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Download,
  Dices,
  RotateCcw,
  Sparkles,
  Zap,
  Flame,
  Coins,
  ShieldAlert,
  Radio,
  Music2,
  History,
  Trash2,
  FileAudio
} from 'lucide-react';
import { SfxParams, SfxPreset, WaveformType, SoundHistoryItem } from './types';
import { DEFAULT_SFX_PARAMS, generatePreset } from './core/presets';
import { getAudioContext, playSfx, renderSfxBuffer } from './core/sfx-synthesizer';
import { audioBufferToWav, downloadBlob } from './core/wav-exporter';
import { Oscilloscope } from './components/Oscilloscope';
import { ParamSlider } from './components/ParamSlider';

export const App: React.FC = () => {
  const [params, setParams] = useState<SfxParams>(DEFAULT_SFX_PARAMS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBuffer, setCurrentBuffer] = useState<AudioBuffer | null>(null);
  const [history, setHistory] = useState<SoundHistoryItem[]>([]);
  const [activePreset, setActivePreset] = useState<string>('laser');

  const analyserRef = useRef<AnalyserNode | null>(null);

  // Initialize analyser on first user interaction
  const getAnalyser = () => {
    if (!analyserRef.current) {
      const ctx = getAudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyserRef.current = analyser;
    }
    return analyserRef.current;
  };

  const handlePlay = async (sfxParams: SfxParams = params, soundName?: string, presetType?: SfxPreset) => {
    try {
      setIsPlaying(true);
      const analyser = getAnalyser();
      const buffer = await playSfx(sfxParams, analyser);
      setCurrentBuffer(buffer);

      // Add to history
      const totalDur = sfxParams.attackTime + sfxParams.decayTime + sfxParams.sustainTime + sfxParams.releaseTime;
      const historyItem: SoundHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        name: soundName || `${presetType || 'custom'}_${Math.floor(sfxParams.baseFrequency)}hz`,
        preset: presetType || 'custom',
        timestamp: Date.now(),
        params: { ...sfxParams },
        duration: totalDur,
      };

      setHistory((prev) => [historyItem, ...prev.slice(0, 19)]); // keep last 20

      // Reset playing flag after duration
      setTimeout(() => {
        setIsPlaying(false);
      }, totalDur * 1000 + 50);
    } catch (err) {
      console.error('Audio playback error:', err);
      setIsPlaying(false);
    }
  };

  const handleSelectPreset = (preset: SfxPreset) => {
    const newParams = generatePreset(preset);
    setParams(newParams);
    setActivePreset(preset);
    handlePlay(newParams, `${preset}_sfx`, preset);
  };

  const handleExportWav = async (targetParams: SfxParams = params, filename: string = 'garden_sfx') => {
    try {
      const buffer = currentBuffer || await renderSfxBuffer(targetParams);
      const wavBlob = audioBufferToWav(buffer, targetParams.bitDepth);
      downloadBlob(wavBlob, `${filename}_${Date.now()}.wav`);
    } catch (err) {
      console.error('Failed to export WAV:', err);
    }
  };

  // Pre-load default sound on start
  useEffect(() => {
    const initial = generatePreset('laser');
    setParams(initial);
    renderSfxBuffer(initial).then(setCurrentBuffer).catch(() => {});
  }, []);

  const updateParam = <K extends keyof SfxParams>(key: K, val: SfxParams[K]) => {
    setParams((prev) => ({ ...prev, [key]: val }));
  };

  const waveforms: WaveformType[] = ['square', 'sawtooth', 'triangle', 'sine', 'noise'];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans pb-12">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-zinc-900/90 backdrop-blur border-b border-zinc-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-xl shadow-lg shadow-emerald-950/40">
            🌿
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Garden SFX Lab
              <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Senior DSP
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Procedural 8-bit & Chiptune Audio Synthesizer (Web & Android)
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePlay(params)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition shadow-lg ${
              isPlaying
                ? 'bg-emerald-500 text-zinc-950 shadow-emerald-500/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            Play Sound
          </button>

          <button
            onClick={() => handleExportWav(params, activePreset)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 transition"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            Export .WAV
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Presets & Controls */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Quick Preset Buttons Grid */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-mono uppercase text-zinc-400 font-semibold tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Algorithmic Presets (1-Click Generator)
              </h2>
              <span className="text-[11px] text-zinc-500 font-mono">Tomas Pettersson SFXR Alg</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleSelectPreset('laser')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-emerald-500/50 text-left transition group"
              >
                <Zap className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                <div>
                  <div className="text-xs font-semibold text-zinc-200">Laser / Shoot</div>
                  <div className="text-[10px] text-zinc-500">Plasma sweep</div>
                </div>
              </button>

              <button
                onClick={() => handleSelectPreset('jump')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-cyan-500/50 text-left transition group"
              >
                <Music2 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
                <div>
                  <div className="text-xs font-semibold text-zinc-200">Jump</div>
                  <div className="text-[10px] text-zinc-500">Acrobatic slide</div>
                </div>
              </button>

              <button
                onClick={() => handleSelectPreset('explosion')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-red-500/50 text-left transition group"
              >
                <Flame className="w-4 h-4 text-red-400 group-hover:scale-110 transition" />
                <div>
                  <div className="text-xs font-semibold text-zinc-200">Explosion</div>
                  <div className="text-[10px] text-zinc-500">White noise boom</div>
                </div>
              </button>

              <button
                onClick={() => handleSelectPreset('coin')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-amber-500/50 text-left transition group"
              >
                <Coins className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
                <div>
                  <div className="text-xs font-semibold text-zinc-200">Coin / Pickup</div>
                  <div className="text-[10px] text-zinc-500">Dual-tone bell</div>
                </div>
              </button>

              <button
                onClick={() => handleSelectPreset('powerup')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-purple-500/50 text-left transition group"
              >
                <Sparkles className="w-4 h-4 text-purple-400 group-hover:scale-110 transition" />
                <div>
                  <div className="text-xs font-semibold text-zinc-200">Power-Up</div>
                  <div className="text-[10px] text-zinc-500">Ascending arpeggio</div>
                </div>
              </button>

              <button
                onClick={() => handleSelectPreset('hit')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-orange-500/50 text-left transition group"
              >
                <ShieldAlert className="w-4 h-4 text-orange-400 group-hover:scale-110 transition" />
                <div>
                  <div className="text-xs font-semibold text-zinc-200">Hit / Hurt</div>
                  <div className="text-[10px] text-zinc-500">Punch impact</div>
                </div>
              </button>

              <button
                onClick={() => handleSelectPreset('blip')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 hover:border-blue-500/50 text-left transition group"
              >
                <Radio className="w-4 h-4 text-blue-400 group-hover:scale-110 transition" />
                <div>
                  <div className="text-xs font-semibold text-zinc-200">Blip / Select</div>
                  <div className="text-[10px] text-zinc-500">UI feedback</div>
                </div>
              </button>

              <button
                onClick={() => handleSelectPreset('random')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 hover:from-emerald-900/60 hover:to-cyan-900/60 border border-emerald-500/40 text-left transition group"
              >
                <Dices className="w-4 h-4 text-emerald-300 group-hover:rotate-45 transition" />
                <div>
                  <div className="text-xs font-semibold text-emerald-200">Mutate / Random</div>
                  <div className="text-[10px] text-emerald-400/80">Cosmic discovery</div>
                </div>
              </button>
            </div>
          </div>

          {/* Oscilloscope Visualizer */}
          <Oscilloscope
            analyser={analyserRef.current}
            audioBuffer={currentBuffer}
            isPlaying={isPlaying}
          />

          {/* Synthesizer Parametric Controls */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md flex flex-col gap-5">
            {/* Waveform Selector */}
            <div>
              <label className="text-xs font-mono uppercase text-zinc-400 font-semibold tracking-wider block mb-2">
                1. Oscillator Waveform
              </label>
              <div className="grid grid-cols-5 gap-2">
                {waveforms.map((wave) => (
                  <button
                    key={wave}
                    onClick={() => updateParam('waveform', wave)}
                    className={`py-2 px-3 rounded-lg text-xs font-mono uppercase font-semibold capitalize border transition ${
                      params.waveform === wave
                        ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md shadow-emerald-950'
                        : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {wave}
                  </button>
                ))}
              </div>
            </div>

            {/* Pitch & Modulation Controls */}
            <div>
              <label className="text-xs font-mono uppercase text-zinc-400 font-semibold tracking-wider block mb-2">
                2. Pitch & Modulation
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ParamSlider
                  label="Base Frequency"
                  value={params.baseFrequency}
                  min={20}
                  max={2400}
                  step={10}
                  unit="Hz"
                  onChange={(v) => updateParam('baseFrequency', v)}
                />
                <ParamSlider
                  label="Frequency Sweep (Slide)"
                  value={params.frequencySlide}
                  min={-1.0}
                  max={1.0}
                  step={0.05}
                  onChange={(v) => updateParam('frequencySlide', v)}
                />
                <ParamSlider
                  label="Vibrato Depth"
                  value={params.vibratoDepth}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(v) => updateParam('vibratoDepth', v)}
                />
                <ParamSlider
                  label="Vibrato Speed"
                  value={params.vibratoSpeed}
                  min={0.5}
                  max={30}
                  step={0.5}
                  unit="Hz"
                  onChange={(v) => updateParam('vibratoSpeed', v)}
                />
              </div>
            </div>

            {/* Envelope ADSR */}
            <div>
              <label className="text-xs font-mono uppercase text-zinc-400 font-semibold tracking-wider block mb-2">
                3. Gain Envelope (ADSR)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <ParamSlider
                  label="Attack"
                  value={params.attackTime}
                  min={0.002}
                  max={0.5}
                  step={0.005}
                  unit="s"
                  onChange={(v) => updateParam('attackTime', v)}
                />
                <ParamSlider
                  label="Decay"
                  value={params.decayTime}
                  min={0.01}
                  max={1.0}
                  step={0.01}
                  unit="s"
                  onChange={(v) => updateParam('decayTime', v)}
                />
                <ParamSlider
                  label="Sustain Lv"
                  value={params.sustainLevel}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(v) => updateParam('sustainLevel', v)}
                />
                <ParamSlider
                  label="Sustain Tm"
                  value={params.sustainTime}
                  min={0.01}
                  max={1.5}
                  step={0.02}
                  unit="s"
                  onChange={(v) => updateParam('sustainTime', v)}
                />
                <ParamSlider
                  label="Release"
                  value={params.releaseTime}
                  min={0.01}
                  max={1.5}
                  step={0.02}
                  unit="s"
                  onChange={(v) => updateParam('releaseTime', v)}
                />
              </div>
            </div>

            {/* Filter & Lo-Fi Bitcrusher */}
            <div>
              <label className="text-xs font-mono uppercase text-zinc-400 font-semibold tracking-wider block mb-2">
                4. Filter & Bitcrusher (Chiptune Lo-Fi)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
                  <span className="text-xs font-medium text-zinc-300">Filter Mode</span>
                  <div className="grid grid-cols-3 gap-1 mt-1">
                    {(['none', 'lowpass', 'highpass'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => updateParam('filterType', mode)}
                        className={`text-[11px] font-mono py-1 rounded capitalize border transition ${
                          params.filterType === mode
                            ? 'bg-zinc-700 text-white border-zinc-500 font-semibold'
                            : 'bg-zinc-800/40 text-zinc-400 border-zinc-700/50 hover:bg-zinc-800'
                        }`}
                      >
                        {mode === 'none' ? 'Bypass' : mode.replace('pass', '')}
                      </button>
                    ))}
                  </div>
                </div>

                <ParamSlider
                  label="Filter Cutoff"
                  value={params.filterCutoff}
                  min={100}
                  max={8000}
                  step={50}
                  unit="Hz"
                  onChange={(v) => updateParam('filterCutoff', v)}
                />

                <ParamSlider
                  label="Bit Depth (Quantize)"
                  value={params.bitDepth}
                  min={2}
                  max={16}
                  step={1}
                  unit="bit"
                  onChange={(v) => updateParam('bitDepth', v)}
                />
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: History & GC Studio Integration */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* History Panel */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-md flex flex-col flex-1">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <h2 className="text-xs font-mono uppercase text-zinc-400 font-semibold tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-cyan-400" />
                Session History ({history.length})
              </h2>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-xs text-zinc-500 hover:text-red-400 transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                No sounds generated yet.
                <br />
                Click any preset button to generate retro SFX!
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[460px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-between gap-2 hover:border-zinc-600 transition"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <button
                        onClick={() => handlePlay(item.params, item.name, item.preset !== 'custom' ? item.preset : undefined)}
                        className="w-8 h-8 rounded-lg bg-zinc-700 hover:bg-emerald-600 text-zinc-200 hover:text-white flex items-center justify-center shrink-0 transition"
                        title="Play"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-zinc-200 truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {item.params.waveform} • {item.duration.toFixed(2)}s • {item.params.bitDepth}b
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setParams(item.params);
                          handlePlay(item.params);
                        }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 transition"
                        title="Restore Parameters"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleExportWav(item.params, item.name)}
                        className="p-1.5 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/50 transition"
                        title="Download .WAV"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GC Studio Ecosystem Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 text-xs">
            <h3 className="font-semibold text-zinc-200 flex items-center gap-1.5 mb-2">
              <FileAudio className="w-4 h-4 text-emerald-400" />
              GC Studio Integration
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              Exported WAV files are 100% standard uncompressed 16-bit PCM.
              Import directly into:
            </p>
            <ul className="mt-2 space-y-1 text-zinc-300 font-mono text-[11px]">
              <li>• <span className="text-emerald-400">GardenCut</span>: audio track fx</li>
              <li>• <span className="text-cyan-400">Garden StreamDeck</span>: soundboard trigger</li>
              <li>• <span className="text-purple-400">Godot / Unity / Phaser</span>: game audio</li>
            </ul>
          </div>

        </div>

      </main>
    </div>
  );
};

export default App;
