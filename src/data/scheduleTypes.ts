import type { ExerciseDefinition, RoutineDay, RoutineDayId } from '../types';

export type { ExerciseDefinition, RoutineDay };

export interface WeeklyScheduleItem {
  dayShort: string;
  dayName: string;
  label: string;
  dayId?: RoutineDayId;
  isRest: boolean;
}
