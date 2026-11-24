import React, { useMemo } from 'react';
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  Eye,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { ROUTINE_DAYS } from '../data/routine';
import type {
  ActiveSetDraft,
  ExerciseDefinition,
  RoutineDayId,
  WorkoutSession,
} from '../types';
import {
  evaluateExerciseOverload,
  evaluateSetOverload,
  formatKg,
  getLastExercisePerformance,
} from '../utils/overload';

interface WorkoutViewProps {
  selectedDayId: RoutineDayId;
  onSelectDay: (dayId: RoutineDayId) => void;
  setsByExercise: Record<string, ActiveSetDraft[]>;
  sessions: WorkoutSession[];
  onUpdateSet: (
    exerciseId: string,
    setIndex: number,
    patch: Partial<ActiveSetDraft>,
    exerciseName: string
  ) => void;
  onAddSet: (exerciseId: string) => void;
  onRemoveSet: (exerciseId: string) => void;
  onResetDayDraft: () => void;
  onFinishWorkout: () => void;
  onOpenExerciseInfo: (exercise: ExerciseDefinition) => void;
}

export const WorkoutView: React.FC<WorkoutViewProps> = ({
  selectedDayId,
  onSelectDay,
  setsByExercise,
  sessions,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onResetDayDraft,
  onFinishWorkout,
  onOpenExerciseInfo,
}) => {
  const activeDay = useMemo(
    () => ROUTINE_DAYS.find((d) => d.id === selectedDayId) ?? ROUTINE_DAYS[0],
    [selectedDayId]
  );

  // Mapa rápido de rendimiento previo para cada ejercicio del día activo
  const prevPerfMap = useMemo(() => {
    const map: Record<
      string,
      ReturnType<typeof getLastExercisePerformance>
    > = {};
    for (const ex of activeDay.exercises) {
      map[ex.id] = getLastExercisePerformance(ex.id, sessions);
    }
    return map;
  }, [activeDay, sessions]);

  // Estadísticas en vivo de la sesión actual
  const liveStats = useMemo(() => {
    let totalSets = 0;
    let completedSets = 0;
    let totalVolume = 0;
    let prExercises = 0;

    for (const ex of activeDay.exercises) {
      const drafts = setsByExercise[ex.id] ?? [];
      totalSets += drafts.length;
      for (const s of drafts) {
        if (s.completed) {
          completedSets += 1;
          const w = parseFloat(s.weight);
          const r = parseInt(s.reps, 10);
          if (!Number.isNaN(w) && !Number.isNaN(r) && r > 0) {
            totalVolume += w * r;
          }
        }
      }
      const overload = evaluateExerciseOverload(drafts, prevPerfMap[ex.id] ?? null);
      if (overload.hasAnyImprovement) prExercises += 1;
    }

    return { totalSets, completedSets, totalVolume, prExercises };
  }, [activeDay, setsByExercise, prevPerfMap]);

  const progressPct =
    liveStats.totalSets > 0
      ? Math.round((liveStats.completedSets / liveStats.totalSets) * 100)
      : 0;

  return (
    <div className="space-y-4 pb-36">
      {/* Selector de los 4 días de rutina */}
      <section aria-label="Selector de día de rutina">
        <div className="grid grid-cols-4 gap-1.5 bg-[#18181b] p-1.5 rounded-2xl border border-zinc-800/90">
          {ROUTINE_DAYS.map((day) => {
            const isSelected = day.id === selectedDayId;
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => onSelectDay(day.id)}
                className={`py-2.5 px-1.5 rounded-xl text-center transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-lime-400 text-zinc-950 shadow-[0_0_20px_rgba(163,230,53,0.28)]'
                    : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <div
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    isSelected ? 'text-zinc-900/80' : 'text-zinc-500'
                  }`}
                >
                  {day.recommendedWeekday.slice(0, 3)}
                </div>
                <div className="text-xs font-extrabold tracking-tight mt-0.5">
                  {day.title}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Cabecera del día activo + barra de progreso en tiempo real */}
      <section className="rounded-2xl bg-[#18181b] border border-zinc-800/90 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-lime-400">
                {activeDay.code} · {activeDay.recommendedWeekday}
              </span>
              {liveStats.prExercises > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-lime-400/15 text-lime-300 border border-lime-400/30">
                  <Trophy className="w-3 h-3" />
                  {liveStats.prExercises} PR hoy
                </span>
              )}
            </div>
            <h2 className="text-lg font-extrabold text-zinc-50 mt-0.5">
              {activeDay.title}
            </h2>
            <p className="text-xs text-zinc-400">{activeDay.subtitle}</p>
          </div>

          {liveStats.completedSets > 0 && (
            <button
              type="button"
              onClick={onResetDayDraft}
              className="h-9 px-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold flex items-center gap-1 active:scale-95 transition"
              title="Reiniciar borrador actual"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>

        {/* Barra de progreso de series */}
        <div className="mt-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">
              Series:{' '}
              <strong className="text-zinc-100 font-bold">
                {liveStats.completedSets}/{liveStats.totalSets}
              </strong>{' '}
              ({progressPct}%)
            </span>
            <span className="text-zinc-400 font-medium">
              Volumen:{' '}
              <strong className="text-sky-400 font-bold tabular-nums">
                {Math.round(liveStats.totalVolume).toLocaleString('es-ES')} kg
              </strong>
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-lime-400 to-sky-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </section>

      {/* Lista de Ejercicios del Día */}
      <div className="space-y-3.5">
        {activeDay.exercises.map((exercise) => {
          const drafts = setsByExercise[exercise.id] ?? [];
          const prevPerf = prevPerfMap[exercise.id] ?? null;
          const exOverload = evaluateExerciseOverload(drafts, prevPerf);
          const allDone =
            drafts.length > 0 && drafts.every((s) => s.completed);

          return (
            <article
              key={exercise.id}
              className={`rounded-2xl bg-[#18181b] border transition-colors overflow-hidden ${
                exOverload.hasAnyImprovement
                  ? 'border-lime-400/45 shadow-[0_0_24px_rgba(163,230,53,0.07)]'
                  : allDone
                    ? 'border-zinc-700'
                    : 'border-zinc-800/90'
              }`}
            >
              {/* Cabecera del Ejercicio */}
              <div className="p-3.5 pb-2.5 flex items-start justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-zinc-800 text-[11px] font-extrabold text-lime-400">
                      {exercise.order}
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-400">
                      {exercise.defaultSets} × {exercise.repRange}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800/90 text-sky-400">
                      {exercise.rir}
                    </span>

                    {/* Insignia de Sobrecarga Progresiva */}
                    {exOverload.hasAnyImprovement && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-lime-400 text-zinc-950 animate-pulse">
                        <ArrowUpRight className="w-3 h-3 stroke-[3]" />
                        PR {exOverload.labels.join(' · ')}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenExerciseInfo(exercise)}
                    className="text-left group"
                  >
                    <h3 className="text-[15px] font-bold text-zinc-100 leading-snug group-active:text-lime-400 transition-colors">
                      {exercise.name}
                    </h3>
                  </button>
                </div>

                {/* Botón de Ilustración y Técnica (Icono Ojo) */}
                <button
                  type="button"
                  onClick={() => onOpenExerciseInfo(exercise)}
                  className="w-10 h-10 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 active:scale-95 border border-zinc-700/70 flex items-center justify-center text-sky-400 shrink-0 transition"
                  aria-label={`Ver ilustración y técnica de ${exercise.name}`}
                  title="Ver ilustración y técnica"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>

              {/* Cabecera de columnas de la tabla de series */}
              <div className="px-3 pt-1 pb-1.5 grid grid-cols-[26px_1fr_68px_60px_44px] gap-1.5 items-center text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                <span className="text-center">#</span>
                <span>Anterior</span>
                <span className="text-center">Peso kg</span>
                <span className="text-center">Reps</span>
                <span className="text-center">OK</span>
              </div>

              {/* Filas de series */}
              <div className="px-3 pb-2.5 space-y-2">
                {drafts.map((setItem, idx) => {
                  const setEval = evaluateSetOverload(idx, setItem, prevPerf);
                  const prevMatch =
                    prevPerf?.sets[idx] ??
                    prevPerf?.sets[prevPerf.sets.length - 1] ??
                    null;

                  const handlePrefillFromPrev = () => {
                    if (!prevMatch || setItem.completed) return;
                    onUpdateSet(
                      exercise.id,
                      idx,
                      {
                        weight:
                          setItem.weight === ''
                            ? String(prevMatch.weight)
                            : setItem.weight,
                        reps:
                          setItem.reps === ''
                            ? String(prevMatch.reps)
                            : setItem.reps,
                      },
                      exercise.name
                    );
                  };

                  return (
                    <div
                      key={setItem.id}
                      className={`grid grid-cols-[26px_1fr_68px_60px_44px] gap-1.5 items-center rounded-xl py-1 px-1 transition-colors ${
                        setItem.completed
                          ? 'bg-lime-400/10 border border-lime-400/25'
                          : 'bg-zinc-900/60 border border-transparent'
                      }`}
                    >
                      {/* Número de serie */}
                      <div
                        className={`text-xs font-extrabold text-center tabular-nums ${
                          setItem.completed ? 'text-lime-400' : 'text-zinc-400'
                        }`}
                      >
                        {idx + 1}
                      </div>

                      {/* Marca Anterior + Indicador visual si supera */}
                      <button
                        type="button"
                        onClick={handlePrefillFromPrev}
                        disabled={!prevMatch || setItem.completed}
                        className="text-left min-w-0 py-1.5 px-1.5 rounded-lg hover:bg-zinc-800/70 active:scale-[0.98] transition disabled:cursor-default"
                        title={
                          prevMatch
                            ? 'Toca para autocompletar con la marca anterior'
                            : 'Sin registro previo'
                        }
                      >
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-xs font-semibold text-zinc-300 tabular-nums truncate">
                            {setEval.prevText}
                          </span>
                          {setEval.improved && (
                            <span
                              className="inline-flex items-center text-lime-400 shrink-0"
                              title={`Supera ${setEval.reason} anterior`}
                            >
                              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.75]" />
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Input Peso (kg) amplio para una mano */}
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.5"
                        min="0"
                        placeholder={
                          prevMatch ? formatKg(prevMatch.weight) : 'kg'
                        }
                        value={setItem.weight}
                        onChange={(e) =>
                          onUpdateSet(
                            exercise.id,
                            idx,
                            { weight: e.target.value },
                            exercise.name
                          )
                        }
                        aria-label={`${exercise.name} serie ${idx + 1} peso en kg`}
                        className={`w-full h-11 rounded-xl text-center text-base font-extrabold tabular-nums outline-none transition border ${
                          setItem.completed
                            ? 'bg-zinc-900/90 border-lime-400/40 text-lime-300'
                            : 'bg-zinc-950 border-zinc-800 focus:border-lime-400 text-zinc-50 placeholder:text-zinc-600'
                        }`}
                      />

                      {/* Input Reps amplio para una mano */}
                      <input
                        type="number"
                        inputMode="numeric"
                        step="1"
                        min="0"
                        placeholder={
                          prevMatch ? String(prevMatch.reps) : String(exercise.minReps)
                        }
                        value={setItem.reps}
                        onChange={(e) =>
                          onUpdateSet(
                            exercise.id,
                            idx,
                            { reps: e.target.value },
                            exercise.name
                          )
                        }
                        aria-label={`${exercise.name} serie ${idx + 1} repeticiones`}
                        className={`w-full h-11 rounded-xl text-center text-base font-extrabold tabular-nums outline-none transition border ${
                          setItem.completed
                            ? 'bg-zinc-900/90 border-lime-400/40 text-lime-300'
                            : 'bg-zinc-950 border-zinc-800 focus:border-sky-400 text-zinc-50 placeholder:text-zinc-600'
                        }`}
                      />

                      {/* Botón Checkbox grande (44x44px) */}
                      <button
                        type="button"
                        onClick={() => {
                          const nextCompleted = !setItem.completed;
                          // Si pulsa completar con los inputs vacíos pero hay marca anterior, autocompletar inteligentemente
                          const fallbackWeight =
                            setItem.weight === '' && prevMatch
                              ? String(prevMatch.weight)
                              : setItem.weight === ''
                                ? '0'
                                : setItem.weight;
                          const fallbackReps =
                            setItem.reps === '' && prevMatch
                              ? String(prevMatch.reps)
                              : setItem.reps === ''
                                ? String(exercise.minReps)
                                : setItem.reps;

                          onUpdateSet(
                            exercise.id,
                            idx,
                            nextCompleted
                              ? {
                                  completed: true,
                                  weight: fallbackWeight,
                                  reps: fallbackReps,
                                }
                              : { completed: false },
                            exercise.name
                          );
                        }}
                        aria-label={`Marcar serie ${idx + 1} como ${
                          setItem.completed ? 'pendiente' : 'completada'
                        }`}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                          setItem.completed
                            ? 'bg-lime-400 text-zinc-950 shadow-[0_0_15px_rgba(163,230,53,0.4)]'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 border border-zinc-700/80'
                        }`}
                      >
                        <Check
                          className={`w-5 h-5 ${
                            setItem.completed ? 'stroke-[3]' : 'stroke-[2.2]'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Pie de tarjeta: Añadir / Quitar serie extra */}
              <div className="px-3.5 py-2.5 bg-zinc-900/50 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onAddSet(exercise.id)}
                    className="h-8 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-xs font-bold text-zinc-200 flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5 text-lime-400" />
                    Serie extra
                  </button>

                  {drafts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveSet(exercise.id)}
                      className="h-8 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-xs font-semibold text-zinc-400 flex items-center gap-1 border border-zinc-800 transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      Quitar
                    </button>
                  )}
                </div>

                {prevPerf && (
                  <span className="text-[11px] text-zinc-500 tabular-nums">
                    Vol. ant: {Math.round(prevPerf.totalVolume)} kg
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Botón Final: Terminar Entrenamiento */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onFinishWorkout}
          disabled={liveStats.completedSets === 0}
          className={`w-full h-14 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] ${
            liveStats.completedSets > 0
              ? 'bg-lime-400 hover:bg-lime-300 text-zinc-950 shadow-[0_8px_30px_rgba(163,230,53,0.3)]'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/60'
          }`}
        >
          {liveStats.completedSets > 0 ? (
            <>
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              Terminar Entrenamiento ({liveStats.completedSets} series)
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Completa al menos 1 serie para guardar
            </>
          )}
        </button>
      </div>
    </div>
  );
};
