import type {
  ActiveSetDraft,
  OverloadStatus,
  SetLog,
  WorkoutSession,
} from '../types';

export interface PreviousExercisePerformance {
  sessionDate: string;
  sets: SetLog[];
  maxWeight: number;
  maxReps: number;
  totalVolume: number;
  bestSet: SetLog | null;
}

/**
 * Obtiene la última sesión registrada en la que se completó al menos 1 serie del ejercicio dado.
 */
export function getLastExercisePerformance(
  exerciseId: string,
  sessions: WorkoutSession[]
): PreviousExercisePerformance | null {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const session = sessions[i];
    const exLog = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!exLog) continue;

    const completedSets = exLog.sets.filter((s) => s.completed && s.reps > 0);
    if (completedSets.length === 0) continue;

    let maxWeight = 0;
    let maxReps = 0;
    let totalVolume = 0;
    let bestSet: SetLog | null = null;

    for (const s of completedSets) {
      const vol = s.weight * s.reps;
      totalVolume += vol;
      if (s.weight > maxWeight) maxWeight = s.weight;
      if (s.reps > maxReps) maxReps = s.reps;
      if (
        !bestSet ||
        s.weight > bestSet.weight ||
        (s.weight === bestSet.weight && s.reps > bestSet.reps)
      ) {
        bestSet = s;
      }
    }

    return {
      sessionDate: session.date,
      sets: completedSets,
      maxWeight,
      maxReps,
      totalVolume,
      bestSet,
    };
  }
  return null;
}

/**
 * Evalúa sobrecarga serie a serie comparando con la misma serie (o mejor serie) de la sesión anterior.
 */
export function evaluateSetOverload(
  setIndex: number,
  draftSet: ActiveSetDraft,
  prevPerf: PreviousExercisePerformance | null
): {
  improved: boolean;
  reason: 'peso' | 'reps' | 'volumen' | null;
  prevText: string;
} {
  const prevMatch =
    prevPerf?.sets[setIndex] ??
    prevPerf?.sets[prevPerf.sets.length - 1] ??
    null;

  const prevText = prevMatch
    ? `${formatKg(prevMatch.weight)}kg × ${prevMatch.reps}`
    : '—';

  if (!prevMatch) {
    return { improved: false, reason: null, prevText };
  }

  const w = parseFloat(draftSet.weight);
  const r = parseInt(draftSet.reps, 10);
  if (Number.isNaN(w) || Number.isNaN(r) || r <= 0) {
    return { improved: false, reason: null, prevText };
  }

  const prevVol = prevMatch.weight * prevMatch.reps;
  const currVol = w * r;

  if (w > prevMatch.weight) {
    return { improved: true, reason: 'peso', prevText };
  }
  if (w === prevMatch.weight && r > prevMatch.reps) {
    return { improved: true, reason: 'reps', prevText };
  }
  if (currVol > prevVol) {
    return { improved: true, reason: 'volumen', prevText };
  }

  return { improved: false, reason: null, prevText };
}

/**
 * Evalúa la sobrecarga global del ejercicio en la sesión activa frente a la sesión anterior:
 * Peso máximo, Repeticiones o Volumen total (Peso × Reps).
 */
export function evaluateExerciseOverload(
  draftSets: ActiveSetDraft[],
  prevPerf: PreviousExercisePerformance | null
): OverloadStatus {
  const empty: OverloadStatus = {
    isWeightPR: false,
    isRepsPR: false,
    isVolumePR: false,
    hasAnyImprovement: false,
    labels: [],
  };

  if (!prevPerf) return empty;

  const validSets = draftSets
    .map((s) => ({
      weight: parseFloat(s.weight),
      reps: parseInt(s.reps, 10),
      completed: s.completed,
    }))
    .filter(
      (s) =>
        s.completed &&
        !Number.isNaN(s.weight) &&
        !Number.isNaN(s.reps) &&
        s.reps > 0
    );

  if (validSets.length === 0) return empty;

  let currentMaxWeight = 0;
  let currentMaxRepsAtPrevBest = 0;
  let currentVolume = 0;

  for (const s of validSets) {
    currentVolume += s.weight * s.reps;
    if (s.weight > currentMaxWeight) currentMaxWeight = s.weight;
    if (s.weight >= prevPerf.maxWeight && s.reps > currentMaxRepsAtPrevBest) {
      currentMaxRepsAtPrevBest = s.reps;
    }
  }

  const isWeightPR = currentMaxWeight > prevPerf.maxWeight;
  const isRepsPR =
    !isWeightPR &&
    prevPerf.bestSet !== null &&
    currentMaxRepsAtPrevBest > prevPerf.bestSet.reps;
  const isVolumePR = currentVolume > prevPerf.totalVolume;

  const labels: string[] = [];
  if (isWeightPR) labels.push('+Peso');
  if (isRepsPR) labels.push('+Reps');
  if (isVolumePR) labels.push('+Volumen');

  return {
    isWeightPR,
    isRepsPR,
    isVolumePR,
    hasAnyImprovement: isWeightPR || isRepsPR || isVolumePR,
    labels,
  };
}

export interface ExerciseHistoryPoint {
  sessionId: string;
  date: string;
  shortDate: string;
  maxWeight: number;
  totalVolume: number;
  bestSetLabel: string;
  sets: SetLog[];
}

export function getExerciseProgressSeries(
  exerciseId: string,
  sessions: WorkoutSession[]
): ExerciseHistoryPoint[] {
  const points: ExerciseHistoryPoint[] = [];

  for (const session of sessions) {
    const ex = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex) continue;

    const completedSets = ex.sets.filter((s) => s.completed && s.reps > 0);
    if (completedSets.length === 0) continue;

    let maxWeight = 0;
    let totalVolume = 0;
    let bestSet = completedSets[0];

    for (const s of completedSets) {
      totalVolume += s.weight * s.reps;
      if (s.weight > maxWeight) maxWeight = s.weight;
      if (
        s.weight > bestSet.weight ||
        (s.weight === bestSet.weight && s.reps > bestSet.reps)
      ) {
        bestSet = s;
      }
    }

    const d = new Date(session.date);
    const shortDate = d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });

    points.push({
      sessionId: session.id,
      date: session.date,
      shortDate,
      maxWeight: Math.round(maxWeight * 100) / 100,
      totalVolume: Math.round(totalVolume),
      bestSetLabel: `${formatKg(bestSet.weight)}kg × ${bestSet.reps}`,
      sets: completedSets,
    });
  }

  return points;
}

export function formatKg(val: number): string {
  return Number.isInteger(val) ? String(val) : val.toFixed(1).replace(/\.0$/, '');
}
