import React, { useEffect, useRef } from 'react';

interface OscilloscopeProps {
  analyser: AnalyserNode | null;
  audioBuffer: AudioBuffer | null;
  isPlaying: boolean;
}

export const Oscilloscope: React.FC<OscilloscopeProps> = ({ analyser, audioBuffer, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Dark background with subtle grid
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 30) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 20) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Center reference line
      ctx.strokeStyle = '#27272a';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (isPlaying && analyser) {
        // Real-time oscilloscope sweep
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#10b981'; // Neon Emerald
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#10b981';
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
        animId = requestAnimationFrame(render);
      } else if (audioBuffer) {
        // Render static waveform of current sound
        const data = audioBuffer.getChannelData(0);
        const step = Math.ceil(data.length / width);
        const amp = height / 2;

        ctx.lineWidth = 1.8;
        ctx.strokeStyle = '#06b6d4'; // Cyan
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#06b6d4';
        ctx.beginPath();

        for (let i = 0; i < width; i++) {
          let min = 1.0;
          let max = -1.0;
          for (let j = 0; j < step; j++) {
            const datum = data[i * step + j] || 0;
            if (datum < min) min = datum;
            if (datum > max) max = datum;
          }
          const yTop = amp + min * amp * 0.9;
          const yBottom = amp + max * amp * 0.9;

          ctx.moveTo(i, yTop);
          ctx.lineTo(i, yBottom);
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // Flat center line glow
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#3f3f46';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [analyser, audioBuffer, isPlaying]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 p-2 shadow-inner">
      <div className="flex justify-between items-center px-2 pb-1 text-xs font-mono text-zinc-500">
        <span>OSCILLOSCOPE / DSP BUFFER</span>
        <span>{isPlaying ? '● REALTIME ACTIVE' : audioBuffer ? '◆ BUFFER READY' : '○ IDLE'}</span>
      </div>
      <canvas
        ref={canvasRef}
        width={700}
        height={160}
        className="w-full h-32 md:h-40 rounded-lg block"
      />
    </div>
  );
};
