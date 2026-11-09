import React, { useState, useRef, useEffect } from 'react';
import { GraphData, GraphNode, GraphEdge, SearchStep } from '../types/graph';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Plus,
  ArrowUpRight,
  Flag,
  Target,
  Trash2,
  Move,
  Sparkles,
} from 'lucide-react';

export type CanvasTool =
  | 'select'
  | 'add_node'
  | 'add_edge'
  | 'set_start'
  | 'set_goal'
  | 'delete';

interface GraphCanvasProps {
  graph: GraphData;
  activeStep: SearchStep | null;
  selectedTool: CanvasTool;
  setSelectedTool: (tool: CanvasTool) => void;
  onUpdateGraph: (updater: (prev: GraphData) => GraphData) => void;
  onSelectNode: (node: GraphNode) => void;
  onSelectEdge: (edge: GraphEdge) => void;
}

const NODE_RADIUS = 26;

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graph,
  activeStep,
  selectedTool,
  setSelectedTool,
  onUpdateGraph,
  onSelectNode,
  onSelectEdge,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 950, height: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Dragging node state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Adding edge state
  const [edgeStartNodeId, setEdgeStartNodeId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Convert client coordinates to SVG coordinates
  const clientToSvgCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const svgX = viewBox.x + ((clientX - rect.left) / rect.width) * viewBox.width;
    const svgY = viewBox.y + ((clientY - rect.top) / rect.height) * viewBox.height;
    return { x: svgX, y: svgY };
  };

  // Zoom handlers
  const handleZoom = (factor: number) => {
    setViewBox((prev) => {
      const newWidth = Math.max(300, Math.min(2400, prev.width * factor));
      const newHeight = Math.max(200, Math.min(1600, prev.height * factor));
      const dx = (prev.width - newWidth) / 2;
      const dy = (prev.height - newHeight) / 2;
      return {
        x: prev.x + dx,
        y: prev.y + dy,
        width: newWidth,
        height: newHeight,
      };
    });
  };

  const handleResetZoom = () => {
    setViewBox({ x: 0, y: 0, width: 950, height: 600 });
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.9 : 1.1;
    handleZoom(zoomFactor);
  };

  // Canvas background pointer down (for panning or adding node)
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    // If target is inside a node or edge group or toolbar, ignore
    const targetEl = e.target as HTMLElement;
    if (targetEl.closest('.cursor-pointer') || targetEl.closest('button')) {
      return;
    }

    const coords = clientToSvgCoords(e.clientX, e.clientY);

    if (selectedTool === 'add_node') {
      const nextNum = graph.nodes.length + 1;
      const newNodeId = `node_${Date.now().toString(36)}`;
      const newNodeLabel = `N${nextNum}`;

      // Default heuristic: straight distance to goal or 0
      const goalNode = graph.nodes.find((n) => n.id === graph.goalNodeId);
      let calculatedH = 0;
      if (goalNode) {
        calculatedH = Math.round(Math.hypot(coords.x - goalNode.x, coords.y - goalNode.y) / 5);
      }

      const newNode: GraphNode = {
        id: newNodeId,
        label: newNodeLabel,
        x: Math.round(coords.x),
        y: Math.round(coords.y),
        h: calculatedH,
      };

      onUpdateGraph((prev) => ({
        ...prev,
        nodes: [...prev.nodes, newNode],
      }));
      return;
    }

    if (selectedTool === 'select' || e.button === 1 || e.shiftKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const coords = clientToSvgCoords(e.clientX, e.clientY);
    setMousePos(coords);

    if (isPanning) {
      const dx = ((e.clientX - panStart.x) / (containerRef.current?.clientWidth || 1)) * viewBox.width;
      const dy = ((e.clientY - panStart.y) / (containerRef.current?.clientHeight || 1)) * viewBox.height;
      setViewBox((prev) => ({
        ...prev,
        x: prev.x - dx,
        y: prev.y - dy,
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
    } else if (draggingNodeId) {
      onUpdateGraph((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) =>
          n.id === draggingNodeId
            ? {
                ...n,
                x: Math.round(coords.x - dragOffset.x),
                y: Math.round(coords.y - dragOffset.y),
              }
            : n
        ),
      }));
    }
  };

  const handlePointerUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  // Node Click / Pointer Down
  const handleNodePointerDown = (e: React.PointerEvent, node: GraphNode) => {
    e.stopPropagation();

    if (selectedTool === 'select') {
      const coords = clientToSvgCoords(e.clientX, e.clientY);
      setDraggingNodeId(node.id);
      setDragOffset({ x: coords.x - node.x, y: coords.y - node.y });
      onSelectNode(node);
    } else if (selectedTool === 'add_edge') {
      if (!edgeStartNodeId) {
        setEdgeStartNodeId(node.id);
      } else if (edgeStartNodeId !== node.id) {
        // Complete edge creation
        const sourceNode = graph.nodes.find((n) => n.id === edgeStartNodeId);
        const targetNode = node;
        let defaultWeight = 1;
        if (sourceNode) {
          // Default weight roughly proportional to Euclidean distance
          defaultWeight = Math.max(1, Math.round(Math.hypot(sourceNode.x - targetNode.x, sourceNode.y - targetNode.y) / 6));
        }

        const newEdge: GraphEdge = {
          id: `edge_${Date.now().toString(36)}`,
          source: edgeStartNodeId,
          target: node.id,
          weight: defaultWeight,
          directed: false,
        };

        onUpdateGraph((prev) => {
          // Check if edge already exists
          const exists = prev.edges.some(
            (e) =>
              (e.source === newEdge.source && e.target === newEdge.target) ||
              (!e.directed && e.source === newEdge.target && e.target === newEdge.source)
          );
          if (exists) return prev;
          return {
            ...prev,
            edges: [...prev.edges, newEdge],
          };
        });
        setEdgeStartNodeId(null);
      }
    } else if (selectedTool === 'set_start') {
      onUpdateGraph((prev) => ({ ...prev, startNodeId: node.id }));
    } else if (selectedTool === 'set_goal') {
      onUpdateGraph((prev) => ({ ...prev, goalNodeId: node.id }));
    } else if (selectedTool === 'delete') {
      onUpdateGraph((prev) => ({
        ...prev,
        nodes: prev.nodes.filter((n) => n.id !== node.id),
        edges: prev.edges.filter((e) => e.source !== node.id && e.target !== node.id),
      }));
    }
  };

  // Edge Click
  const handleEdgeClick = (e: React.MouseEvent, edge: GraphEdge) => {
    e.stopPropagation();
    if (selectedTool === 'delete') {
      onUpdateGraph((prev) => ({
        ...prev,
        edges: prev.edges.filter((ed) => ed.id !== edge.id),
      }));
    } else {
      onSelectEdge(edge);
    }
  };

  // Auto-calculate Euclidean heuristics to goal
  const handleAutoHeuristics = () => {
    const goalNode = graph.nodes.find((n) => n.id === graph.goalNodeId);
    if (!goalNode) return;

    onUpdateGraph((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => {
        if (n.id === prev.goalNodeId) return { ...n, h: 0 };
        const dist = Math.hypot(n.x - goalNode.x, n.y - goalNode.y);
        // Admissible straight-line distance scaling
        return {
          ...n,
          h: Math.round(dist / 5),
        };
      }),
    }));
  };

  // Traversal state lookups
  const frontierNodeMap = new Map(
    activeStep?.frontier.map((item) => [item.nodeId, item]) || []
  );
  const visitedSet = new Set(activeStep?.visited || []);
  const currentVisitingId = activeStep?.currentVisitingId;
  const pathSet = new Set(activeStep?.pathFound || []);
  const activeEdge = activeStep?.activeEdge;

  // Render edge path line
  const edgeStartNode = edgeStartNodeId
    ? graph.nodes.find((n) => n.id === edgeStartNodeId)
    : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-950 overflow-hidden select-none"
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      data-testid="graph-canvas-container"
    >
      {/* Floating Canvas Action Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl backdrop-blur-md shadow-xl text-slate-200">
        <button
          onClick={() => setSelectedTool('select')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
            selectedTool === 'select'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
          title="Move & Select Nodes (Drag nodes)"
        >
          <Move size={14} />
          <span>Select / Move</span>
        </button>

        <button
          onClick={() => setSelectedTool('add_node')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
            selectedTool === 'add_node'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
          title="Click on canvas to add a new node"
        >
          <Plus size={14} />
          <span>Add Node</span>
        </button>

        <button
          onClick={() => {
            setSelectedTool('add_edge');
            setEdgeStartNodeId(null);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
            selectedTool === 'add_edge'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'hover:bg-slate-800 text-slate-300'
          }`}
          title="Click source node then click target node to create path"
        >
          <ArrowUpRight size={14} />
          <span>Add Edge</span>
        </button>

        <div className="w-px h-4 bg-slate-700 mx-0.5" />

        <button
          onClick={() => setSelectedTool('set_start')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
            selectedTool === 'set_start'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'hover:bg-slate-800 text-slate-300 hover:text-emerald-400'
          }`}
          title="Click any node to make it the Start node"
        >
          <Flag size={14} className="text-emerald-400" />
          <span>Set Start</span>
        </button>

        <button
          onClick={() => setSelectedTool('set_goal')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
            selectedTool === 'set_goal'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'hover:bg-slate-800 text-slate-300 hover:text-amber-400'
          }`}
          title="Click any node to make it the Goal node"
        >
          <Target size={14} className="text-amber-400" />
          <span>Set Goal</span>
        </button>

        <div className="w-px h-4 bg-slate-700 mx-0.5" />

        <button
          onClick={() => setSelectedTool('delete')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
            selectedTool === 'delete'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'hover:bg-slate-800 text-slate-300 hover:text-rose-400'
          }`}
          title="Click any node or edge to delete"
        >
          <Trash2 size={14} />
          <span>Delete</span>
        </button>
      </div>

      {/* Floating Zoom & Heuristic Helpers */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-700/80 rounded-xl backdrop-blur-md shadow-xl text-slate-200">
        <button
          onClick={handleAutoHeuristics}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-indigo-950/80 hover:text-indigo-300 border border-slate-700 hover:border-indigo-600 transition"
          title="Auto-calculate Euclidean distances to Goal as admissible h(n)"
        >
          <Sparkles size={13} className="text-indigo-400" />
          <span>Auto Heuristic h(n)</span>
        </button>

        <div className="w-px h-4 bg-slate-700 mx-0.5" />

        <button
          onClick={() => handleZoom(0.85)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition"
          aria-label="Zoom in"
          title="Zoom in"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => handleZoom(1.15)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition"
          aria-label="Zoom out"
          title="Zoom out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition"
          aria-label="Reset zoom"
          title="Reset zoom"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Mode Hint Banner */}
      {selectedTool === 'add_edge' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-indigo-900/90 border border-indigo-500/50 rounded-full text-indigo-100 text-xs font-medium shadow-lg backdrop-blur-md flex items-center gap-2">
          <ArrowUpRight size={14} className="text-indigo-300 animate-pulse" />
          {edgeStartNodeId ? (
            <span>
              Click target node to connect from{' '}
              <strong>{graph.nodes.find((n) => n.id === edgeStartNodeId)?.label}</strong>
            </span>
          ) : (
            <span>Click the first node to begin edge</span>
          )}
        </div>
      )}

      {selectedTool === 'add_node' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-indigo-900/90 border border-indigo-500/50 rounded-full text-indigo-100 text-xs font-medium shadow-lg backdrop-blur-md flex items-center gap-2">
          <Plus size={14} className="text-indigo-300 animate-bounce" />
          <span>Click anywhere on canvas to place a new node</span>
        </div>
      )}

      {/* SVG Canvas */}
      <svg
        className="w-full h-full cursor-crosshair"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      >
        <defs>
          {/* Grid pattern */}
          <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth="1"
            />
            <circle cx="0" cy="0" r="1" fill="rgba(255, 255, 255, 0.12)" />
          </pattern>

          {/* Marker for directed edges (default) */}
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
          </marker>

          {/* Marker for active edge traversal */}
          <marker
            id="arrow-active"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
          </marker>

          {/* Marker for final path */}
          <marker
            id="arrow-path"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
          </marker>

          {/* Glow filter */}
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-green" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Grid */}
        <rect
          x={viewBox.x - 2000}
          y={viewBox.y - 2000}
          width={viewBox.width + 4000}
          height={viewBox.height + 4000}
          fill="url(#graph-grid)"
        />

        {/* 1. EDGES LAYER */}
        <g className="edges-layer">
          {graph.edges.map((edge) => {
            const source = graph.nodes.find((n) => n.id === edge.source);
            const target = graph.nodes.find((n) => n.id === edge.target);
            if (!source || !target) return null;

            const isDirected = !!edge.directed;
            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2;

            // Check if this edge is active or in final path
            const isActiveEdge =
              activeEdge &&
              ((activeEdge.from === edge.source && activeEdge.to === edge.target) ||
                (!isDirected && activeEdge.from === edge.target && activeEdge.to === edge.source));

            // Check if edge is in final path
            let isInFinalPath = false;
            if (activeStep?.pathFound && activeStep.pathFound.length > 1) {
              const p = activeStep.pathFound;
              for (let i = 0; i < p.length - 1; i++) {
                if (
                  (p[i] === edge.source && p[i + 1] === edge.target) ||
                  (!isDirected && p[i] === edge.target && p[i + 1] === edge.source)
                ) {
                  isInFinalPath = true;
                  break;
                }
              }
            }

            let strokeColor = '#334155';
            let strokeWidth = 2;
            let marker = isDirected ? 'url(#arrow)' : undefined;

            if (isInFinalPath) {
              strokeColor = '#10b981';
              strokeWidth = 4;
              marker = isDirected ? 'url(#arrow-path)' : undefined;
            } else if (isActiveEdge) {
              strokeColor = '#38bdf8';
              strokeWidth = 3.5;
              marker = isDirected ? 'url(#arrow-active)' : undefined;
            }

            return (
              <g
                key={edge.id}
                onClick={(e) => handleEdgeClick(e, edge)}
                className="cursor-pointer group"
              >
                {/* Invisible wide hit area */}
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="transparent"
                  strokeWidth="16"
                />

                {/* Visible edge line */}
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  markerEnd={marker}
                  className={`transition-colors duration-200 ${
                    isInFinalPath ? 'animate-pulse' : ''
                  }`}
                  filter={isInFinalPath ? 'url(#glow-green)' : undefined}
                />

                {/* Edge Weight Pill Badge */}
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x="-18"
                    y="-11"
                    width="36"
                    height="22"
                    rx="11"
                    className={`transition-colors duration-150 ${
                      isInFinalPath
                        ? 'fill-emerald-950 stroke-emerald-500'
                        : isActiveEdge
                        ? 'fill-cyan-950 stroke-cyan-400'
                        : 'fill-slate-900/90 stroke-slate-700 hover:stroke-cyan-400 hover:fill-slate-800'
                    }`}
                    strokeWidth="1.5"
                  />
                  <text
                    textAnchor="middle"
                    dy="4"
                    className={`text-[11px] font-mono font-semibold pointer-events-none ${
                      isInFinalPath
                        ? 'fill-emerald-300 font-bold'
                        : isActiveEdge
                        ? 'fill-cyan-300 font-bold'
                        : 'fill-slate-300'
                    }`}
                  >
                    {edge.weight}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Temporary line when dragging out an edge */}
          {edgeStartNode && (
            <line
              x1={edgeStartNode.x}
              y1={edgeStartNode.y}
              x2={mousePos.x}
              y2={mousePos.y}
              stroke="#818cf8"
              strokeWidth="2.5"
              strokeDasharray="5,5"
              className="pointer-events-none"
            />
          )}
        </g>

        {/* 2. NODES LAYER */}
        <g className="nodes-layer">
          {graph.nodes.map((node) => {
            const isStart = node.id === graph.startNodeId;
            const isGoal = node.id === graph.goalNodeId;
            const isCurrentVisiting = currentVisitingId === node.id;
            const isInFrontier = frontierNodeMap.has(node.id);
            const isVisited = visitedSet.has(node.id);
            const isInPath = pathSet.has(node.id);
            const frontierData = frontierNodeMap.get(node.id);

            // Styling based on search state
            let fill = '#0f172a'; // slate-900
            let stroke = '#475569'; // slate-600
            let strokeWidth = 2;

            if (isInPath) {
              fill = '#064e3b'; // emerald-900
              stroke = '#10b981'; // emerald-500
              strokeWidth = 3.5;
            } else if (isCurrentVisiting) {
              fill = '#1e1b4b'; // indigo-950
              stroke = '#38bdf8'; // cyan-400
              strokeWidth = 4;
            } else if (isInFrontier) {
              fill = '#451a03'; // amber-950
              stroke = '#f59e0b'; // amber-500
              strokeWidth = 2.5;
            } else if (isVisited) {
              fill = '#1e293b'; // slate-800
              stroke = '#6366f1'; // indigo-500
              strokeWidth = 2;
            }

            if (isStart && !isInPath && !isCurrentVisiting) {
              stroke = '#10b981'; // emerald
              strokeWidth = 3;
            } else if (isGoal && !isInPath && !isCurrentVisiting) {
              stroke = '#f59e0b'; // amber
              strokeWidth = 3;
            }

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onPointerDown={(e) => handleNodePointerDown(e, node)}
                className="cursor-pointer group"
                role="button"
                tabIndex={0}
                aria-label={`Node ${node.label}, heuristic ${node.h}${isStart ? ', Start Node' : ''}${isGoal ? ', Goal Node' : ''}`}
              >
                {/* Active Visiting Pulse */}
                {isCurrentVisiting && (
                  <circle
                    r={NODE_RADIUS + 9}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    className="animate-ping opacity-60 pointer-events-none"
                  />
                )}

                {/* Final path glowing halo */}
                {isInPath && (
                  <circle
                    r={NODE_RADIUS + 6}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    className="opacity-70 pointer-events-none"
                    filter="url(#glow-green)"
                  />
                )}

                {/* Frontier dashed outer halo */}
                {isInFrontier && !isCurrentVisiting && (
                  <circle
                    r={NODE_RADIUS + 5}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="4,3"
                    className="animate-spin-slow pointer-events-none"
                  />
                )}

                {/* Node Main Circle */}
                <circle
                  r={NODE_RADIUS}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  className="transition-colors duration-200 group-hover:stroke-indigo-400 shadow-lg"
                />

                {/* Start / Goal Indicator Badge */}
                {isStart && (
                  <g transform="translate(-16, -38)">
                    <rect
                      x="0"
                      y="0"
                      width="32"
                      height="16"
                      rx="4"
                      fill="#059669"
                      className="shadow-md"
                    />
                    <text
                      x="16"
                      y="11"
                      textAnchor="middle"
                      className="text-[9px] font-bold fill-white uppercase tracking-wider"
                    >
                      START
                    </text>
                  </g>
                )}

                {isGoal && (
                  <g transform="translate(-14, -38)">
                    <rect
                      x="0"
                      y="0"
                      width="28"
                      height="16"
                      rx="4"
                      fill="#d97706"
                      className="shadow-md"
                    />
                    <text
                      x="14"
                      y="11"
                      textAnchor="middle"
                      className="text-[9px] font-bold fill-white uppercase tracking-wider"
                    >
                      GOAL
                    </text>
                  </g>
                )}

                {/* Node Name Label */}
                <text
                  textAnchor="middle"
                  dy={node.h !== undefined ? '-2' : '4'}
                  className="text-xs font-bold fill-slate-100 pointer-events-none select-none tracking-tight"
                >
                  {node.label.length > 8 ? `${node.label.slice(0, 7)}…` : node.label}
                </text>

                {/* Sub-label: Heuristic h(n) or Frontier f-cost */}
                {isInFrontier && frontierData ? (
                  <text
                    textAnchor="middle"
                    dy="13"
                    className="text-[10px] font-mono font-semibold fill-amber-300 pointer-events-none select-none"
                  >
                    f={frontierData.f.toFixed(0)}
                  </text>
                ) : (
                  <text
                    textAnchor="middle"
                    dy="13"
                    className="text-[9.5px] font-mono fill-slate-400 pointer-events-none select-none"
                  >
                    h={node.h}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
