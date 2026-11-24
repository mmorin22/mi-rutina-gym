import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  Award,
  CalendarDays,
  Dumbbell,
  Eye,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { ALL_EXERCISES, getDayById, ROUTINE_DAYS } from '../data/routine';
import type {
  ExerciseDefinition,
  RoutineDayId,
  WorkoutSession,
} from '../types';
import { formatKg, getExerciseProgressSeries } from '../utils/overload';

interface ProgressViewProps {
  sessions: WorkoutSession[];
  onDeleteSession: (sessionId: string) => void;
  onOpenExerciseInfo: (exercise: ExerciseDefinition) => void;
  onLoadDemoData: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  sessions,
  onDeleteSession,
  onOpenExerciseInfo,
  onLoadDemoData,
}) => {
  const [dayFilter, setDayFilter] = useState<RoutineDayId | 'all'>('all');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    ALL_EXERCISES[0].id
  );
  const [metric, setMetric] = useState<'maxWeight' | 'totalVolume'>('maxWeight');

  const filteredExercises = useMemo(() => {
    if (dayFilter === 'all') return ALL_EXERCISES;
    return ALL_EXERCISES.filter((ex) => ex.dayId === dayFilter);
  }, [dayFilter]);

  const activeExercise = useMemo(() => {
    const match = filteredExercises.find((e) => e.id === selectedExerciseId);
    return match ?? filteredExercises[0] ?? ALL_EXERCISES[0];
  }, [filteredExercises, selectedExerciseId]);

  const seriesData = useMemo(
    () => getExerciseProgressSeries(activeExercise.id, sessions),
    [activeExercise.id, sessions]
  );

  const summary = useMemo(() => {
    if (seriesData.length === 0) {
      return { bestWeight: 0, bestVolume: 0, deltaWeight: 0 };
    }
    const bestWeight = Math.max(...seriesData.map((p) => p.maxWeight));
    const bestVolume = Math.max(...seriesData.map((p) => p.totalVolume));
    const firstWeight = seriesData[0].maxWeight;
    const lastWeight = seriesData[seriesData.length - 1].maxWeight;
    return {
      bestWeight,
      bestVolume,
      deltaWeight: Math.round((lastWeight - firstWeight) * 100) / 100,
    };
  }, [seriesData]);

  // Historial cronológico general de entrenamientos (más reciente primero)
  const reversedSessions = useMemo(
    () => [...sessions].reverse(),
    [sessions]
  );

  return (
    <div className="space-y-4 pb-28">
      {/* Selector de Ejercicio por Día */}
      <section className="rounded-2xl bg-[#18181b] border border-zinc-800/90 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            Evolución por Ejercicio
          </h2>
          <button
            type="button"
            onClick={() => onOpenExerciseInfo(activeExercise)}
            className="text-xs font-bold text-sky-400 flex items-center gap-1 hover:underline"
          >
            <Eye className="w-3.5 h-3.5" />
            Ver técnica
          </button>
        </div>

        {/* Filtro rápido de día */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <button
            type="button"
            onClick={() => setDayFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
              dayFilter === 'all'
                ? 'bg-lime-400 text-zinc-950'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
            }`}
          >
            Todos (24)
          </button>
          {ROUTINE_DAYS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                setDayFilter(d.id);
                setSelectedExerciseId(d.exercises[0].id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                dayFilter === d.id
                  ? 'bg-lime-400 text-zinc-950'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
              }`}
            >
              {d.title}
            </button>
          ))}
        </div>

        {/* Select nativo accesible y cómo para pulgar en Android */}
        <div>
          <label htmlFor="exercise-select" className="sr-only">
            Seleccionar ejercicio
          </label>
          <select
            id="exercise-select"
            value={activeExercise.id}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="w-full h-12 px-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-bold text-zinc-100 focus:border-lime-400 outline-none"
          >
            {filteredExercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>

        {/* KPIs del ejercicio seleccionado */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-2.5">
            <div className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-1">
              <Award className="w-3 h-3 text-lime-400" />
              PR Peso
            </div>
            <div className="mt-1 text-base font-extrabold text-zinc-50 tabular-nums">
              {seriesData.length > 0 ? `${formatKg(summary.bestWeight)} kg` : '—'}
            </div>
          </div>

          <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-2.5">
            <div className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-1">
              <Dumbbell className="w-3 h-3 text-sky-400" />
              Máx Vol.
            </div>
            <div className="mt-1 text-base font-extrabold text-zinc-50 tabular-nums">
              {seriesData.length > 0 ? `${summary.bestVolume} kg` : '—'}
            </div>
          </div>

          <div className="rounded-xl bg-zinc-900/90 border border-zinc-800 p-2.5">
            <div className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-1">
              <Activity className="w-3 h-3 text-lime-400" />
              Progreso
            </div>
            <div
              className={`mt-1 text-base font-extrabold tabular-nums ${
                summary.deltaWeight > 0
                  ? 'text-lime-400'
                  : 'text-zinc-200'
              }`}
            >
              {seriesData.length > 1
                ? `${summary.deltaWeight >= 0 ? '+' : ''}${formatKg(
                    summary.deltaWeight
                  )} kg`
                : `${seriesData.length} ses.`}
            </div>
          </div>
        </div>
      </section>

      {/* Gráfica Recharts: Peso Máximo vs Volumen Total */}
      <section className="rounded-2xl bg-[#18181b] border border-zinc-800/90 p-4">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 w-full">
            <button
              type="button"
              onClick={() => setMetric('maxWeight')}
              className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition ${
                metric === 'maxWeight'
                  ? 'bg-lime-400 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Peso Máximo (kg)
            </button>
            <button
              type="button"
              onClick={() => setMetric('totalVolume')}
              className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition ${
                metric === 'totalVolume'
                  ? 'bg-sky-400 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Volumen Total (kg)
            </button>
          </div>
        </div>

        {seriesData.length === 0 ? (
          <div className="py-10 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-200">
                Aún no hay marcas para este ejercicio
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Completa y guarda tu primer entrenamiento o carga datos de
                ejemplo para explorar las gráficas.
              </p>
            </div>
            {sessions.length === 0 && (
              <button
                type="button"
                onClick={onLoadDemoData}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-lime-400 border border-lime-400/30 transition"
              >
                Cargar 3 semanas de ejemplo
              </button>
            )}
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={seriesData}
                margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={metric === 'maxWeight' ? '#a3e635' : '#38bdf8'}
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor={metric === 'maxWeight' ? '#a3e635' : '#38bdf8'}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                  vertical={false}
                />
                <XAxis
                  dataKey="shortDate"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090b',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fafafa',
                  }}
                  formatter={(value) => [
                    `${value} kg`,
                    metric === 'maxWeight' ? 'Peso Máximo' : 'Volumen Total',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey={metric}
                  stroke={metric === 'maxWeight' ? '#a3e635' : '#38bdf8'}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMetric)"
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Historial específico del ejercicio seleccionado */}
        {seriesData.length > 0 && (
          <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Marcas en {activeExercise.name}
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {[...seriesData].reverse().map((pt) => (
                <div
                  key={pt.sessionId}
                  className="rounded-xl bg-zinc-900/80 border border-zinc-800/80 px-3 py-2 flex items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="font-bold text-zinc-200">
                      {pt.shortDate}
                    </span>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      {pt.sets
                        .map((s) => `${formatKg(s.weight)}×${s.reps}`)
                        .join(' · ')}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-lime-400 tabular-nums">
                      {pt.bestSetLabel}
                    </div>
                    <div className="text-[10px] text-sky-400 tabular-nums">
                      Vol: {pt.totalVolume} kg
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Historial Cronológico Completo de Sesiones */}
      <section className="rounded-2xl bg-[#18181b] border border-zinc-800/90 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-sky-400" />
            Historial de Sesiones ({reversedSessions.length})
          </h3>
        </div>

        {reversedSessions.length === 0 ? (
          <p className="text-xs text-zinc-500 py-4 text-center">
            Tus sesiones terminadas aparecerán aquí ordenadas por fecha.
          </p>
        ) : (
          <div className="space-y-2.5">
            {reversedSessions.map((session) => {
              const dayInfo = getDayById(session.dayId);
              const totalSets = session.exercises.reduce(
                (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
                0
              );
              const sessionVolume = session.exercises.reduce(
                (acc, ex) =>
                  acc +
                  ex.sets
                    .filter((s) => s.completed)
                    .reduce((sum, s) => sum + s.weight * s.reps, 0),
                0
              );
              const formattedDate = new Date(session.date).toLocaleDateString(
                'es-ES',
                {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                }
              );

              return (
                <div
                  key={session.id}
                  className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-lime-400/15 text-lime-400 text-[10px] font-extrabold">
                        {dayInfo.title}
                      </span>
                      <span className="text-xs text-zinc-400 capitalize">
                        {formattedDate}
                      </span>
                    </div>
                    <div className="mt-1.5 text-xs text-zinc-300 font-medium tabular-nums">
                      {totalSets} series ·{' '}
                      <span className="text-sky-400 font-bold">
                        {Math.round(sessionVolume).toLocaleString('es-ES')} kg
                      </span>
                      {session.durationMinutes
                        ? ` · ${session.durationMinutes} min`
                        : ''}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteSession(session.id)}
                    className="w-9 h-9 rounded-xl bg-zinc-800/80 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 flex items-center justify-center shrink-0 transition"
                    aria-label="Eliminar sesión"
                    title="Eliminar sesión"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
