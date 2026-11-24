import React, { useEffect } from 'react';
import { FastForward, Flame, Minus, Plus, Timer } from 'lucide-react';

interface FloatingRestTimerProps {
  remainingSeconds: number;
  totalSeconds: number;
  isActive: boolean;
  exerciseName?: string;
  onAdjust: (deltaSeconds: number) => void;
  onSkip: () => void;
}

export const FloatingRestTimer: React.FC<FloatingRestTimerProps> = ({
  remainingSeconds,
  totalSeconds,
  isActive,
  exerciseName,
  onAdjust,
  onSkip,
}) => {
  useEffect(() => {
    // Nada adicional necesario aquí; el intervalo vive en App para no perderse al cambiar de pestaña
  }, [isActive]);

  if (!isActive) return null;

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const formatted = `${mins}:${secs.toString().padStart(2, '0')}`;
  const progressPct =
    totalSeconds > 0
      ? Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100))
      : 0;

  const isUrgent = remainingSeconds <= 15;

  return (
    <div className="fixed bottom-[76px] left-0 right-0 z-40 px-3 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-lime-400/35 shadow-[0_10px_35px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* Barra superior de progreso */}
        <div className="w-full h-1 bg-zinc-800">
          <div
            className={`h-full transition-all duration-500 ${
              isUrgent ? 'bg-amber-400' : 'bg-lime-400'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
          {/* Tiempo restante */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isUrgent
                  ? 'bg-amber-400/15 text-amber-300 animate-pulse'
                  : 'bg-lime-400/15 text-lime-400'
              }`}
            >
              {isUrgent ? <Flame className="w-5 h-5" /> : <Timer className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold tracking-tight tabular-nums text-zinc-50">
                  {formatted}
                </span>
                <span className="text-[11px] font-medium uppercase tracking-wider text-lime-400">
                  Descanso
                </span>
              </div>
              {exerciseName && (
                <p className="text-[11px] text-zinc-400 truncate max-w-[140px]">
                  {exerciseName}
                </p>
              )}
            </div>
          </div>

          {/* Controles rápidos con una mano: -30s / +30s / Saltar */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onAdjust(-30)}
              className="h-10 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-xs font-bold text-zinc-200 flex items-center gap-0.5 transition"
              aria-label="Restar 30 segundos"
            >
              <Minus className="w-3.5 h-3.5 text-zinc-400" />
              30s
            </button>

            <button
              type="button"
              onClick={() => onAdjust(30)}
              className="h-10 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-xs font-bold text-zinc-200 flex items-center gap-0.5 transition"
              aria-label="Sumar 30 segundos"
            >
              <Plus className="w-3.5 h-3.5 text-lime-400" />
              30s
            </button>

            <button
              type="button"
              onClick={onSkip}
              className="h-10 px-3 rounded-xl bg-lime-400 text-zinc-950 hover:bg-lime-300 active:scale-95 text-xs font-extrabold flex items-center gap-1 transition shadow-sm"
              aria-label="Saltar descanso"
            >
              Saltar
              <FastForward className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
