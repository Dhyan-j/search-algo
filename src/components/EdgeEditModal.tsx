import React, { useState, useEffect } from 'react';
import { GraphEdge, GraphNode } from '../types/graph';
import { Trash2, X, Check, ArrowRight, Minus } from 'lucide-react';

interface EdgeEditModalProps {
  edge: GraphEdge | null;
  nodes: GraphNode[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (edgeId: string, weight: number, directed: boolean) => void;
  onDelete: (edgeId: string) => void;
}

export const EdgeEditModal: React.FC<EdgeEditModalProps> = ({
  edge,
  nodes,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [weight, setWeight] = useState<number>(1);
  const [directed, setDirected] = useState<boolean>(false);

  useEffect(() => {
    if (edge) {
      setWeight(edge.weight ?? 1);
      setDirected(!!edge.directed);
    }
  }, [edge]);

  if (!isOpen || !edge) return null;

  const sourceNode = nodes.find((n) => n.id === edge.source);
  const targetNode = nodes.find((n) => n.id === edge.target);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(edge.id, Math.max(0, Number(weight) || 0), directed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block" />
            <h3 className="text-lg font-semibold text-slate-100">
              Edit Edge / Path Cost
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Close edit edge dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-lg flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-200">
              {sourceNode?.label || edge.source}
            </div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
              {directed ? (
                <>
                  <span>directed</span>
                  <ArrowRight size={14} />
                </>
              ) : (
                <>
                  <span>undirected</span>
                  <Minus size={14} />
                </>
              )}
            </div>
            <div className="text-sm font-semibold text-slate-200">
              {targetNode?.label || edge.target}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Edge Path Cost (Weight c(u, v))
              </label>
              <span className="text-xs text-cyan-400 font-mono">
                Weight &ge; 0
              </span>
            </div>
            <input
              type="number"
              step="any"
              min="0"
              value={weight}
              onChange={(e) => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
              required
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-hidden focus:border-cyan-500 transition text-sm font-mono"
              placeholder="e.g. 5"
            />
            <p className="text-xs text-slate-500 mt-1">
              Path cost accumulated by Dijkstra, A*, and UCS algorithms.
            </p>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 bg-slate-800/80 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800 transition">
              <input
                type="checkbox"
                checked={directed}
                onChange={(e) => setDirected(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-slate-700 border-slate-600 focus:ring-0 focus:ring-offset-0"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-200 block">
                  Directed Edge (One-way: {sourceNode?.label} &rarr; {targetNode?.label})
                </span>
                <span className="text-slate-400">
                  When checked, traversal can only move from source to target.
                </span>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                onDelete(edge.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/50 rounded-lg transition"
            >
              <Trash2 size={14} />
              Delete Edge
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
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition shadow-sm"
              >
                <Check size={14} />
                Save Edge
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
