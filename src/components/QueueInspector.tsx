import React from 'react';
import { FrontierItem, GraphData, SearchStep } from '../types/graph';
import { Layers, CheckCircle2, ArrowRight, Clock } from 'lucide-react';

interface QueueInspectorProps {
  graph: GraphData;
  activeStep: SearchStep | null;
  algorithmName: string;
  isHeuristic: boolean;
}

export const QueueInspector: React.FC<QueueInspectorProps> = ({
  graph,
  activeStep,
  algorithmName,
  isHeuristic,
}) => {
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
  const frontier = activeStep?.frontier || [];
  const visited = activeStep?.visited || [];

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-200">
      {/* 1. Header with Metrics */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Open Set / Frontier ({frontier.length})
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/40">
            Priority Order
          </span>
        </div>
      </div>

      {/* 2. Frontier Queue List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {frontier.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-28 text-slate-500 text-xs italic text-center p-4">
            <span>Frontier is empty.</span>
            <span className="text-[11px] text-slate-600 mt-1">
              Nodes ready for expansion will appear here.
            </span>
          </div>
        ) : (
          frontier.map((item, idx) => {
            const node = nodeMap.get(item.nodeId);
            const parent = item.parentId ? nodeMap.get(item.parentId) : null;
            const isTopNext = idx === 0;

            return (
              <div
                key={`${item.nodeId}-${idx}`}
                className={`p-2.5 rounded-lg border transition duration-150 ${
                  isTopNext
                    ? 'bg-amber-950/30 border-amber-500/70 shadow-xs'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                        isTopNext
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-100">
                      {node?.label || item.nodeId}
                    </span>
                    {item.direction && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                          item.direction === 'forward'
                            ? 'bg-sky-950 text-sky-300 border border-sky-800'
                            : 'bg-purple-950 text-purple-300 border border-purple-800'
                        }`}
                      >
                        {item.direction}
                      </span>
                    )}
                  </div>

                  {/* Priority Key Score */}
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      f = {item.f.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Formula Breakdown: g + h */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span title="Past path cost from start">
                      g: <strong className="text-slate-300">{item.g.toFixed(1)}</strong>
                    </span>
                    {isHeuristic && (
                      <span title="Heuristic estimate to goal">
                        + h: <strong className="text-indigo-400">{item.h.toFixed(1)}</strong>
                      </span>
                    )}
                  </div>
                  {parent && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <span>via</span>
                      <span className="text-slate-300 font-medium">{parent.label}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Closed Set / Visited Order */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
            <CheckCircle2 size={14} className="text-indigo-400" />
            <span>Closed Set / Visited ({visited.length})</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">In order</span>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
          {visited.length === 0 ? (
            <span className="text-xs text-slate-500 italic">No nodes expanded yet</span>
          ) : (
            visited.map((vId, idx) => {
              const node = nodeMap.get(vId);
              return (
                <span
                  key={vId}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-slate-800 border border-slate-700 text-slate-300 font-medium"
                >
                  <span className="text-[9px] text-slate-500 font-mono">{idx + 1}.</span>
                  {node?.label || vId}
                </span>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
