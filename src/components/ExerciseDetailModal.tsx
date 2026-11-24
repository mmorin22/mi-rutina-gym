import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Cpu,
  Dumbbell,
  Image as ImageIcon,
  Layers,
  Play,
  Target,
  X,
} from 'lucide-react';
import type { ExerciseDefinition } from '../types';
import { ExerciseSvgFallback } from './ExerciseSvgFallback';

interface ExerciseDetailModalProps {
  exercise: ExerciseDefinition | null;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'photo' | 'svg'>('photo');
  const [frameIndex, setFrameIndex] = useState<0 | 1>(0);
  const [autoPlay, setAutoPlay] = useState<boolean>(true);
  const [imgFailed, setImgFailed] = useState<boolean>(false);

  useEffect(() => {
    if (!exercise) return;
    setImgFailed(false);
    setViewMode('photo');
    setFrameIndex(0);
    setAutoPlay(true);
  }, [exercise]);

  useEffect(() => {
    if (!exercise || !autoPlay || viewMode !== 'photo' || imgFailed) return;
    if (exercise.imageUrls.length < 2) return;

    const id = window.setInterval(() => {
      setFrameIndex((prev) => (prev === 0 ? 1 : 0));
    }, 1500);

    return () => window.clearInterval(id);
  }, [exercise, autoPlay, viewMode, imgFailed]);

  if (!exercise) return null;

  const showSvg = viewMode === 'svg' || imgFailed || exercise.imageUrls.length === 0;
  const activeImgUrl = exercise.imageUrls[frameIndex] ?? exercise.imageUrls[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#18181b] border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle estilo Android bottom-sheet */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-11 h-1.5 rounded-full bg-zinc-700" />
        </div>

        {/* Cabecera */}
        <div className="px-5 pt-2 pb-3 flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-lime-400/15 text-lime-400 border border-lime-400/25">
              Ejercicio #{exercise.order}
            </span>
            <h3 className="mt-1.5 text-lg font-extrabold text-zinc-50 leading-snug">
              {exercise.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-zinc-800/90 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 shrink-0 active:scale-95"
            aria-label="Cerrar ficha técnica"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pb-7 space-y-4">
          {/* Selector entre Foto Real (free-exercise-db) y Esquema SVG Biomecánico */}
          <div className="flex items-center justify-between gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setViewMode('photo')}
              disabled={imgFailed}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                !showSvg
                  ? 'bg-zinc-800 text-lime-400 shadow-sm'
                  : imgFailed
                    ? 'text-zinc-600 cursor-not-allowed'
                    : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              {imgFailed ? 'Sin conexión (SVG activo)' : 'Ilustración Movimiento'}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('svg')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                showSvg
                  ? 'bg-zinc-800 text-sky-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Mapa Biomecánico SVG
            </button>
          </div>

          {/* Visor de Ilustración o Fallback SVG obligatorio */}
          {showSvg ? (
            <ExerciseSvgFallback
              type={exercise.svgType}
              primaryMuscles={exercise.primaryMuscles}
            />
          ) : (
            <div className="relative rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800">
              <img
                src={activeImgUrl}
                alt={`${exercise.name} - fase ${frameIndex + 1}`}
                onError={() => setImgFailed(true)}
                className="w-full h-56 object-cover object-center bg-zinc-950"
              />
              {/* Controles de fase Inicio / Final */}
              <div className="px-3 py-2 bg-zinc-900/95 border-t border-zinc-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAutoPlay(false);
                      setFrameIndex(0);
                    }}
                    className={`px-2.5 py-1 rounded-md font-semibold transition ${
                      frameIndex === 0
                        ? 'bg-lime-400 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    1. Inicio
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAutoPlay(false);
                      setFrameIndex(1);
                    }}
                    className={`px-2.5 py-1 rounded-md font-semibold transition ${
                      frameIndex === 1
                        ? 'bg-lime-400 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    2. Contracción
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoPlay((p) => !p)}
                  className={`px-2.5 py-1 rounded-md flex items-center gap-1 font-semibold ${
                    autoPlay
                      ? 'bg-sky-400/15 text-sky-400 border border-sky-400/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  {autoPlay ? 'Animando' : 'Animar'}
                </button>
              </div>
            </div>
          )}

          {/* Rango Objetivo: Series, Repeticiones y RIR */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-zinc-400 text-[11px] font-medium">
                <Layers className="w-3.5 h-3.5 text-lime-400" />
                Series
              </div>
              <p className="mt-1 text-base font-extrabold text-zinc-50">
                {exercise.defaultSets} series
              </p>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-zinc-400 text-[11px] font-medium">
                <Dumbbell className="w-3.5 h-3.5 text-sky-400" />
                Objetivo
              </div>
              <p className="mt-1 text-sm font-extrabold text-zinc-50 leading-tight">
                {exercise.repRange}
              </p>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-zinc-400 text-[11px] font-medium">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                Esfuerzo
              </div>
              <p className="mt-1 text-base font-extrabold text-lime-400">
                {exercise.rir}
              </p>
            </div>
          </div>

          {/* Nota Técnica Exacta */}
          <div className="rounded-2xl bg-lime-400/8 border border-lime-400/25 p-4">
            <div className="flex items-center gap-2 text-lime-400 text-xs font-extrabold uppercase tracking-wider mb-1.5">
              <BookOpen className="w-4 h-4" />
              Nota Técnica de Ejecución
            </div>
            <p className="text-sm text-zinc-100 leading-relaxed font-medium">
              {exercise.note}
            </p>
          </div>

          {/* Músculos implicados */}
          <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-3.5 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mr-1">
                Principal:
              </span>
              {exercise.primaryMuscles.map((m) => (
                <span
                  key={m}
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-lime-400/15 text-lime-300 border border-lime-400/25"
                >
                  {m}
                </span>
              ))}
            </div>
            {exercise.secondaryMuscles.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mr-1">
                  Sinergistas:
                </span>
                {exercise.secondaryMuscles.map((m) => (
                  <span
                    key={m}
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full h-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-[0.99] text-sm font-extrabold text-zinc-100 flex items-center justify-center gap-2 transition"
          >
            <CheckCircle2 className="w-4 h-4 text-lime-400" />
            Entendido, volver a la serie
          </button>
        </div>
      </div>
    </div>
  );
};
