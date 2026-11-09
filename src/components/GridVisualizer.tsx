import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  Flag,
  Target,
  Eraser,
  Flame,
  Grid,
} from 'lucide-react';
import confetti from 'canvas-confetti';

type CellType = 'empty' | 'wall' | 'weight';
type CellState = 'unvisited' | 'frontier' | 'visited' | 'path' | 'active';

interface GridCell {
  r: number;
  c: number;
  type: CellType;
  state: CellState;
  g: number;
  h: number;
  f: number;
  parent: { r: number; c: number } | null;
}

const ROWS = 20;
const COLS = 35;

export const GridVisualizer: React.FC = () => {
  const [grid, setGrid] = useState<GridCell[][]>(() => createInitialGrid());
  const [startPos, setStartPos] = useState({ r: 9, c: 5 });
  const [goalPos, setGoalPos] = useState({ r: 9, c: 29 });
  const [selectedAlgo, setSelectedAlgo] = useState<'astar' | 'gbfs' | 'dijkstra' | 'bfs' | 'dfs'>('astar');
  const [drawTool, setDrawTool] = useState<'wall' | 'weight' | 'erase' | 'start' | 'goal'>('wall');
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({ nodesVisited: 0, pathLength: 0, pathCost: 0 });

  const timerRef = useRef<number | null>(null);

  function createInitialGrid(): GridCell[][] {
    const cells: GridCell[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const row: GridCell[] = [];
      for (let c = 0; c < COLS; c++) {
        row.push({
          r,
          c,
          type: 'empty',
          state: 'unvisited',
          g: Infinity,
          h: 0,
          f: Infinity,
          parent: null,
        });
      }
      cells.push(row);
    }
    return cells;
  }

  // Clear visualization states while keeping walls
  const clearVisualization = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setGrid((prev) =>
      prev.map((row) =>
        row.map((cell) => ({
          ...cell,
          state: 'unvisited',
          g: Infinity,
          h: 0,
          f: Infinity,
          parent: null,
        }))
      )
    );
    setStats({ nodesVisited: 0, pathLength: 0, pathCost: 0 });
  };

  const clearAll = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setGrid(createInitialGrid());
    setStats({ nodesVisited: 0, pathLength: 0, pathCost: 0 });
  };

  // Heuristic calculation (Manhattan distance)
  const getHeuristic = (r: number, c: number) => {
    return Math.abs(r - goalPos.r) + Math.abs(c - goalPos.c);
  };

  // Handle cell paint
  const handleCellInteraction = (r: number, c: number) => {
    if (isRunning) return;
    if (r === startPos.r && c === startPos.c) return;
    if (r === goalPos.r && c === goalPos.c) return;

    if (drawTool === 'start') {
      setStartPos({ r, c });
      return;
    }
    if (drawTool === 'goal') {
      setGoalPos({ r, c });
      return;
    }

    setGrid((prev) => {
      const copy = prev.map((row) => [...row]);
      const cell = copy[r][c];
      if (drawTool === 'wall') {
        cell.type = cell.type === 'wall' ? 'empty' : 'wall';
      } else if (drawTool === 'weight') {
        cell.type = cell.type === 'weight' ? 'empty' : 'weight';
      } else if (drawTool === 'erase') {
        cell.type = 'empty';
      }
      return copy;
    });
  };

  // Generate a random maze
  const generateMaze = () => {
    clearVisualization();
    setGrid((prev) =>
      prev.map((row, r) =>
        row.map((cell, c) => {
          if ((r === startPos.r && c === startPos.c) || (r === goalPos.r && c === goalPos.c)) {
            return { ...cell, type: 'empty' };
          }
          // Simple procedural maze noise
          const isWall = Math.random() < 0.28;
          const isWeight = !isWall && Math.random() < 0.08;
          return {
            ...cell,
            type: isWall ? 'wall' : isWeight ? 'weight' : 'empty',
            state: 'unvisited',
          };
        })
      )
    );
  };

  // Execute Search Animation
  const runSearch = () => {
    clearVisualization();
    setIsRunning(true);

    const openList: Array<{ r: number; c: number; g: number; h: number; f: number }> = [];
    const closed = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    const parentMap: Record<string, { r: number; c: number } | null> = {};
    const costMap: Record<string, number> = {};

    const startKey = `${startPos.r},${startPos.c}`;
    const initialH = getHeuristic(startPos.r, startPos.c);
    costMap[startKey] = 0;
    parentMap[startKey] = null;

    openList.push({
      r: startPos.r,
      c: startPos.c,
      g: 0,
      h: initialH,
      f: selectedAlgo === 'gbfs' ? initialH : initialH,
    });

    const stepsToAnimate: Array<{
      type: 'visit' | 'frontier' | 'path';
      cells: Array<{ r: number; c: number }>;
    }> = [];

    let goalFound = false;
    let finalPath: Array<{ r: number; c: number }> = [];

    while (openList.length > 0) {
      // Sort openList based on algorithm
      if (selectedAlgo === 'astar') {
        openList.sort((a, b) => a.f - b.f || a.h - b.h);
      } else if (selectedAlgo === 'gbfs') {
        openList.sort((a, b) => a.h - b.h);
      } else if (selectedAlgo === 'dijkstra') {
        openList.sort((a, b) => a.g - b.g);
      } else if (selectedAlgo === 'dfs') {
        // LIFO: pop from end
      } else if (selectedAlgo === 'bfs') {
        // FIFO: shift from front (no sort needed)
      }

      const curr = selectedAlgo === 'dfs' ? openList.pop()! : openList.shift()!;
      if (closed[curr.r][curr.c]) continue;
      closed[curr.r][curr.c] = true;

      stepsToAnimate.push({
        type: 'visit',
        cells: [{ r: curr.r, c: curr.c }],
      });

      if (curr.r === goalPos.r && curr.c === goalPos.c) {
        goalFound = true;
        // Reconstruct path
        let track: { r: number; c: number } | null = { r: curr.r, c: curr.c };
        while (track) {
          finalPath.unshift(track);
          track = parentMap[`${track.r},${track.c}`];
        }
        break;
      }

      // Neighbors: 4 directions (Up, Right, Down, Left)
      const dr = [-1, 0, 1, 0];
      const dc = [0, 1, 0, -1];
      const newFrontiers: Array<{ r: number; c: number }> = [];

      for (let i = 0; i < 4; i++) {
        const nr = curr.r + dr[i];
        const nc = curr.c + dc[i];

        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
        if (closed[nr][nc]) continue;
        if (grid[nr][nc].type === 'wall') continue;

        const edgeWeight = grid[nr][nc].type === 'weight' ? 5 : 1;
        const tentativeG = curr.g + edgeWeight;
        const nKey = `${nr},${nc}`;

        if (costMap[nKey] === undefined || tentativeG < costMap[nKey]) {
          costMap[nKey] = tentativeG;
          parentMap[nKey] = { r: curr.r, c: curr.c };
          const hVal = getHeuristic(nr, nc);
          const fVal =
            selectedAlgo === 'astar'
              ? tentativeG + hVal
              : selectedAlgo === 'gbfs'
              ? hVal
              : tentativeG;

          openList.push({ r: nr, c: nc, g: tentativeG, h: hVal, f: fVal });
          newFrontiers.push({ r: nr, c: nc });
        }
      }

      if (newFrontiers.length > 0) {
        stepsToAnimate.push({ type: 'frontier', cells: newFrontiers });
      }
    }

    // Playback steps via interval
    let stepIdx = 0;
    let visitedCount = 0;

    timerRef.current = window.setInterval(() => {
      if (stepIdx >= stepsToAnimate.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRunning(false);

        if (goalFound) {
          // Highlight final path
          let cost = 0;
          finalPath.forEach((p) => {
            cost += grid[p.r][p.c].type === 'weight' ? 5 : 1;
          });
          setStats({
            nodesVisited: visitedCount,
            pathLength: finalPath.length,
            pathCost: cost,
          });

          setGrid((prev) => {
            const copy = prev.map((row) => [...row]);
            finalPath.forEach(({ r, c }) => {
              copy[r][c].state = 'path';
            });
            return copy;
          });

          try {
            confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
          } catch {}
        }
        return;
      }

      const step = stepsToAnimate[stepIdx];
      setGrid((prev) => {
        const copy = prev.map((row) => [...row]);
        step.cells.forEach(({ r, c }) => {
          if ((r !== startPos.r || c !== startPos.c) && (r !== goalPos.r || c !== goalPos.c)) {
            if (step.type === 'visit') {
              copy[r][c].state = 'visited';
            } else if (step.type === 'frontier' && copy[r][c].state !== 'visited') {
              copy[r][c].state = 'frontier';
            }
          }
        });
        return copy;
      });

      if (step.type === 'visit') visitedCount++;
      stepIdx++;
    }, 18);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto flex flex-col gap-4 text-slate-200">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Algorithm:
          </label>
          <select
            value={selectedAlgo}
            onChange={(e) => setSelectedAlgo(e.target.value as any)}
            disabled={isRunning}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-hidden focus:border-indigo-500"
          >
            <option value="astar">A* Search (f = g + h)</option>
            <option value="gbfs">Greedy Best-First (f = h)</option>
            <option value="dijkstra">Dijkstra / UCS (f = g)</option>
            <option value="bfs">Breadth-First Search (BFS)</option>
            <option value="dfs">Depth-First Search (DFS)</option>
          </select>
        </div>

        {/* Paint Tools */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setDrawTool('wall')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
              drawTool === 'wall'
                ? 'bg-slate-700 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid size={13} />
            <span>Wall</span>
          </button>
          <button
            onClick={() => setDrawTool('weight')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
              drawTool === 'weight'
                ? 'bg-amber-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame size={13} />
            <span>Mud (Cost 5)</span>
          </button>
          <button
            onClick={() => setDrawTool('erase')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
              drawTool === 'erase'
                ? 'bg-rose-700 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eraser size={13} />
            <span>Erase</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={generateMaze}
            disabled={isRunning}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700 flex items-center gap-1.5"
          >
            <Sparkles size={13} className="text-indigo-400" />
            <span>Generate Maze</span>
          </button>

          <button
            onClick={clearVisualization}
            disabled={isRunning}
            className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Clear visualization paths"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={runSearch}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition"
          >
            <Play size={14} className="fill-current" />
            <span>Find Path</span>
          </button>
        </div>
      </div>

      {/* Grid Canvas Surface */}
      <div
        className="overflow-x-auto bg-slate-950 p-4 rounded-xl border border-slate-800 select-none shadow-2xl flex flex-col items-center"
        onMouseDown={() => setIsMouseDown(true)}
        onMouseUp={() => setIsMouseDown(false)}
        onMouseLeave={() => setIsMouseDown(false)}
      >
        <div
          className="grid gap-[2px] bg-slate-900 border border-slate-800/80 p-1 rounded-md"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isStart = r === startPos.r && c === startPos.c;
              const isGoal = r === goalPos.r && c === goalPos.c;

              let bgClass = 'bg-slate-950 hover:bg-slate-800';

              if (isStart) {
                bgClass = 'bg-emerald-500 shadow-md animate-pulse';
              } else if (isGoal) {
                bgClass = 'bg-amber-500 shadow-md animate-pulse';
              } else if (cell.type === 'wall') {
                bgClass = 'bg-slate-700 border-slate-600';
              } else if (cell.type === 'weight') {
                bgClass = 'bg-amber-900/60 border border-amber-600/40 text-[9px] text-amber-300';
              } else if (cell.state === 'path') {
                bgClass = 'bg-emerald-400 shadow-sm transition-all duration-300';
              } else if (cell.state === 'visited') {
                bgClass = 'bg-indigo-900/70 border border-indigo-700/50';
              } else if (cell.state === 'frontier') {
                bgClass = 'bg-amber-500/40 border border-amber-400/60';
              }

              return (
                <div
                  key={`${r}-${c}`}
                  onMouseDown={() => handleCellInteraction(r, c)}
                  onMouseEnter={() => {
                    if (isMouseDown) handleCellInteraction(r, c);
                  }}
                  className={`w-6 h-6 rounded-xs flex items-center justify-center cursor-pointer transition-colors duration-75 text-[10px] ${bgClass}`}
                >
                  {isStart && <Flag size={12} className="text-white fill-white" />}
                  {isGoal && <Target size={12} className="text-slate-950 font-bold" />}
                  {cell.type === 'weight' && !isStart && !isGoal && '5'}
                </div>
              );
            })
          )}
        </div>

        {/* Stats Strip */}
        <div className="flex items-center gap-6 mt-4 text-xs font-mono text-slate-400">
          <div>
            Visited Cells: <strong className="text-indigo-400">{stats.nodesVisited}</strong>
          </div>
          <div>
            Path Length: <strong className="text-emerald-400">{stats.pathLength} cells</strong>
          </div>
          <div>
            Total Path Cost: <strong className="text-amber-400">{stats.pathCost}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
