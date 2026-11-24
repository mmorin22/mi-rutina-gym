import React, { useRef, useState } from 'react';
import {
  Bell,
  Database,
  Download,
  Smartphone,
  Sparkles,
  Timer,
  Trash2,
  Upload,
  Vibrate,
  X,
} from 'lucide-react';
import type { AppSettings, WorkoutSession } from '../types';
import { createBackupJson, parseBackupJson } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (next: AppSettings) => void;
  sessions: WorkoutSession[];
  onImportSessions: (sessions: WorkoutSession[], settings?: AppSettings) => void;
  onClearAllSessions: () => void;
  onLoadDemoSessions: () => void;
  canInstallPwa: boolean;
  onInstallPwa: () => void;
}

const REST_PRESETS = [60, 90, 120, 150, 180];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  sessions,
  onImportSessions,
  onClearAllSessions,
  onLoadDemoSessions,
  canInstallPwa,
  onInstallPwa,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'ok' | 'err';
    msg: string;
  } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleExportJson = () => {
    const json = createBackupJson(sessions, settings);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateTag = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ironpulse-backup-${dateTag}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setFeedback({
      type: 'ok',
      msg: `Backup exportado (${sessions.length} sesiones guardadas).`,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseBackupJson(text);
      onImportSessions(parsed.sessions, parsed.settings);
      setFeedback({
        type: 'ok',
        msg: `Backup restaurado con éxito: ${parsed.sessions.length} sesiones importadas.`,
      });
    } catch (err) {
      setFeedback({
        type: 'err',
        msg:
          err instanceof Error
            ? err.message
            : 'No se pudo leer el archivo JSON.',
      });
    } finally {
      e.target.value = '';
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#18181b] border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-11 h-1.5 rounded-full bg-zinc-700" />
        </div>

        <div className="px-5 pt-2 pb-4 flex items-center justify-between border-b border-zinc-800/80">
          <div>
            <h3 className="text-lg font-extrabold text-zinc-50">
              Ajustes y Backup
            </h3>
            <p className="text-xs text-zinc-400">
              Configuración offline, descanso y copia de seguridad
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300"
            aria-label="Cerrar ajustes"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Temporizador de descanso por defecto */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-lime-400 flex items-center gap-1.5">
                <Timer className="w-4 h-4" />
                Temporizador de Descanso
              </span>
              <span className="text-sm font-extrabold text-zinc-100 tabular-nums">
                {formatSeconds(settings.defaultRestSeconds)} min
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {REST_PRESETS.map((sec) => {
                const active = settings.defaultRestSeconds === sec;
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() =>
                      onUpdateSettings({ ...settings, defaultRestSeconds: sec })
                    }
                    className={`h-10 rounded-xl text-xs font-bold tabular-nums transition ${
                      active
                        ? 'bg-lime-400 text-zinc-950 font-extrabold'
                        : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                    }`}
                  >
                    {formatSeconds(sec)}
                  </button>
                );
              })}
            </div>

            {/* Toggles de Sonido y Vibración */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    soundEnabled: !settings.soundEnabled,
                  })
                }
                className={`h-11 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                  settings.soundEnabled
                    ? 'bg-zinc-900 border-lime-400/40 text-zinc-100'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-lime-400" />
                  Aviso sonoro
                </span>
                <span>{settings.soundEnabled ? 'ON' : 'OFF'}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    vibrationEnabled: !settings.vibrationEnabled,
                  })
                }
                className={`h-11 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                  settings.vibrationEnabled
                    ? 'bg-zinc-900 border-sky-400/40 text-zinc-100'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Vibrate className="w-4 h-4 text-sky-400" />
                  Vibración
                </span>
                <span>{settings.vibrationEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* Backup en JSON (Exportar / Importar) */}
          <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
            <span className="text-xs font-extrabold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Database className="w-4 h-4" />
              Copia de Seguridad (JSON)
            </span>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Guarda todas tus marcas en tu móvil o Google Drive para no perder
              nunca tu progreso ({sessions.length} sesiones en memoria).
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleExportJson}
                className="h-12 rounded-xl bg-lime-400 hover:bg-lime-300 active:scale-95 text-zinc-950 text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" />
                Exportar JSON
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-100 border border-zinc-700 text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
              >
                <Upload className="w-4 h-4 text-sky-400" />
                Importar JSON
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold border ${
                  feedback.type === 'ok'
                    ? 'bg-lime-400/10 border-lime-400/30 text-lime-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                {feedback.msg}
              </div>
            )}
          </div>

          {/* Instalar PWA en Android */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-lime-400" />
              Aplicación Android / Modo Sin Conexión
            </span>
            {canInstallPwa ? (
              <button
                type="button"
                onClick={onInstallPwa}
                className="w-full h-11 rounded-xl bg-sky-400 hover:bg-sky-300 text-zinc-950 text-xs font-extrabold flex items-center justify-center gap-2 transition"
              >
                <Smartphone className="w-4 h-4" />
                Instalar en Pantalla de Inicio
              </button>
            ) : (
              <p className="text-xs text-zinc-400 leading-relaxed">
                En Chrome para Android abre el menú <strong>⋮</strong> y pulsa{' '}
                <strong>«Añadir a pantalla de inicio»</strong> o{' '}
                <strong>«Instalar aplicación»</strong> para abrirla a pantalla
                completa y sin conexión dentro del gimnasio.
              </p>
            )}
          </div>

          {/* Utilidades de Datos: Demo y Borrado */}
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                onLoadDemoSessions();
                setFeedback({
                  type: 'ok',
                  msg: '12 sesiones de ejemplo cargadas para explorar sobrecarga y gráficas.',
                });
              }}
              className="h-10 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-lime-400" />
              Cargar datos demo
            </button>

            {!confirmClear ? (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="h-10 px-3 rounded-xl bg-zinc-900 hover:bg-red-500/15 border border-zinc-800 text-xs font-semibold text-red-400 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Borrar historial
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClearAllSessions();
                  setConfirmClear(false);
                  setFeedback({
                    type: 'ok',
                    msg: 'Historial eliminado por completo.',
                  });
                }}
                className="h-10 px-3 rounded-xl bg-red-500 text-white text-xs font-extrabold"
              >
                Confirmar borrado
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
