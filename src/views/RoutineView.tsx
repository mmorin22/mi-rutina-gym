import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  Play,
  Target,
} from 'lucide-react';
import { ROUTINE_DAYS, WEEKLY_SCHEDULE } from '../data/routine';
import type { ExerciseDefinition, RoutineDayId } from '../types';

interface RoutineViewProps {
  selectedDayId: RoutineDayId;
  onStartDay: (dayId: RoutineDayId) => void;
  onOpenExerciseInfo: (exercise: ExerciseDefinition) => void;
}

export const RoutineView: React.FC<RoutineViewProps> = ({
  selectedDayId,
  onStartDay,
  onOpenExerciseInfo,
}) => {
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({
    'upper-a': true,
    'lower-a': true,
    'upper-b': true,
    'lower-b': true,
  });

  const toggleDay = (id: string) => {
    setExpandedDays((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Distribución Semanal Recomendada */}
      <section className="rounded-2xl bg-[#18181b] border border-zinc-800/90 p-4">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-lime-400 mb-3">
          <Calendar className="w-4 h-4" />
          Distribución Semanal Recomendada (4 Días)
        </div>

        <div className="grid grid-cols-7 gap-1">
          {WEEKLY_SCHEDULE.map((item) => {
            const isActiveDay = item.dayId === selectedDayId;
            return (
              <button
                key={item.dayShort}
                type="button"
                disabled={item.isRest}
                onClick={() => item.dayId && onStartDay(item.dayId)}
                className={`rounded-xl py-2 px-1 text-center transition ${
                  item.isRest
                    ? 'bg-zinc-900/70 text-zinc-600 border border-zinc-800/50 cursor-default'
                    : isActiveDay
                      ? 'bg-lime-400 text-zinc-950 font-extrabold shadow-sm'
                      : 'bg-zinc-900 text-zinc-200 border border-zinc-800 hover:border-lime-400/50 active:scale-95'
                }`}
              >
                <div className="text-[10px] font-bold">{item.dayShort}</div>
                <div
                  className={`text-[9px] mt-1 leading-tight font-semibold truncate ${
                    item.isRest
                      ? 'text-zinc-600'
                      : isActiveDay
                        ? 'text-zinc-900'
                        : 'text-sky-400'
                  }`}
                >
                  {item.isRest ? 'Off' : item.label.replace(' ', '')}
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-[11px] text-zinc-400 leading-relaxed">
          Lunes (Upper A) · Martes (Lower A) · Miércoles (Descanso) · Jueves
          (Upper B) · Viernes (Lower B) · Sábado y Domingo (Descanso).
        </p>
      </section>

      {/* Los 4 Días de la Rutina con Notas Técnicas Exactas */}
      {ROUTINE_DAYS.map((day) => {
        const isExpanded = expandedDays[day.id] ?? true;

        return (
          <section
            key={day.id}
            className="rounded-2xl bg-[#18181b] border border-zinc-800/90 overflow-hidden"
          >
            {/* Cabecera del Día */}
            <div className="p-4 flex items-center justify-between gap-3 bg-zinc-900/40">
              <button
                type="button"
                onClick={() => toggleDay(day.id)}
                className="text-left flex-1 min-w-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                      day.accent === 'lime'
                        ? 'bg-lime-400/15 text-lime-400'
                        : 'bg-sky-400/15 text-sky-400'
                    }`}
                  >
                    {day.code} · {day.recommendedWeekday}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-semibold">
                    {day.exercises.length} ejercicios
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-zinc-50 mt-1">
                  {day.title}
                </h3>
                <p className="text-xs text-zinc-400 truncate">{day.subtitle}</p>
              </button>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onStartDay(day.id)}
                  className="h-9 px-3 rounded-xl bg-lime-400 hover:bg-lime-300 active:scale-95 text-zinc-950 text-xs font-extrabold flex items-center gap-1 transition"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Entrenar
                </button>
                <button
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className="w-9 h-9 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center"
                  aria-label={isExpanded ? 'Contraer día' : 'Expandir día'}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Ejercicios y Notas Técnicas */}
            {isExpanded && (
              <div className="divide-y divide-zinc-800/80 border-t border-zinc-800/80">
                {day.exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-3.5 hover:bg-zinc-900/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-extrabold text-lime-400">
                            {ex.order}.
                          </span>
                          <h4 className="text-sm font-bold text-zinc-100 leading-snug">
                            {ex.name}
                          </h4>
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-zinc-200">
                            {ex.defaultSets} series × {ex.repRange}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-400/10 border border-sky-400/25 text-[11px] font-bold text-sky-400">
                            <Target className="w-3 h-3" />
                            {ex.rir}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                          <strong className="text-zinc-300">Nota:</strong>{' '}
                          {ex.note}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenExerciseInfo(ex)}
                        className="w-10 h-10 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 active:scale-95 border border-zinc-700/70 flex items-center justify-center text-sky-400 shrink-0"
                        aria-label={`Ver ilustración de ${ex.name}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};
