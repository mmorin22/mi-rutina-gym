export type RoutineDayId = 'upper-a' | 'lower-a' | 'upper-b' | 'lower-b';

export type SvgPostureType =
  | 'bench-press'
  | 'lat-pulldown'
  | 'chest-supported-row'
  | 'cable-lateral-raise'
  | 'preacher-curl'
  | 'overhead-triceps'
  | 'hack-squat'
  | 'leg-press'
  | 'leg-extension'
  | 'seated-leg-curl'
  | 'standing-calf'
  | 'cable-crunch'
  | 'incline-press'
  | 'unilateral-row'
  | 'dips'
  | 'reverse-pec-deck'
  | 'hammer-curl'
  | 'triceps-pushdown'
  | 'rdl'
  | 'hip-thrust'
  | 'bulgarian-squat'
  | 'lying-leg-curl'
  | 'seated-calf'
  | 'hanging-leg-raise';

export interface ExerciseDefinition {
  id: string;
  dayId: RoutineDayId;
  order: number;
  name: string;
  defaultSets: number;
  repRange: string;
  minReps: number;
  maxReps: number;
  rir: string;
  unilateral?: string; // ej. "por lado" o "por pierna"
  note: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  imageUrls: string[];
  svgType: SvgPostureType;
  defaultRestSeconds: number;
}

export interface RoutineDay {
  id: RoutineDayId;
  code: string;
  title: string;
  subtitle: string;
  recommendedWeekday: string;
  accent: 'lime' | 'sky';
  exercises: ExerciseDefinition[];
}

export interface SetLog {
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface ExerciseSessionLog {
  exerciseId: string;
  sets: SetLog[];
}

export interface WorkoutSession {
  id: string;
  dayId: RoutineDayId;
  date: string; // ISO string
  durationMinutes?: number;
  notes?: string;
  exercises: ExerciseSessionLog[];
}

export interface ActiveSetDraft {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
}

export interface ActiveWorkoutDraft {
  dayId: RoutineDayId;
  startedAt: string;
  setsByExercise: Record<string, ActiveSetDraft[]>;
}

export interface AppSettings {
  defaultRestSeconds: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface OverloadStatus {
  isWeightPR: boolean;
  isRepsPR: boolean;
  isVolumePR: boolean;
  hasAnyImprovement: boolean;
  labels: string[];
}
