import React, { useMemo } from 'react';
import { GraphData, AlgorithmType } from '../types/graph';
import { executeAlgorithm, ALGORITHM_REGISTRY } from '../algorithms/searchEngine';
import { Trophy, Check, X, Zap, BarChart3, HelpCircle, ArrowRight } from 'lucide-react';

interface AlgorithmComparisonProps {
  graph: GraphData;
  onApplyPathToView: (algorithm: AlgorithmType) => void;
}

export const AlgorithmComparison: React.FC<AlgorithmComparisonProps> = ({
  graph,
  onApplyPathToView,
}) => {
  const algorithmsToCompare: AlgorithmType[] = [
    'astar',
    'gbfs',
    'dijkstra',
    'bfs',
    'dfs',
    'bidirectional',
  ];

  const results = useMemo(() => {
    return algorithmsToCompare.map((algoKey) => {
      const res = executeAlgorithm(algoKey, graph);
      const info = ALGORITHM_REGISTRY[algoKey];
      return {
        algoKey,
        info,
        result: res,
      };
    });
  }, [graph]);

  const nodeMap = useMemo(() => {
    return new Map(graph.nodes.map((n) => [n.id, n]));
  }, [graph]);

  // Find minimum cost among successful runs to determine optimality
  const successfulRuns = results.filter((r) => r.result.success);
  const minCost = successfulRuns.length > 0
    ? Math.min(...successfulRuns.map((r) => r.result.totalCost))
    : Infinity;

  const minExpanded = successfulRuns.length > 0
    ? Math.min(...successfulRuns.map((r) => r.result.nodesExpanded))
    : Infinity;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 text-slate-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-indigo-400" />
            Algorithm Benchmark & Head-to-Head Comparison
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Running 6 search strategies on the identical graph from Start (
            <strong className="text-emerald-400">
              {nodeMap.get(graph.startNodeId)?.label || graph.startNodeId}
            </strong>
            ) to Goal (
            <strong className="text-amber-400">
              {nodeMap.get(graph.goalNodeId)?.label || graph.goalNodeId}
            </strong>
            ).
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <th className="p-3.5">Algorithm</th>
              <th className="p-3.5">Total Cost</th>
              <th className="p-3.5">Nodes Expanded</th>
              <th className="p-3.5">Max Frontier</th>
              <th className="p-3.5">Path Length</th>
              <th className="p-3.5">Optimal?</th>
              <th className="p-3.5 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {results.map(({ algoKey, info, result }) => {
              const isCostWinner = result.success && Math.abs(result.totalCost - minCost) < 0.001;
              const isSpeedWinner = result.success && result.nodesExpanded === minExpanded;

              return (
                <tr
                  key={algoKey}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  {/* Name and Formula */}
                  <td className="p-3.5">
                    <div className="font-bold text-slate-100 text-sm">{info.name}</div>
                    <div className="text-[11px] font-mono text-indigo-400 mt-0.5">
                      {info.formula}
                    </div>
                  </td>

                  {/* Total Cost */}
                  <td className="p-3.5 font-mono">
                    {result.success ? (
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-sm font-bold ${
                            isCostWinner ? 'text-emerald-400' : 'text-slate-200'
                          }`}
                        >
                          {result.totalCost.toFixed(1)}
                        </span>
                        {isCostWinner && (
                          <span
                            className="p-1 rounded-full bg-emerald-500/20 text-emerald-400"
                            title="Lowest path cost found!"
                          >
                            <Trophy size={13} />
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-rose-400 italic">No path</span>
                    )}
                  </td>

                  {/* Nodes Expanded */}
                  <td className="p-3.5 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-sm font-semibold ${
                          isSpeedWinner ? 'text-cyan-400' : 'text-slate-300'
                        }`}
                      >
                        {result.nodesExpanded}
                      </span>
                      {isSpeedWinner && (
                        <span
                          className="p-1 rounded-full bg-cyan-500/20 text-cyan-400"
                          title="Fewest nodes expanded!"
                        >
                          <Zap size={13} />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Max Frontier */}
                  <td className="p-3.5 font-mono text-slate-300">
                    {result.maxFrontierSize}
                  </td>

                  {/* Path Length */}
                  <td className="p-3.5 font-mono text-slate-300">
                    {result.path ? `${result.path.length - 1} hops` : '-'}
                  </td>

                  {/* Optimality status */}
                  <td className="p-3.5">
                    {isCostWinner ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
                        <Check size={12} /> Optimal
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/70 text-amber-400 border border-amber-800/60">
                        Suboptimal
                      </span>
                    )}
                  </td>

                  {/* Action button */}
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => onApplyPathToView(algoKey)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium text-xs transition shadow-xs"
                    >
                      <span>Visualize</span>
                      <ArrowRight size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Educational Analysis Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            Key Insight: A* vs Greedy Best-First Search
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>Greedy Best-First</strong> uses only heuristic <code className="text-indigo-300">f(n) = h(n)</code>.
            It rushes straight toward the goal and frequently expands fewer nodes, but can be easily misled down high-cost paths.
            <strong> A*</strong> balances past path cost with future estimate <code className="text-indigo-300">f(n) = g(n) + h(n)</code>,
            mathematically guaranteeing the optimal cheapest route when <code className="text-indigo-300">h(n)</code> is admissible.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Dijkstra (Uniform Cost Search) vs BFS
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>BFS</strong> guarantees the shortest path measured by the <em>number of hops/edges</em> (unweighted distance),
            which can be suboptimal if edge costs differ. <strong>Dijkstra</strong> prioritizes by cumulative cost <code className="text-cyan-300">g(n)</code>,
            guaranteeing the lowest-cost path for arbitrary non-negative weights.
          </p>
        </div>
      </div>
    </div>
  );
};
