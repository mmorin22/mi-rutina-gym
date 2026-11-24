import type {
  ActiveWorkoutDraft,
  AppSettings,
  RoutineDayId,
  WorkoutSession,
} from '../types';
import { ROUTINE_DAYS } from '../data/routine';

const SESSIONS_KEY = 'ironpulse_sessions_v1';
const DRAFT_KEY = 'ironpulse_active_draft_v1';
const SETTINGS_KEY = 'ironpulse_settings_v1';
const SELECTED_DAY_KEY = 'ironpulse_selected_day_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  defaultRestSeconds: 120, // 2:00 min por defecto como se solicitó
  soundEnabled: true,
  vibrationEnabled: true,
};

export interface BackupPayload {
  app: 'IronPulsePWA';
  version: 1;
  exportedAt: string;
  settings: AppSettings;
  sessions: WorkoutSession[];
}

export function loadSessions(): WorkoutSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.sort(
      (a: WorkoutSession, b: WorkoutSession) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  } catch {
    return [];
  }
}

export function saveSessions(sessions: WorkoutSession[]): void {
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sorted));
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSelectedDay(): RoutineDayId {
  const raw = localStorage.getItem(SELECTED_DAY_KEY);
  if (
    raw === 'upper-a' ||
    raw === 'lower-a' ||
    raw === 'upper-b' ||
    raw === 'lower-b'
  ) {
    return raw;
  }
  // Sugerir automáticamente según el día de la semana actual si no hay selección previa
  const jsDay = new Date().getDay(); // 0 Dom, 1 Lun, 2 Mar, 3 Mié, 4 Jue, 5 Vie, 6 Sáb
  if (jsDay === 2) return 'lower-a';
  if (jsDay === 4) return 'upper-b';
  if (jsDay === 5) return 'lower-b';
  return 'upper-a';
}

export function saveSelectedDay(dayId: RoutineDayId): void {
  localStorage.setItem(SELECTED_DAY_KEY, dayId);
}

export function loadDraft(dayId: RoutineDayId): ActiveWorkoutDraft | null {
  try {
    const raw = localStorage.getItem(`${DRAFT_KEY}_${dayId}`);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveWorkoutDraft;
  } catch {
    return null;
  }
}

export function saveDraft(draft: ActiveWorkoutDraft): void {
  localStorage.setItem(`${DRAFT_KEY}_${draft.dayId}`, JSON.stringify(draft));
}

export function clearDraft(dayId: RoutineDayId): void {
  localStorage.removeItem(`${DRAFT_KEY}_${dayId}`);
}

export function createBackupJson(
  sessions: WorkoutSession[],
  settings: AppSettings
): string {
  const payload: BackupPayload = {
    app: 'IronPulsePWA',
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    sessions,
  };
  return JSON.stringify(payload, null, 2);
}

export function parseBackupJson(rawText: string): {
  sessions: WorkoutSession[];
  settings?: AppSettings;
} {
  const data = JSON.parse(rawText);

  // Soporta tanto objeto BackupPayload como array directo de sesiones
  const rawSessions: unknown[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.sessions)
      ? data.sessions
      : (() => {
          throw new Error('Formato JSON no válido: no se encontró lista de sesiones.');
        })();

  const validated: WorkoutSession[] = rawSessions.map((item, idx) => {
    const s = item as Partial<WorkoutSession>;
    if (!s.dayId || !s.date || !Array.isArray(s.exercises)) {
      throw new Error(`Sesión inválida en la posición ${idx + 1}.`);
    }
    return {
      id: s.id ?? `imported-${Date.now()}-${idx}`,
      dayId: s.dayId,
      date: s.date,
      durationMinutes: s.durationMinutes,
      notes: s.notes,
      exercises: s.exercises,
    };
  });

  return {
    sessions: validated,
    settings: data?.settings ? { ...DEFAULT_SETTINGS, ...data.settings } : undefined,
  };
}

/**
 * Genera 8 sesiones de demostración (2 semanas completas de los 4 días con sobrecarga real)
 * opcionales desde Ajustes para visualizar gráficas y marcas previas al instante.
 */
export function generateDemoSessions(): WorkoutSession[] {
  const now = Date.now();
  const dayMs = 86_400_000;

  const baseWeights: Record<string, number> = {
    'ua-bench-press': 75,
    'ua-lat-pulldown': 60,
    'ua-chest-supported-row': 55,
    'ua-cable-lateral-raise': 10,
    'ua-preacher-curl': 27.5,
    'ua-overhead-triceps': 25,
    'la-hack-squat': 100,
    'la-leg-press': 160,
    'la-leg-extension': 55,
    'la-seated-leg-curl': 50,
    'la-standing-calf-raise': 70,
    'la-cable-crunch': 35,
    'ub-incline-press': 65,
    'ub-unilateral-row': 30,
    'ub-dips': 15,
    'ub-reverse-pec-deck': 40,
    'ub-hammer-curl': 16,
    'ub-triceps-pushdown': 30,
    'lb-rdl': 90,
    'lb-hip-thrust': 120,
    'lb-bulgarian-squat': 20,
    'lb-lying-leg-curl': 45,
    'lb-seated-calf-raise': 50,
    'lb-hanging-leg-raise': 0,
  };

  const demoSessions: WorkoutSession[] = [];
  // 3 microciclos atrás hasta hace 2 días
  const offsets = [21, 20, 18, 17, 14, 13, 11, 10, 7, 6, 4, 3];

  offsets.forEach((daysAgo, index) => {
    const routineIndex = index % 4;
    const weekNumber = Math.floor(index / 4); // 0, 1, 2
    const day = ROUTINE_DAYS[routineIndex];
    const dateIso = new Date(now - daysAgo * dayMs).toISOString();

    demoSessions.push({
      id: `demo-${day.id}-w${weekNumber}`,
      dayId: day.id,
      date: dateIso,
      durationMinutes: 58 + (index % 9),
      exercises: day.exercises.map((ex) => {
        const startWeight = baseWeights[ex.id] ?? 30;
        const weightStep = startWeight >= 60 ? 2.5 : startWeight > 0 ? 1.25 : 0;
        const sessionWeight = startWeight + weekNumber * weightStep;
        const baseReps = ex.minReps + Math.min(weekNumber, 2);

        return {
          exerciseId: ex.id,
          sets: [1, 2, 3].map((setNum) => ({
            setNumber: setNum,
            weight: sessionWeight,
            reps: Math.max(ex.minReps, baseReps - (setNum === 3 ? 1 : 0)),
            completed: true,
          })),
        };
      }),
    });
  });

  return demoSessions;
}
