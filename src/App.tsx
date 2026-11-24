import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  Settings,
  WifiOff,
} from 'lucide-react';
import { getDayById } from './data/routine';
import type {
  ActiveSetDraft,
  AppSettings,
  ExerciseDefinition,
  RoutineDayId,
  WorkoutSession,
} from './types';
import {
  clearDraft,
  generateDemoSessions,
  loadDraft,
  loadSelectedDay,
  loadSessions,
  loadSettings,
  saveDraft,
  saveSelectedDay,
  saveSessions,
  saveSettings,
} from './utils/storage';
import { WorkoutView } from './views/WorkoutView';
import { RoutineView } from './views/RoutineView';
import { FloatingRestTimer } from './components/FloatingRestTimer';
import { ExerciseDetailModal } from './components/ExerciseDetailModal';
import { SettingsModal } from './components/SettingsModal';

const ProgressView = lazy(() =>
  import('./views/ProgressView').then((m) => ({ default: m.ProgressView }))
);

type ActiveTab = 'workout' | 'routine' | 'progress';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function createInitialSetsForDay(dayId: RoutineDayId): Record<string, ActiveSetDraft[]> {
  const day = getDayById(dayId);
  const map: Record<string, ActiveSetDraft[]> = {};
  for (const ex of day.exercises) {
    map[ex.id] = Array.from({ length: ex.defaultSets }, (_, idx) => ({
      id: `${ex.id}-s${idx + 1}-${Date.now()}`,
      weight: '',
      reps: '',
      completed: false,
    }));
  }
  return map;
}

