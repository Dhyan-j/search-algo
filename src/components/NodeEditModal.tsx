import React, { useState, useEffect } from 'react';
import { GraphNode } from '../types/graph';
import { Flag, Target, Trash2, X, Check } from 'lucide-react';

interface NodeEditModalProps {
  node: GraphNode | null;
  isOpen: boolean;
  isStart: boolean;
  isGoal: boolean;
  onClose: () => void;
  onSave: (nodeId: string, label: string, h: number) => void;
  onSetStart: (nodeId: string) => void;
  onSetGoal: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
}

export const NodeEditModal: React.FC<NodeEditModalProps> = ({
  node,
  isOpen,
  isStart,
  isGoal,
  onClose,
  onSave,
  onSetStart,
  onSetGoal,
  onDelete,
}) => {
  const [label, setLabel] = useState('');
  const [heuristic, setHeuristic] = useState<number>(0);

  useEffect(() => {
    if (node) {
      setLabel(node.label);
      setHeuristic(node.h ?? 0);
    }
  }, [node]);

  if (!isOpen || !node) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(node.id, label.trim() || node.id, Number(heuristic) || 0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
            <h3 className="text-lg font-semibold text-slate-100">
              Edit Node <span className="text-indigo-400">"{node.label}"</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Close edit node dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              Node Label / Name
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-hidden focus:border-indigo-500 transition text-sm"
              placeholder="e.g. Arad, Node A"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Heuristic Value h(n)
              </label>
              <span className="text-xs text-indigo-400 font-mono">
                Estimated distance to goal
              </span>
            </div>
            <input
              type="number"
              step="any"
              min="0"
              value={heuristic}
              onChange={(e) => setHeuristic(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-hidden focus:border-indigo-500 transition text-sm font-mono"
            />
            <p className="text-xs text-slate-500 mt-1">
              Used by A* and Greedy Best-First Search. Set to 0 if this is the Goal node.
            </p>
          </div>

          {/* Quick role toggles */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={() => onSetStart(node.id)}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition ${
                isStart
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-emerald-500/50'
              }`}
            >
              <Flag size={14} className={isStart ? 'text-emerald-400 fill-emerald-400' : ''} />
              {isStart ? 'Current Start' : 'Set as Start'}
            </button>
            <button
              type="button"
              onClick={() => onSetGoal(node.id)}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition ${
                isGoal
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-amber-500/50'
              }`}
            >
              <Target size={14} className={isGoal ? 'text-amber-400' : ''} />
              {isGoal ? 'Current Goal' : 'Set as Goal'}
            </button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                onDelete(node.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/50 rounded-lg transition"
            >
              <Trash2 size={14} />
              Delete Node
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition shadow-sm"
              >
                <Check size={14} />
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
