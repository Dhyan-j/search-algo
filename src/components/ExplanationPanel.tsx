import React from 'react';
import { SearchStep, GraphData } from '../types/graph';
import { Lightbulb, Calculator, Compass, Award } from 'lucide-react';

interface ExplanationPanelProps {
  graph: GraphData;
  activeStep: SearchStep | null;
  algorithmName: string;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({
  graph,
  activeStep,
  algorithmName,
}) => {
  if (!activeStep) return null;

  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
  const visitingNode = activeStep.currentVisitingId
    ? nodeMap.get(activeStep.currentVisitingId)
    : null;
  const neighborNode = activeStep.examiningNeighborId
    ? nodeMap.get(activeStep.examiningNeighborId)
    : null;

  const currentG = activeStep.currentVisitingId
    ? activeStep.gScores[activeStep.currentVisitingId]
    : undefined;
  const currentH = activeStep.currentVisitingId
    ? activeStep.hScores[activeStep.currentVisitingId]
    : undefined;
  const currentF = activeStep.currentVisitingId
    ? activeStep.fScores[activeStep.currentVisitingId]
    : undefined;

  return (
    <div className="bg-slate-900/90 border-t border-slate-800 p-3.5 text-slate-200">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Step Explanation text */}
        <div className="flex items-start gap-2.5 flex-1">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shrink-0 mt-0.5">
            <Lightbulb size={16} />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-indigo-300">
                Phase: {activeStep.phase.replace('_', ' ')}
              </span>
              {visitingNode && (
                <span className="text-xs text-slate-400">
                  Focus: <strong className="text-slate-200 font-semibold">{visitingNode.label}</strong>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {activeStep.explanation}
            </p>
          </div>
        </div>

        {/* Dynamic Formula Calculation Card */}
        {visitingNode && currentG !== undefined && (
          <div className="shrink-0 flex items-center gap-3 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calculator size={13} className="text-cyan-400" />
              <span>Evaluation:</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <span>
                g = <strong className="text-emerald-400">{currentG.toFixed(1)}</strong>
              </span>
              {currentH !== undefined && (
                <>
                  <span className="text-slate-500">+</span>
                  <span>
                    h = <strong className="text-amber-400">{currentH.toFixed(1)}</strong>
                  </span>
                </>
              )}
              {currentF !== undefined && (
                <>
                  <span className="text-slate-500">=</span>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold border border-indigo-800/50">
                    f = {currentF.toFixed(1)}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Path Reached Summary */}
        {activeStep.pathFound && activeStep.totalCost !== null && (
          <div className="shrink-0 flex items-center gap-3 bg-emerald-950/70 border border-emerald-500/50 px-3.5 py-1.5 rounded-lg text-xs text-emerald-200 shadow-md">
            <Award size={16} className="text-emerald-400" />
            <div>
              <span className="block font-bold">
                Optimal Cost: {activeStep.totalCost.toFixed(1)}
              </span>
              <span className="text-[10px] text-emerald-300">
                {activeStep.pathFound.length - 1} hops ({activeStep.pathFound.map((id) => nodeMap.get(id)?.label || id).join(' → ')})
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
