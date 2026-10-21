import React from 'react';

interface ParamSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
}

export const ParamSlider: React.FC<ParamSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 0.01,
  unit = '',
  onChange,
}) => {
  return (
    <div className="flex flex-col gap-1 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition">
      <div className="flex justify-between items-center text-xs">
        <span className="font-medium text-zinc-300">{label}</span>
        <span className="font-mono text-emerald-400 font-semibold">
          {typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(2)) : value}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
      />
    </div>
  );
};