function playFinishBeep() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [880, 1174.66];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.16);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + i * 0.16 + 0.15
      );
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.16);
      osc.stop(ctx.currentTime + i * 0.16 + 0.16);
    });
  } catch {
    // Ignorar si el navegador bloquea Web Audio
  }
}

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('workout');
  const [selectedDayId, setSelectedDayId] = useState<RoutineDayId>(() =>
    loadSelectedDay()
  );
  const [sessions, setSessions] = useState<WorkoutSession[]>(() =>
    loadSessions()
  );
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  // Estado del borrador del entrenamiento activo
  const [startedAt, setStartedAt] = useState<string>(() => {
    const draft = loadDraft(loadSelectedDay());
    return draft?.startedAt ?? new Date().toISOString();
  });
  const [setsByExercise, setSetsByExercise] = useState<
    Record<string, ActiveSetDraft[]>
  >(() => {
    const initialDay = loadSelectedDay();
    const draft = loadDraft(initialDay);
    return draft?.setsByExercise ?? createInitialSetsForDay(initialDay);
  });

  // Modales y notificaciones
  const [modalExercise, setModalExercise] =
    useState<ExerciseDefinition | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  // Temporizador de descanso flotante (basado en timestamp real para que no se congele con pantalla bloqueada en Android)
  const [restState, setRestState] = useState<{
    isActive: boolean;
    endTimeMs: number;
    totalSeconds: number;
    remainingSeconds: number;
    exerciseName?: string;
  }>({
    isActive: false,
    endTimeMs: 0,
    totalSeconds: 120,
    remainingSeconds: 0,
  });

  // Detectar conexión offline/online y evento de instalación PWA Android
  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
    };
  }, []);

  // Guardar borrador cada vez que cambian las series del día activo
  useEffect(() => {
    saveDraft({
      dayId: selectedDayId,
      startedAt,
      setsByExercise,
    });
  }, [selectedDayId, startedAt, setsByExercise]);

  // Reloj del temporizador flotante resistente a bloqueo de pantalla
  useEffect(() => {
    if (!restState.isActive) return;

    const tick = () => {
      const diffSec = Math.max(
        0,
        Math.ceil((restState.endTimeMs - Date.now()) / 1000)
      );
      if (diffSec <= 0) {
        if (settings.soundEnabled) playFinishBeep();
        if (settings.vibrationEnabled && 'vibrate' in navigator) {
          navigator.vibrate([200, 100, 250]);
        }
        setRestState((prev) => ({
          ...prev,
          isActive: false,
          remainingSeconds: 0,
        }));
      } else {
        setRestState((prev) =>
          prev.remainingSeconds === diffSec
            ? prev
            : { ...prev, remainingSeconds: diffSec }
        );
      }
    };

    tick();
    const id = window.setInterval(tick, 300);
    return () => window.clearInterval(id);
  }, [
    restState.isActive,
    restState.endTimeMs,
    settings.soundEnabled,
    settings.vibrationEnabled,
  ]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3200);
  }, []);

  const handleSelectDay = (dayId: RoutineDayId) => {
    setSelectedDayId(dayId);
    saveSelectedDay(dayId);
    const savedDraft = loadDraft(dayId);
    if (savedDraft) {
      setStartedAt(savedDraft.startedAt);
      setSetsByExercise(savedDraft.setsByExercise);
    } else {
      setStartedAt(new Date().toISOString());
      setSetsByExercise(createInitialSetsForDay(dayId));
    }
  };

  const startRestTimer = (exerciseName: string) => {
    const duration = settings.defaultRestSeconds;
    setRestState({
      isActive: true,
      totalSeconds: duration,
      remainingSeconds: duration,
      endTimeMs: Date.now() + duration * 1000,
      exerciseName,
    });
  };

  const handleUpdateSet = (
    exerciseId: string,
    setIndex: number,
    patch: Partial<ActiveSetDraft>,
    exerciseName: string
  ) => {
    setSetsByExercise((prev) => {
      const list = [...(prev[exerciseId] ?? [])];
      const current = list[setIndex];
      if (!current) return prev;
      const wasCompleted = current.completed;
      const updated = { ...current, ...patch };
      list[setIndex] = updated;

      if (!wasCompleted && updated.completed) {
        if (settings.vibrationEnabled && 'vibrate' in navigator) {
          navigator.vibrate(35);
        }
        startRestTimer(exerciseName);
      }

      return { ...prev, [exerciseId]: list };
    });
  };

  const handleAddSet = (exerciseId: string) => {
    setSetsByExercise((prev) => {
      const list = prev[exerciseId] ?? [];
      const last = list[list.length - 1];
      const nextSet: ActiveSetDraft = {
        id: `${exerciseId}-extra-${Date.now()}`,
        weight: last?.weight ?? '',
        reps: last?.reps ?? '',
        completed: false,
      };
      return { ...prev, [exerciseId]: [...list, nextSet] };
    });
  };

  const handleRemoveSet = (exerciseId: string) => {
    setSetsByExercise((prev) => {
      const list = prev[exerciseId] ?? [];
      if (list.length <= 1) return prev;
      return { ...prev, [exerciseId]: list.slice(0, -1) };
    });
  };

  const handleResetDayDraft = () => {
    clearDraft(selectedDayId);
    setStartedAt(new Date().toISOString());
    setSetsByExercise(createInitialSetsForDay(selectedDayId));
    showToast('Borrador del día reiniciado');
  };

  const handleFinishWorkout = () => {
    const day = getDayById(selectedDayId);
    const exercisesPayload = day.exercises
      .map((ex) => {
        const drafts = setsByExercise[ex.id] ?? [];
        const completedSets = drafts
          .filter((s) => s.completed)
          .map((s, idx) => ({
            setNumber: idx + 1,
            weight: Math.max(0, parseFloat(s.weight) || 0),
            reps: Math.max(0, parseInt(s.reps, 10) || 0),
            completed: true,
          }))
          .filter((s) => s.reps > 0);

        return {
          exerciseId: ex.id,
          sets: completedSets,
        };
      })
      .filter((e) => e.sets.length > 0);

    if (exercisesPayload.length === 0) return;

    const elapsedMin = Math.max(
      1,
      Math.round((Date.now() - new Date(startedAt).getTime()) / 60000)
    );

    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      dayId: selectedDayId,
      date: new Date().toISOString(),
      durationMinutes: Math.min(elapsedMin, 180),
      exercises: exercisesPayload,
    };

    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    saveSessions(updatedSessions);

    // Limpiar borrador y detener temporizador
    clearDraft(selectedDayId);
    setStartedAt(new Date().toISOString());
    setSetsByExercise(createInitialSetsForDay(selectedDayId));
    setRestState((prev) => ({ ...prev, isActive: false, remainingSeconds: 0 }));

    showToast(`¡${day.title} guardado en tu historial!`);
    setActiveTab('progress');
  };

  const handleAdjustRest = (deltaSec: number) => {
    setRestState((prev) => {
      if (!prev.isActive) return prev;
      const nextRemaining = Math.max(5, prev.remainingSeconds + deltaSec);
      const nextTotal = Math.max(prev.totalSeconds, nextRemaining);
      return {
        ...prev,
        remainingSeconds: nextRemaining,
        totalSeconds: nextTotal,
        endTimeMs: Date.now() + nextRemaining * 1000,
      };
    });
  };

  const handleUpdateSettings = (next: AppSettings) => {
    setSettings(next);
    saveSettings(next);
  };

  const handleImportSessions = (
    imported: WorkoutSession[],
    importedSettings?: AppSettings
  ) => {
    setSessions(imported);
    saveSessions(imported);
    if (importedSettings) {
      setSettings(importedSettings);
      saveSettings(importedSettings);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    const next = sessions.filter((s) => s.id !== sessionId);
    setSessions(next);
    saveSessions(next);
    showToast('Sesión eliminada');
  };

  const handleClearAllSessions = () => {
    setSessions([]);
    saveSessions([]);
  };

  const handleLoadDemoSessions = () => {
    const demo = generateDemoSessions();
    setSessions(demo);
    saveSessions(demo);
    showToast('3 semanas de historial demo cargadas');
  };

  const handleInstallPwa = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50 flex flex-col">
      {/* Barra Superior Fija */}
      <header className="sticky top-0 z-30 bg-[#09090b]/90 backdrop-blur-xl border-b border-zinc-800/80">
        <div className="max-w-md mx-auto px-3.5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-lime-400 text-zinc-950 flex items-center justify-center shadow-[0_0_16px_rgba(163,230,53,0.35)]">
              <Dumbbell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black tracking-tight text-zinc-50">
                  IRON<span className="text-lime-400">PULSE</span>
                </h1>
                {isOffline && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300 text-[10px] font-bold">
                    <WifiOff className="w-2.5 h-2.5" />
                    Offline
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-400 font-medium leading-none">
                4-Day Upper/Lower · Sobrecarga Progresiva
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="h-10 px-3 rounded-xl bg-[#18181b] hover:bg-zinc-800 active:scale-95 border border-zinc-800 flex items-center gap-1.5 text-xs font-bold text-zinc-200 transition"
            aria-label="Abrir ajustes y backup"
          >
            <Settings className="w-4 h-4 text-lime-400" />
            Ajustes
          </button>
        </div>
      </header>

      {/* Toast flotante de confirmación */}
      {toastMsg && (
        <div className="fixed top-16 left-0 right-0 z-50 px-4 pointer-events-none flex justify-center">
          <div className="px-4 py-2.5 rounded-2xl bg-zinc-900 border border-lime-400/40 text-xs font-extrabold text-lime-300 shadow-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
            {toastMsg}
          </div>
        </div>
      )}

      {/* Contenido Principal Mobile-First (360px - 430px óptimo) */}
      <main className="flex-1 w-full max-w-md mx-auto px-3 pt-3.5">
        {activeTab === 'workout' && (
          <WorkoutView
            selectedDayId={selectedDayId}
            onSelectDay={handleSelectDay}
            setsByExercise={setsByExercise}
            sessions={sessions}
            onUpdateSet={handleUpdateSet}
            onAddSet={handleAddSet}
            onRemoveSet={handleRemoveSet}
            onResetDayDraft={handleResetDayDraft}
            onFinishWorkout={handleFinishWorkout}
            onOpenExerciseInfo={setModalExercise}
          />
        )}

        {activeTab === 'routine' && (
          <RoutineView
            selectedDayId={selectedDayId}
            onStartDay={(dayId) => {
              handleSelectDay(dayId);
              setActiveTab('workout');
            }}
            onOpenExerciseInfo={setModalExercise}
          />
        )}

        {activeTab === 'progress' && (
          <Suspense
            fallback={
              <div className="rounded-2xl bg-[#18181b] border border-zinc-800 p-8 text-center text-xs text-zinc-400">
                Cargando gráficas de progreso...
              </div>
            }
          >
            <ProgressView
              sessions={sessions}
              onDeleteSession={handleDeleteSession}
              onOpenExerciseInfo={setModalExercise}
              onLoadDemoData={handleLoadDemoSessions}
            />
          </Suspense>
        )}
      </main>

      {/* Temporizador Flotante de Descanso */}
      <FloatingRestTimer
        remainingSeconds={restState.remainingSeconds}
        totalSeconds={restState.totalSeconds}
        isActive={restState.isActive}
        exerciseName={restState.exerciseName}
        onAdjust={handleAdjustRest}
        onSkip={() =>
          setRestState((prev) => ({
            ...prev,
            isActive: false,
            remainingSeconds: 0,
          }))
        }
      />

      {/* Navegación Inferior Fija (Bottom Nav de 3 Pestañas) */}
      <nav
        aria-label="Navegación principal"
        className="fixed bottom-0 left-0 right-0 z-30 bg-[#09090b]/95 backdrop-blur-xl border-t border-zinc-800/90 pb-[env(safe-area-inset-bottom)]"
      >
        <div className="max-w-md mx-auto px-2 h-16 grid grid-cols-3 gap-1 items-center">
          <button
            type="button"
            onClick={() => setActiveTab('workout')}
            className={`h-12 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition active:scale-95 ${
              activeTab === 'workout'
                ? 'bg-lime-400/12 text-lime-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Dumbbell className="w-5 h-5" />
            <span className="text-[11px] font-extrabold">Entrenar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('routine')}
            className={`h-12 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition active:scale-95 ${
              activeTab === 'routine'
                ? 'bg-lime-400/12 text-lime-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-[11px] font-extrabold">Rutina</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('progress')}
            className={`h-12 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition active:scale-95 ${
              activeTab === 'progress'
                ? 'bg-lime-400/12 text-lime-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[11px] font-extrabold">Progreso</span>
          </button>
        </div>
      </nav>

      {/* Modal de Ilustración y Técnica */}
      <ExerciseDetailModal
        exercise={modalExercise}
        onClose={() => setModalExercise(null)}
      />

      {/* Modal de Ajustes y Backup JSON */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        sessions={sessions}
        onImportSessions={handleImportSessions}
        onClearAllSessions={handleClearAllSessions}
        onLoadDemoSessions={handleLoadDemoSessions}
        canInstallPwa={Boolean(installPrompt)}
        onInstallPwa={handleInstallPwa}
      />
    </div>
  );
}

export default App;
