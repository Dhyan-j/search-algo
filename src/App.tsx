import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  GraphData,
  GraphNode,
  GraphEdge,
  AlgorithmType,
  SearchStep,
} from './types/graph';
import { PRESET_GRAPHS } from './data/presets';
import {
  ALGORITHM_REGISTRY,
  executeAlgorithm,
} from './algorithms/searchEngine';
import { GraphCanvas, CanvasTool } from './components/GraphCanvas';
import { PlaybackControls } from './components/PlaybackControls';
import { QueueInspector } from './components/QueueInspector';
import { PseudocodeViewer } from './components/PseudocodeViewer';
import { ExplanationPanel } from './components/ExplanationPanel';
import { AlgorithmComparison } from './components/AlgorithmComparison';
import { GridVisualizer } from './components/GridVisualizer';
import { TheorySection } from './components/TheorySection';
import { NodeEditModal } from './components/NodeEditModal';
import { EdgeEditModal } from './components/EdgeEditModal';
import {
  Network,
  Grid as GridIcon,
  BarChart3,
  BookOpen,
  Layers,
  Code,
  FolderOpen,
  Sparkles,
  RefreshCw,
  Info,
} from 'lucide-react';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'graph' | 'grid' | 'compare' | 'theory'>('graph');

  // Active graph state
  const [activePresetId, setActivePresetId] = useState<string>('romania');
  const [graph, setGraph] = useState<GraphData>(() => PRESET_GRAPHS[0].data);

  // Selected algorithm
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('astar');

  // Canvas tool
  const [selectedTool, setSelectedTool] = useState<CanvasTool>('select');

  // Modals state
  const [editingNode, setEditingNode] = useState<GraphNode | null>(null);
  const [editingEdge, setEditingEdge] = useState<GraphEdge | null>(null);

  // Side panels toggle
  const [rightPanelTab, setRightPanelTab] = useState<'queue' | 'code'>('queue');

  // Traversal execution and playback state
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(500);

  // Execute algorithm when graph or algorithm changes
  const algorithmResult = useMemo(() => {
    return executeAlgorithm(selectedAlgorithm, graph);
  }, [selectedAlgorithm, graph]);

  const steps: SearchStep[] = algorithmResult.steps;
  const totalSteps = steps.length;
  const activeStep: SearchStep | null = steps[currentStepIndex] || null;

  // Handle auto-advance during Play
  useEffect(() => {
    if (!isPlaying) return;

    if (currentStepIndex >= totalSteps - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => {
        if (prev < totalSteps - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, speedMs);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, totalSteps, speedMs]);

  // Load a preset
  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_GRAPHS.find((p) => p.id === presetId);
    if (!preset) return;

    setActivePresetId(presetId);
    setGraph(JSON.parse(JSON.stringify(preset.data)));
    if (preset.recommendedAlgorithm) {
      setSelectedAlgorithm(preset.recommendedAlgorithm as AlgorithmType);
    }
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  // Playback handlers
  const handlePlay = () => {
    if (currentStepIndex >= totalSteps - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handleSeek = (index: number) => {
    setIsPlaying(false);
    setCurrentStepIndex(Math.max(0, Math.min(index, totalSteps - 1)));
  };

  // Node editing handlers
  const handleSaveNode = (nodeId: string, label: string, h: number) => {
    setGraph((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === nodeId ? { ...n, label, h } : n)),
    }));
    setCurrentStepIndex(0);
  };

  const handleSetStart = (nodeId: string) => {
    setGraph((prev) => ({ ...prev, startNodeId: nodeId }));
    setCurrentStepIndex(0);
  };

  const handleSetGoal = (nodeId: string) => {
    setGraph((prev) => ({ ...prev, goalNodeId: nodeId }));
    setCurrentStepIndex(0);
  };

  const handleDeleteNode = (nodeId: string) => {
    setGraph((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== nodeId),
      edges: prev.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    }));
    setCurrentStepIndex(0);
  };

  // Edge editing handlers
  const handleSaveEdge = (edgeId: string, weight: number, directed: boolean) => {
    setGraph((prev) => ({
      ...prev,
      edges: prev.edges.map((e) => (e.id === edgeId ? { ...e, weight, directed } : e)),
    }));
    setCurrentStepIndex(0);
  };

  const handleDeleteEdge = (edgeId: string) => {
    setGraph((prev) => ({
      ...prev,
      edges: prev.edges.filter((e) => e.id !== edgeId),
    }));
    setCurrentStepIndex(0);
  };

  // Quick switch from comparison table
  const handleApplyFromComparison = (algoKey: AlgorithmType) => {
    setSelectedAlgorithm(algoKey);
    setActiveTab('graph');
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  const currentAlgoInfo = ALGORITHM_REGISTRY[selectedAlgorithm];

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. TOP HEADER & NAVIGATION BAR */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between gap-3 shrink-0 z-30 select-none backdrop-blur-md">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-md">
              <Network size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">
                SearchCraft
              </span>
              <span className="text-[10px] text-indigo-400 font-mono -mt-0.5 block">
                Algorithm Visualizer
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
              activeTab === 'graph'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network size={14} />
            <span>Graph Visualizer</span>
          </button>

          <button
            onClick={() => setActiveTab('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
              activeTab === 'grid'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GridIcon size={14} />
            <span>Grid Maze Mode</span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
              activeTab === 'compare'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 size={14} />
            <span>Benchmark & Compare</span>
          </button>

          <button
            onClick={() => setActiveTab('theory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition font-medium ${
              activeTab === 'theory'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={14} />
            <span>Theory & Quiz</span>
          </button>
        </div>

        {/* Algorithm & Preset Controls (visible in Graph mode) */}
        {activeTab === 'graph' ? (
          <div className="flex items-center gap-2">
            {/* Preset Selector */}
            <div className="flex items-center gap-1.5">
              <FolderOpen size={14} className="text-slate-400" />
              <select
                value={activePresetId}
                onChange={(e) => handleSelectPreset(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 focus:outline-hidden focus:border-indigo-500"
                aria-label="Preset graphs"
              >
                {PRESET_GRAPHS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    Preset: {preset.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Algorithm Selector */}
            <div className="flex items-center gap-1.5">
              <select
                value={selectedAlgorithm}
                onChange={(e) => {
                  setSelectedAlgorithm(e.target.value as AlgorithmType);
                  setCurrentStepIndex(0);
                  setIsPlaying(false);
                }}
                className="px-3 py-1.5 bg-indigo-950/80 border border-indigo-600/70 text-indigo-200 rounded-lg text-xs font-bold focus:outline-hidden focus:border-indigo-400 shadow-xs"
                aria-label="Search algorithm selector"
              >
                {Object.values(ALGORITHM_REGISTRY).map((algo) => (
                  <option key={algo.id} value={algo.id}>
                    {algo.name} ({algo.formula})
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-mono">Interactive Learning Suite</div>
        )}
      </header>

      {/* 2. MAIN VIEW BODY */}
      <main className="flex-1 flex overflow-hidden relative">
        {activeTab === 'graph' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex-1 flex overflow-hidden relative">
              {/* Center Graph Canvas */}
              <div className="flex-1 h-full relative">
                <GraphCanvas
                  graph={graph}
                  activeStep={activeStep}
                  selectedTool={selectedTool}
                  setSelectedTool={setSelectedTool}
                  onUpdateGraph={(updater) => {
                    setGraph(updater);
                    setCurrentStepIndex(0);
                  }}
                  onSelectNode={(node) => setEditingNode(node)}
                  onSelectEdge={(edge) => setEditingEdge(edge)}
                />
              </div>

              {/* Right Side Inspection Panel (Queue / Pseudocode) */}
              <div className="w-80 border-l border-slate-800 flex flex-col bg-slate-900 shrink-0 select-none">
                {/* Panel Tab Switcher */}
                <div className="flex items-center border-b border-slate-800 p-1 bg-slate-950/70">
                  <button
                    onClick={() => setRightPanelTab('queue')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition ${
                      rightPanelTab === 'queue'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers size={13} className="text-amber-400" />
                    <span>Frontier Queue</span>
                  </button>
                  <button
                    onClick={() => setRightPanelTab('code')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition ${
                      rightPanelTab === 'code'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Code size={13} className="text-cyan-400" />
                    <span>Pseudocode</span>
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden">
                  {rightPanelTab === 'queue' ? (
                    <QueueInspector
                      graph={graph}
                      activeStep={activeStep}
                      algorithmName={currentAlgoInfo.name}
                      isHeuristic={currentAlgoInfo.isHeuristic}
                    />
                  ) : (
                    <PseudocodeViewer
                      algorithmInfo={currentAlgoInfo}
                      activeLineNumber={activeStep?.pseudocodeLine ?? 1}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Explanation & Math Formula Bar */}
            <ExplanationPanel
              graph={graph}
              activeStep={activeStep}
              algorithmName={currentAlgoInfo.name}
            />

            {/* Bottom Playback & Scrubber Controls */}
            <PlaybackControls
              currentStepIndex={currentStepIndex}
              totalSteps={totalSteps}
              isPlaying={isPlaying}
              speedMs={speedMs}
              isGoalReached={activeStep?.phase === 'goal_reached'}
              isNoPath={activeStep?.phase === 'no_path'}
              onPlay={handlePlay}
              onPause={handlePause}
              onStepForward={handleStepForward}
              onStepBackward={handleStepBackward}
              onReset={handleReset}
              onSeek={handleSeek}
              onChangeSpeed={setSpeedMs}
            />
          </div>
        )}

        {/* 2D Grid / Maze Visualizer Tab */}
        {activeTab === 'grid' && (
          <div className="flex-1 overflow-y-auto">
            <GridVisualizer />
          </div>
        )}

        {/* Algorithm Benchmark Comparison Tab */}
        {activeTab === 'compare' && (
          <div className="flex-1 overflow-y-auto">
            <AlgorithmComparison
              graph={graph}
              onApplyPathToView={handleApplyFromComparison}
            />
          </div>
        )}

        {/* Theory & Quiz Tab */}
        {activeTab === 'theory' && (
          <div className="flex-1 overflow-y-auto">
            <TheorySection />
          </div>
        )}
      </main>

      {/* 3. MODALS */}
      <NodeEditModal
        node={editingNode}
        isOpen={editingNode !== null}
        isStart={editingNode?.id === graph.startNodeId}
        isGoal={editingNode?.id === graph.goalNodeId}
        onClose={() => setEditingNode(null)}
        onSave={handleSaveNode}
        onSetStart={handleSetStart}
        onSetGoal={handleSetGoal}
        onDelete={handleDeleteNode}
      />

      <EdgeEditModal
        edge={editingEdge}
        nodes={graph.nodes}
        isOpen={editingEdge !== null}
        onClose={() => setEditingEdge(null)}
        onSave={handleSaveEdge}
        onDelete={handleDeleteEdge}
      />
    </div>
  );
}
