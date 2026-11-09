import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  FastForward,
  Gauge,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlaybackControlsProps {
  currentStepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  speedMs: number;
  isGoalReached: boolean;
  isNoPath: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onSeek: (stepIndex: number) => void;
  onChangeSpeed: (speedMs: number) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  currentStepIndex,
  totalSteps,
  isPlaying,
  speedMs,
  isGoalReached,
  isNoPath,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  onSeek,
  onChangeSpeed,
}) => {
  // Trigger celebration confetti when reaching goal
  React.useEffect(() => {
    if (isGoalReached) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#38bdf8', '#f59e0b'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isGoalReached]);

  const maxIndex = Math.max(0, totalSteps - 1);
  const progressPercent = totalSteps > 1 ? (currentStepIndex / maxIndex) * 100 : 0;

  return (
    <div className="w-full bg-slate-900 border-t border-slate-800 px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4 select-none">
      {/* 1. Main Transport Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
          title="Reset to beginning"
          aria-label="Reset traversal"
        >
          <RotateCcw size={17} />
        </button>

        <button
          onClick={onStepBackward}
          disabled={currentStepIndex <= 0}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition"
          title="Step backward"
          aria-label="Step backward"
        >
          <SkipBack size={18} />
        </button>

        <button
          onClick={isPlaying ? onPause : onPlay}
          className={`px-4 py-2 flex items-center gap-2 rounded-lg font-semibold text-xs shadow-md transition ${
            isPlaying
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
          aria-label={isPlaying ? 'Pause search playback' : 'Start search playback'}
        >
          {isPlaying ? (
            <>
              <Pause size={16} />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play size={16} className="fill-current" />
              <span>{currentStepIndex >= maxIndex ? 'Replay' : 'Play'}</span>
            </>
          )}
        </button>

        <button
          onClick={onStepForward}
          disabled={currentStepIndex >= maxIndex}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition"
          title="Step forward"
          aria-label="Step forward"
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* 2. Timeline scrubber & Step Counter */}
      <div className="flex-1 max-w-xl w-full flex items-center gap-3">
        <span className="text-xs font-mono text-slate-400 min-w-[70px] text-right">
          Step {Math.min(currentStepIndex + 1, totalSteps)} / {totalSteps}
        </span>

        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            min="0"
            max={maxIndex}
            value={currentStepIndex}
            onChange={(e) => onSeek(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-hidden"
            aria-label="Timeline scrubber"
          />
        </div>

        {/* State Status Chip */}
        {isGoalReached ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            <CheckCircle2 size={13} />
            Goal Reached!
          </span>
        ) : isNoPath ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-400 border border-rose-800/60">
            <AlertCircle size={13} />
            No Path
          </span>
        ) : (
          <span className="text-xs font-mono text-slate-500">
            {Math.round(progressPercent)}%
          </span>
        )}
      </div>

      {/* 3. Speed Control */}
      <div className="flex items-center gap-2">
        <Gauge size={15} className="text-slate-400" />
        <span className="text-xs font-medium text-slate-400">Speed:</span>
        <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs">
          {[
            { label: '0.5x', ms: 900 },
            { label: '1x', ms: 500 },
            { label: '2x', ms: 250 },
            { label: '5x', ms: 80 },
          ].map(({ label, ms }) => (
            <button
              key={label}
              onClick={() => onChangeSpeed(ms)}
              className={`px-2 py-1 rounded-md transition font-mono ${
                speedMs === ms
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
