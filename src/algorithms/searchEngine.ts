import {
  AlgorithmInfo,
  AlgorithmRunResult,
  AlgorithmType,
  FrontierItem,
  GraphData,
  SearchStep,
} from '../types/graph';

export const ALGORITHM_REGISTRY: Record<AlgorithmType, AlgorithmInfo> = {
  astar: {
    id: 'astar',
    name: 'A* Search',
    shortName: 'A*',
    formula: 'f(n) = g(n) + h(n)',
    isHeuristic: true,
    guaranteedOptimal: true,
    complete: true,
    timeComplexity: 'O(b^d)',
    spaceComplexity: 'O(b^d)',
    description:
      'Combines uniform cost search (past cost g) and greedy search (heuristic h). Guarantees the shortest path when the heuristic is admissible (never overestimates) and consistent.',
    pseudocode: [
      { line: 1, text: 'openSet = PriorityQueue(key = g + h)', indent: 0 },
      { line: 2, text: 'openSet.insert(start, g=0, f=h(start))', indent: 0 },
      { line: 3, text: 'while openSet is not empty:', indent: 0 },
      { line: 4, text: '  current = openSet.pop_min()', indent: 1 },
      { line: 5, text: '  if current == goal: return reconstruct_path()', indent: 1 },
      { line: 6, text: '  closedSet.add(current)', indent: 1 },
      { line: 7, text: '  for neighbor, cost in neighbors(current):', indent: 1 },
      { line: 8, text: '    if neighbor in closedSet: continue', indent: 2 },
      { line: 9, text: '    tentative_g = g[current] + cost', indent: 2 },
      { line: 10, text: '    if tentative_g < g[neighbor]:', indent: 2 },
      { line: 11, text: '      record_parent(neighbor, current)', indent: 3 },
      { line: 12, text: '      openSet.update_or_add(neighbor, g=tentative_g, f=g+h)', indent: 3 },
    ],
  },
  gbfs: {
    id: 'gbfs',
    name: 'Greedy Best-First Search',
    shortName: 'Greedy BFS',
    formula: 'f(n) = h(n)',
    isHeuristic: true,
    guaranteedOptimal: false,
    complete: false, // can get trapped in cycles if not tracking visited, or infinite branches
    timeComplexity: 'O(b^m)',
    spaceComplexity: 'O(b^m)',
    description:
      'Always expands the node that appears closest to the goal according to the heuristic h(n). Very fast in open spaces, but can be easily misled by local minima and does not guarantee optimal path cost.',
    pseudocode: [
      { line: 1, text: 'openSet = PriorityQueue(key = h(n))', indent: 0 },
      { line: 2, text: 'openSet.insert(start, f=h(start))', indent: 0 },
      { line: 3, text: 'while openSet is not empty:', indent: 0 },
      { line: 4, text: '  current = openSet.pop_min()', indent: 1 },
      { line: 5, text: '  if current == goal: return reconstruct_path()', indent: 1 },
      { line: 6, text: '  closedSet.add(current)', indent: 1 },
      { line: 7, text: '  for neighbor, cost in neighbors(current):', indent: 1 },
      { line: 8, text: '    if neighbor not in closedSet and neighbor not in openSet:', indent: 2 },
      { line: 9, text: '      record_parent(neighbor, current)', indent: 3 },
      { line: 10, text: '      openSet.insert(neighbor, f=h(neighbor))', indent: 3 },
    ],
  },
  dijkstra: {
    id: 'dijkstra',
    name: "Dijkstra's / Uniform Cost Search (UCS)",
    shortName: 'Dijkstra / UCS',
    formula: 'f(n) = g(n)',
    isHeuristic: false,
    guaranteedOptimal: true,
    complete: true,
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    description:
      'Expands nodes in order of cumulative path cost g(n) from the start node. Equivalent to A* where h(n) = 0 for all nodes. Guarantees finding the lowest cost path for non-negative edge costs.',
    pseudocode: [
      { line: 1, text: 'openSet = PriorityQueue(key = g(n))', indent: 0 },
      { line: 2, text: 'openSet.insert(start, g=0)', indent: 0 },
      { line: 3, text: 'while openSet is not empty:', indent: 0 },
      { line: 4, text: '  current = openSet.pop_min()', indent: 1 },
      { line: 5, text: '  if current == goal: return reconstruct_path()', indent: 1 },
      { line: 6, text: '  closedSet.add(current)', indent: 1 },
      { line: 7, text: '  for neighbor, cost in neighbors(current):', indent: 1 },
      { line: 8, text: '    tentative_g = g[current] + cost', indent: 2 },
      { line: 9, text: '    if tentative_g < g[neighbor]:', indent: 2 },
      { line: 10, text: '      record_parent(neighbor, current)', indent: 3 },
      { line: 11, text: '      openSet.update_or_add(neighbor, g=tentative_g)', indent: 3 },
    ],
  },
  bfs: {
    id: 'bfs',
    name: 'Breadth-First Search (BFS)',
    shortName: 'BFS',
    formula: 'f(n) = depth(n)',
    isHeuristic: false,
    guaranteedOptimal: true, // for unweighted graphs (step count)
    complete: true,
    timeComplexity: 'O(b^d)',
    spaceComplexity: 'O(b^d)',
    description:
      'Explores the graph level by level using a FIFO queue. Finds the path with the fewest edges/hops. Optimal when all edge costs are uniform (cost = 1).',
    pseudocode: [
      { line: 1, text: 'queue = FIFO_Queue()', indent: 0 },
      { line: 2, text: 'queue.push(start); visited.add(start)', indent: 0 },
      { line: 3, text: 'while queue is not empty:', indent: 0 },
      { line: 4, text: '  current = queue.pop_front()', indent: 1 },
      { line: 5, text: '  if current == goal: return reconstruct_path()', indent: 1 },
      { line: 6, text: '  for neighbor in neighbors(current):', indent: 1 },
      { line: 7, text: '    if neighbor not in visited:', indent: 2 },
      { line: 8, text: '      visited.add(neighbor); parent[neighbor] = current', indent: 3 },
      { line: 9, text: '      queue.push(neighbor)', indent: 3 },
    ],
  },
  dfs: {
    id: 'dfs',
    name: 'Depth-First Search (DFS)',
    shortName: 'DFS',
    formula: 'f(n) = -depth(n)',
    isHeuristic: false,
    guaranteedOptimal: false,
    complete: false, // in infinite graphs or if cycles not caught
    timeComplexity: 'O(b^m)',
    spaceComplexity: 'O(b * m)',
    description:
      'Explores as deep as possible along each branch before backtracking using a LIFO stack. Highly memory efficient O(b*m), but not optimal and can find very long paths.',
    pseudocode: [
      { line: 1, text: 'stack = LIFO_Stack()', indent: 0 },
      { line: 2, text: 'stack.push(start)', indent: 0 },
      { line: 3, text: 'while stack is not empty:', indent: 0 },
      { line: 4, text: '  current = stack.pop()', indent: 1 },
      { line: 5, text: '  if current in visited: continue', indent: 1 },
      { line: 6, text: '  visited.add(current)', indent: 1 },
      { line: 7, text: '  if current == goal: return reconstruct_path()', indent: 1 },
      { line: 8, text: '  for neighbor in reversed(neighbors(current)):', indent: 1 },
      { line: 9, text: '    if neighbor not in visited:', indent: 2 },
      { line: 10, text: '      parent[neighbor] = current; stack.push(neighbor)', indent: 3 },
    ],
  },
  bidirectional: {
    id: 'bidirectional',
    name: 'Bidirectional Search',
    shortName: 'Bidirectional',
    formula: 'Simultaneous 2-way BFS',
    isHeuristic: false,
    guaranteedOptimal: true, // for uniform costs
    complete: true,
    timeComplexity: 'O(b^(d/2))',
    spaceComplexity: 'O(b^(d/2))',
    description:
      'Runs two simultaneous searches: one forward from the start node and one backward from the goal node, stopping when the two frontiers intersect. Reduces search space exponentially from b^d to 2*b^(d/2).',
    pseudocode: [
      { line: 1, text: 'q_start = [start]; q_goal = [goal]', indent: 0 },
      { line: 2, text: 'visited_fwd = {start}; visited_bwd = {goal}', indent: 0 },
      { line: 3, text: 'while q_start and q_goal:', indent: 0 },
      { line: 4, text: '  curr_f = q_start.pop(); expand(curr_f, fwd)', indent: 1 },
      { line: 5, text: '  if curr_f in visited_bwd: return connect_paths()', indent: 1 },
      { line: 6, text: '  curr_b = q_goal.pop(); expand(curr_b, bwd)', indent: 1 },
      { line: 7, text: '  if curr_b in visited_fwd: return connect_paths()', indent: 1 },
    ],
  },
  iddfs: {
    id: 'iddfs',
    name: 'Iterative Deepening Search (IDDFS)',
    shortName: 'IDDFS',
    formula: 'Successive Depth-Limited DFS (limit=0, 1, 2...)',
    isHeuristic: false,
    guaranteedOptimal: true, // for uniform hop costs
    complete: true,
    timeComplexity: 'O(b^d)',
    spaceComplexity: 'O(b * d)',
    description:
      'Performs successive depth-limited searches with increasing limits (0, 1, 2, ...). Combines the memory efficiency of DFS (O(b*d)) with the completeness and optimality of BFS.',
    pseudocode: [
      { line: 1, text: 'for depth_limit = 0 to max_depth:', indent: 0 },
      { line: 2, text: '  result = DepthLimitedSearch(start, goal, depth_limit)', indent: 1 },
      { line: 3, text: '  if result is found: return result', indent: 1 },
      { line: 4, text: '  clear_visited_for_next_iteration()', indent: 1 },
      { line: 5, text: 'return no_path', indent: 0 },
    ],
  },
};

// Helper: Get adjacent nodes and weights
export function getNeighbors(
  graph: GraphData,
  nodeId: string,
  reverse: boolean = false
): Array<{ targetId: string; weight: number }> {
  const neighbors: Array<{ targetId: string; weight: number }> = [];

  for (const edge of graph.edges) {
    if (!reverse) {
      if (edge.source === nodeId) {
        neighbors.push({ targetId: edge.target, weight: edge.weight });
      } else if (!edge.directed && edge.target === nodeId) {
        neighbors.push({ targetId: edge.source, weight: edge.weight });
      }
    } else {
      // In reverse mode (for backward search in directed graphs)
      if (edge.target === nodeId) {
        neighbors.push({ targetId: edge.source, weight: edge.weight });
      } else if (!edge.directed && edge.source === nodeId) {
        neighbors.push({ targetId: edge.target, weight: edge.weight });
      }
    }
  }

  // Sort neighbors by label alphabetically for deterministic traversal
  neighbors.sort((a, b) => {
    const nodeA = graph.nodes.find((n) => n.id === a.targetId);
    const nodeB = graph.nodes.find((n) => n.id === b.targetId);
    const labelA = nodeA ? nodeA.label : a.targetId;
    const labelB = nodeB ? nodeB.label : b.targetId;
    return labelA.localeCompare(labelB);
  });

  return neighbors;
}

export function reconstructPath(
  parents: Record<string, string | null>,
  currentId: string
): string[] {
  const path: string[] = [currentId];
  let curr: string | null = currentId;
  while (curr !== null && parents[curr] !== null && parents[curr] !== undefined) {
    curr = parents[curr];
    if (curr) {
      path.unshift(curr);
      // Guard against accidental cycles
      if (path.length > 200) break;
    }
  }
  return path;
}

export function calculatePathCost(graph: GraphData, path: string[]): number {
  if (path.length <= 1) return 0;
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i];
    const v = path[i + 1];
    const edge = graph.edges.find(
      (e) =>
        (e.source === u && e.target === v) ||
        (!e.directed && e.source === v && e.target === u)
    );
    total += edge ? edge.weight : 1;
  }
  return total;
}

// Map node IDs to heuristics
export function getHeuristicMap(graph: GraphData): Record<string, number> {
  const map: Record<string, number> = {};
  for (const n of graph.nodes) {
    map[n.id] = typeof n.h === 'number' ? n.h : 0;
  }
  return map;
}

/**
 * A* SEARCH
 */
export function runAStar(graph: GraphData): AlgorithmRunResult {
  const startTime = performance.now();
  const steps: SearchStep[] = [];
  const { startNodeId, goalNodeId, nodes } = graph;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const hMap = getHeuristicMap(graph);

  const gScores: Record<string, number> = {};
  const fScores: Record<string, number> = {};
  const parents: Record<string, string | null> = {};

  for (const n of nodes) {
    gScores[n.id] = Infinity;
    fScores[n.id] = Infinity;
    parents[n.id] = null;
  }

  gScores[startNodeId] = 0;
  fScores[startNodeId] = hMap[startNodeId] ?? 0;

  const openSet: FrontierItem[] = [
    {
      nodeId: startNodeId,
      g: 0,
      h: hMap[startNodeId] ?? 0,
      f: fScores[startNodeId],
      parentId: null,
      priorityKey: fScores[startNodeId],
    },
  ];

  const closedSet = new Set<string>();
  const visitedOrder: string[] = [];
  let maxFrontierSize = openSet.length;
  let finalPath: string[] | null = null;
  let totalCost = 0;

  // Step 0: Initial step
  steps.push({
    stepIndex: steps.length,
    phase: 'initial',
    currentVisitingId: null,
    activeEdge: null,
    frontier: [...openSet],
    visited: [...visitedOrder],
    gScores: { ...gScores },
    hScores: { ...hMap },
    fScores: { ...fScores },
    parents: { ...parents },
    explanation: `Initialized A* Search at Start node "${nodeMap.get(startNodeId)?.label || startNodeId}". g=0, h=${hMap[startNodeId] ?? 0}, f=${fScores[startNodeId]}. Added to Open Set.`,
    pseudocodeLine: 2,
    pathFound: null,
    totalCost: null,
  });

  while (openSet.length > 0) {
    maxFrontierSize = Math.max(maxFrontierSize, openSet.length);

    // Sort openSet by f ascending; tie-break by lower h, then by label
    openSet.sort((a, b) => {
      if (Math.abs(a.f - b.f) > 0.0001) return a.f - b.f;
      if (Math.abs(a.h - b.h) > 0.0001) return a.h - b.h;
      const labelA = nodeMap.get(a.nodeId)?.label || a.nodeId;
      const labelB = nodeMap.get(b.nodeId)?.label || b.nodeId;
      return labelA.localeCompare(labelB);
    });

    // Pop the node with lowest f
    const currentItem = openSet.shift()!;
    const currentId = currentItem.nodeId;
    const currentLabel = nodeMap.get(currentId)?.label || currentId;

    // Check if goal reached
    if (currentId === goalNodeId) {
      closedSet.add(currentId);
      if (!visitedOrder.includes(currentId)) visitedOrder.push(currentId);
      finalPath = reconstructPath(parents, currentId);
      totalCost = gScores[currentId];

      steps.push({
        stepIndex: steps.length,
        phase: 'goal_reached',
        currentVisitingId: currentId,
        activeEdge: null,
        frontier: [...openSet],
        visited: [...visitedOrder],
        gScores: { ...gScores },
        hScores: { ...hMap },
        fScores: { ...fScores },
        parents: { ...parents },
        explanation: `Goal node "${currentLabel}" reached! Lowest f-score (${currentItem.f.toFixed(1)}) in the Open Set popped. Optimal path found with total cost = ${totalCost}.`,
        pseudocodeLine: 5,
        pathFound: finalPath,
        totalCost,
      });
      break;
    }

    closedSet.add(currentId);
    if (!visitedOrder.includes(currentId)) visitedOrder.push(currentId);

    // Step: Picked minimum node
    steps.push({
      stepIndex: steps.length,
      phase: 'pick_node',
      currentVisitingId: currentId,
      activeEdge: null,
      frontier: [...openSet],
      visited: [...visitedOrder],
      gScores: { ...gScores },
      hScores: { ...hMap },
      fScores: { ...fScores },
      parents: { ...parents },
      explanation: `Selected node "${currentLabel}" with minimum f=${currentItem.f.toFixed(1)} (g=${currentItem.g.toFixed(1)} + h=${currentItem.h.toFixed(1)}). Moved to Closed Set.`,
      pseudocodeLine: 4,
      pathFound: null,
      totalCost: null,
    });

    const neighbors = getNeighbors(graph, currentId);

    for (const { targetId, weight } of neighbors) {
      const neighborLabel = nodeMap.get(targetId)?.label || targetId;

      if (closedSet.has(targetId)) {
        steps.push({
          stepIndex: steps.length,
          phase: 'examine_neighbor',
          currentVisitingId: currentId,
          activeEdge: { from: currentId, to: targetId },
          frontier: [...openSet],
          visited: [...visitedOrder],
          gScores: { ...gScores },
          hScores: { ...hMap },
          fScores: { ...fScores },
          parents: { ...parents },
          examiningNeighborId: targetId,
          explanation: `Inspecting neighbor "${neighborLabel}" (edge cost ${weight}). Already evaluated in Closed Set. Skipped.`,
          pseudocodeLine: 8,
          pathFound: null,
          totalCost: null,
        });
        continue;
      }

      const tentativeG = gScores[currentId] + weight;
      const isBetter = tentativeG < gScores[targetId];

      if (isBetter) {
        parents[targetId] = currentId;
        gScores[targetId] = tentativeG;
        const hVal = hMap[targetId] ?? 0;
        const newF = tentativeG + hVal;
        fScores[targetId] = newF;

        // Update or add to openSet
        const existingIdx = openSet.findIndex((item) => item.nodeId === targetId);
        if (existingIdx >= 0) {
          openSet[existingIdx] = {
            nodeId: targetId,
            g: tentativeG,
            h: hVal,
            f: newF,
            parentId: currentId,
            priorityKey: newF,
          };
          steps.push({
            stepIndex: steps.length,
            phase: 'update_frontier',
            currentVisitingId: currentId,
            activeEdge: { from: currentId, to: targetId },
            frontier: [...openSet],
            visited: [...visitedOrder],
            gScores: { ...gScores },
            hScores: { ...hMap },
            fScores: { ...fScores },
            parents: { ...parents },
            examiningNeighborId: targetId,
            explanation: `Found shorter path to "${neighborLabel}" via "${currentLabel}": new g=${tentativeG.toFixed(1)}, h=${hVal}, new f=${newF.toFixed(1)}. Updated Open Set entry.`,
            pseudocodeLine: 12,
            pathFound: null,
            totalCost: null,
          });
        } else {
          openSet.push({
            nodeId: targetId,
            g: tentativeG,
            h: hVal,
            f: newF,
            parentId: currentId,
            priorityKey: newF,
          });
          steps.push({
            stepIndex: steps.length,
            phase: 'update_frontier',
            currentVisitingId: currentId,
            activeEdge: { from: currentId, to: targetId },
            frontier: [...openSet],
            visited: [...visitedOrder],
            gScores: { ...gScores },
            hScores: { ...hMap },
            fScores: { ...fScores },
            parents: { ...parents },
            examiningNeighborId: targetId,
            explanation: `Discovered neighbor "${neighborLabel}". Path cost g=${tentativeG.toFixed(1)}, h=${hVal}, f=${newF.toFixed(1)}. Added to Open Set.`,
            pseudocodeLine: 12,
            pathFound: null,
            totalCost: null,
          });
        }
      } else {
        steps.push({
          stepIndex: steps.length,
          phase: 'examine_neighbor',
          currentVisitingId: currentId,
          activeEdge: { from: currentId, to: targetId },
          frontier: [...openSet],
          visited: [...visitedOrder],
          gScores: { ...gScores },
          hScores: { ...hMap },
          fScores: { ...fScores },
          parents: { ...parents },
          examiningNeighborId: targetId,
          explanation: `Neighbor "${neighborLabel}" tentative g=${tentativeG.toFixed(1)} >= current known g=${gScores[targetId].toFixed(1)}. Not updated.`,
          pseudocodeLine: 10,
          pathFound: null,
          totalCost: null,
        });
      }
    }
  }

  if (!finalPath) {
    steps.push({
      stepIndex: steps.length,
      phase: 'no_path',
      currentVisitingId: null,
      activeEdge: null,
      frontier: [],
      visited: [...visitedOrder],
      gScores: { ...gScores },
      hScores: { ...hMap },
      fScores: { ...fScores },
      parents: { ...parents },
      explanation: `Open Set is exhausted and goal "${nodeMap.get(goalNodeId)?.label || goalNodeId}" was never reached. No valid path exists!`,
      pseudocodeLine: 3,
      pathFound: null,
      totalCost: null,
    });
  }

  const executionTimeMs = performance.now() - startTime;
  return {
    steps,
    path: finalPath,
    totalCost,
    nodesExpanded: visitedOrder.length,
    maxFrontierSize,
    success: finalPath !== null,
    executionTimeMs,
  };
}

/**
 * GREEDY BEST-FIRST SEARCH (GBFS)
 * f(n) = h(n)
 */
export function runGBFS(graph: GraphData): AlgorithmRunResult {
  const startTime = performance.now();
  const steps: SearchStep[] = [];
  const { startNodeId, goalNodeId, nodes } = graph;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const hMap = getHeuristicMap(graph);

  const gScores: Record<string, number> = {};
  const fScores: Record<string, number> = {};
  const parents: Record<string, string | null> = {};

  for (const n of nodes) {
    gScores[n.id] = Infinity;
    fScores[n.id] = hMap[n.id] ?? 0;
    parents[n.id] = null;
  }

  gScores[startNodeId] = 0;
  const startH = hMap[startNodeId] ?? 0;
  fScores[startNodeId] = startH;

  const openSet: FrontierItem[] = [
    {
      nodeId: startNodeId,
      g: 0,
      h: startH,
      f: startH,
      parentId: null,
      priorityKey: startH,
    },
  ];

  const closedSet = new Set<string>();
  const visitedOrder: string[] = [];
  let maxFrontierSize = 1;
  let finalPath: string[] | null = null;
  let totalCost = 0;

  steps.push({
    stepIndex: steps.length,
    phase: 'initial',
    currentVisitingId: null,
    activeEdge: null,
    frontier: [...openSet],
    visited: [...visitedOrder],
    gScores: { ...gScores },
    hScores: { ...hMap },
    fScores: { ...fScores },
    parents: { ...parents },
    explanation: `Initialized Greedy Best-First Search with Start node "${nodeMap.get(startNodeId)?.label || startNodeId}". Heuristic h=${startH}. In Greedy BFS, priority is solely f(n) = h(n).`,
    pseudocodeLine: 2,
    pathFound: null,
    totalCost: null,
  });

  while (openSet.length > 0) {
    maxFrontierSize = Math.max(maxFrontierSize, openSet.length);

    // Greedy prioritizes strictly by h(n)
    openSet.sort((a, b) => {
      if (Math.abs(a.h - b.h) > 0.0001) return a.h - b.h;
      const labelA = nodeMap.get(a.nodeId)?.label || a.nodeId;
      const labelB = nodeMap.get(b.nodeId)?.label || b.nodeId;
      return labelA.localeCompare(labelB);
    });

    const currentItem = openSet.shift()!;
    const currentId = currentItem.nodeId;
    const currentLabel = nodeMap.get(currentId)?.label || currentId;

    if (currentId === goalNodeId) {
      closedSet.add(currentId);
      if (!visitedOrder.includes(currentId)) visitedOrder.push(currentId);
      finalPath = reconstructPath(parents, currentId);
      totalCost = calculatePathCost(graph, finalPath);

      steps.push({
        stepIndex: steps.length,
        phase: 'goal_reached',
        currentVisitingId: currentId,
        activeEdge: null,
        frontier: [...openSet],
        visited: [...visitedOrder],
        gScores: { ...gScores },
        hScores: { ...hMap },
        fScores: { ...fScores },
        parents: { ...parents },
        explanation: `Goal node "${currentLabel}" reached! Greedy Best-First completed. Path cost: ${totalCost}. Notice Greedy may not produce the optimal cost path if the heuristic was deceptive!`,
        pseudocodeLine: 5,
        pathFound: finalPath,
        totalCost,
      });
      break;
    }

    closedSet.add(currentId);
    if (!visitedOrder.includes(currentId)) visitedOrder.push(currentId);

    steps.push({
      stepIndex: steps.length,
      phase: 'pick_node',
      currentVisitingId: currentId,
      activeEdge: null,
      frontier: [...openSet],
      visited: [...visitedOrder],
      gScores: { ...gScores },
      hScores: { ...hMap },
      fScores: { ...fScores },
      parents: { ...parents },
      explanation: `Expanding node "${currentLabel}" with minimum h=${currentItem.h.toFixed(1)}. Note: g(n) is ignored in Greedy selection.`,
      pseudocodeLine: 4,
      pathFound: null,
      totalCost: null,
    });

    const neighbors = getNeighbors(graph, currentId);

    for (const { targetId, weight } of neighbors) {
      const neighborLabel = nodeMap.get(targetId)?.label || targetId;

      if (closedSet.has(targetId)) {
        steps.push({
          stepIndex: steps.length,
          phase: 'examine_neighbor',
          currentVisitingId: currentId,
          activeEdge: { from: currentId, to: targetId },
          frontier: [...openSet],
          visited: [...visitedOrder],
          gScores: { ...gScores },
          hScores: { ...hMap },
          fScores: { ...fScores },
          parents: { ...parents },
          examiningNeighborId: targetId,
          explanation: `Inspecting neighbor "${neighborLabel}". Already closed, skipped.`,
          pseudocodeLine: 8,
          pathFound: null,
          totalCost: null,
        });
        continue;
      }

      const inFrontier = openSet.some((item) => item.nodeId === targetId);
      if (!inFrontier) {
        parents[targetId] = currentId;
        const currentG = gScores[currentId] !== Infinity ? gScores[currentId] : 0;
        gScores[targetId] = currentG + weight;
        const hVal = hMap[targetId] ?? 0;
        fScores[targetId] = hVal;

        openSet.push({
          nodeId: targetId,
          g: gScores[targetId],
          h: hVal,
          f: hVal,
          parentId: currentId,
          priorityKey: hVal,
        });

        steps.push({
          stepIndex: steps.length,
          phase: 'update_frontier',
          currentVisitingId: currentId,
          activeEdge: { from: currentId, to: targetId },
          frontier: [...openSet],
          visited: [...visitedOrder],
          gScores: { ...gScores },
          hScores: { ...hMap },
          fScores: { ...fScores },
          parents: { ...parents },
          examiningNeighborId: targetId,
          explanation: `Added neighbor "${neighborLabel}" to Open Set with h=${hVal.toFixed(1)} (path cost so far g=${gScores[targetId].toFixed(1)}).`,
          pseudocodeLine: 10,
          pathFound: null,
          totalCost: null,
        });
      }
    }
  }

  if (!finalPath) {
    steps.push({
      stepIndex: steps.length,
      phase: 'no_path',
      currentVisitingId: null,
      activeEdge: null,
      frontier: [],
      visited: [...visitedOrder],
      gScores: { ...gScores },
      hScores: { ...hMap },
      fScores: { ...fScores },
      parents: { ...parents },
      explanation: `No path to goal found. Open Set empty.`,
      pseudocodeLine: 3,
      pathFound: null,
      totalCost: null,
    });
  }

  return {
    steps,
    path: finalPath,
    totalCost,
    nodesExpanded: visitedOrder.length,
    maxFrontierSize,
    success: finalPath !== null,
    executionTimeMs: performance.now() - startTime,
  };
}

/**
 * DIJKSTRA / UNIFORM COST SEARCH
 * f(n) = g(n), h(n) = 0
 */
export function runDijkstra(graph: GraphData): AlgorithmRunResult {
  const startTime = performance.now();
  const steps: SearchStep[] = [];
  const { startNodeId, goalNodeId, nodes } = graph;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const zeroH: Record<string, number> = {};
  for (const n of nodes) zeroH[n.id] = 0;

  const gScores: Record<string, number> = {};
  const fScores: Record<string, number> = {};
  const parents: Record<string, string | null> = {};

  for (const n of nodes) {
    gScores[n.id] = Infinity;
    fScores[n.id] = Infinity;
    parents[n.id] = null;
  }

  gScores[startNodeId] = 0;
  fScores[startNodeId] = 0;

  const openSet: FrontierItem[] = [
    {
      nodeId: startNodeId,
      g: 0,
      h: 0,
      f: 0,
      parentId: null,
      priorityKey: 0,
    },
  ];

  const closedSet = new Set<string>();
  const visitedOrder: string[] = [];
  let maxFrontierSize = 1;
  let finalPath: string[] | null = null;
  let totalCost = 0;

  steps.push({
    stepIndex: steps.length,
    phase: 'initial',
    currentVisitingId: null,
    activeEdge: null,
    frontier: [...openSet],
    visited: [...visitedOrder],
    gScores: { ...gScores },
    hScores: zeroH,
    fScores: { ...fScores },
    parents: { ...parents },
    explanation: `Initialized Dijkstra / Uniform Cost Search from "${nodeMap.get(startNodeId)?.label || startNodeId}" with g=0. Evaluates purely cumulative cost g(n) without heuristic guidance.`,
    pseudocodeLine: 2,
    pathFound: null,
    totalCost: null,
  });

  while (openSet.length > 0) {
    maxFrontierSize = Math.max(maxFrontierSize, openSet.length);

    openSet.sort((a, b) => {
      if (Math.abs(a.g - b.g) > 0.0001) return a.g - b.g;
      const labelA = nodeMap.get(a.nodeId)?.label || a.nodeId;
      const labelB = nodeMap.get(b.nodeId)?.label || b.nodeId;
      return labelA.localeCompare(labelB);
    });

    const currentItem = openSet.shift()!;
    const currentId = currentItem.nodeId;
    const currentLabel = nodeMap.get(currentId)?.label || currentId;

    if (currentId === goalNodeId) {
      closedSet.add(currentId);
      if (!visitedOrder.includes(currentId)) visitedOrder.push(currentId);
      finalPath = reconstructPath(parents, currentId);
      totalCost = gScores[currentId];

      steps.push({
        stepIndex: steps.length,
        phase: 'goal_reached',
        currentVisitingId: currentId,
        activeEdge: null,
        frontier: [...openSet],
        visited: [...visitedOrder],
        gScores: { ...gScores },
        hScores: zeroH,
        fScores: { ...fScores },
        parents: { ...parents },
        explanation: `Goal "${currentLabel}" popped from Priority Queue with lowest cost g=${totalCost}. Dijkstra guarantees this is the minimum cost path!`,
        pseudocodeLine: 5,
        pathFound: finalPath,
        totalCost,
      });
      break;
    }

    closedSet.add(currentId);
    if (!visitedOrder.includes(currentId)) visitedOrder.push(currentId);

    steps.push({
      stepIndex: steps.length,
      phase: 'pick_node',
      currentVisitingId: currentId,
      activeEdge: null,
      frontier: [...openSet],
      visited: [...visitedOrder],
      gScores: { ...gScores },
      hScores: zeroH,
      fScores: { ...fScores },
      parents: { ...parents },
      explanation: `Expanded node "${currentLabel}" with lowest path cost g=${currentItem.g.toFixed(1)}.`,
      pseudocodeLine: 4,
      pathFound: null,
      totalCost: null,
    });

    const neighbors = getNeighbors(graph, currentId);

    for (const { targetId, weight } of neighbors) {
      const neighborLabel = nodeMap.get(targetId)?.label || targetId;

      if (closedSet.has(targetId)) {
        steps.push({
          stepIndex: steps.length,
          phase: 'examine_neighbor',
          currentVisitingId: currentId,
          activeEdge: { from: currentId, to: targetId },
          frontier: [...openSet],
          visited: [...visitedOrder],
          gScores: { ...gScores },
          hScores: zeroH,
          fScores: { ...fScores },
          parents: { ...parents },
          examiningNeighborId: targetId,
          explanation: `Neighbor "${neighborLabel}" already in Closed Set. Skipped.`,
          pseudocodeLine: 7,
          pathFound: null,
          totalCost: null,
        });
        continue;
      }

      const tentativeG = gScores[currentId] + weight;

      if (tentativeG < gScores[targetId]) {
        parents[targetId] = currentId;
        gScores[targetId] = tentativeG;
        fScores[targetId] = tentativeG;

        const existingIdx = openSet.findIndex((item) => item.nodeId === targetId);
        if (existingIdx >= 0) {
          openSet[existingIdx] = {
            nodeId: targetId,
            g: tentativeG,
            h: 0,
            f: tentativeG,
            parentId: currentId,
            priorityKey: tentativeG,
          };
          steps.push({
            stepIndex: steps.length,
            phase: 'update_frontier',
            currentVisitingId: currentId,
            activeEdge: { from: currentId, to: targetId },
            frontier: [...openSet],
            visited: [...visitedOrder],
            gScores: { ...gScores },
            hScores: zeroH,
            fScores: { ...fScores },
            parents: { ...parents },
            examiningNeighborId: targetId,
            explanation: `Relaxed edge to "${neighborLabel}": new cheaper path cost g=${tentativeG.toFixed(1)} via "${currentLabel}".`,
            pseudocodeLine: 11,
            pathFound: null,
            totalCost: null,
          });
        } else {
          openSet.push({
            nodeId: targetId,
            g: tentativeG,
            h: 0,
            f: tentativeG,
            parentId: currentId,
            priorityKey: tentativeG,
          });
          steps.push({
            stepIndex: steps.length,
            phase: 'update_frontier',
            currentVisitingId: currentId,
            activeEdge: { from: currentId, to: targetId },
            frontier: [...openSet],
            visited: [...visitedOrder],
            gScores: { ...gScores },
            hScores: zeroH,
            fScores: { ...fScores },
            parents: { ...parents },
            examiningNeighborId: targetId,
            explanation: `Added "${neighborLabel}" to priority queue with path cost g=${tentativeG.toFixed(1)}.`,
            pseudocodeLine: 11,
            pathFound: null,
            totalCost: null,
          });
        }
      }
    }
  }

  return {
    steps,
    path: finalPath,
    totalCost,
    nodesExpanded: visitedOrder.length,
    maxFrontierSize,
    success: finalPath !== null,
    executionTimeMs: performance.now() - startTime,
  };
}

/**
 * BREADTH-FIRST SEARCH (BFS)
 */
export function runBFS(graph: GraphData): AlgorithmRunResult {
  const startTime = performance.now();
  const steps: SearchStep[] = [];
  const { startNodeId, goalNodeId, nodes } = graph;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const zeroH: Record<string, number> = {};
  const depthScores: Record<string, number> = {};
  const parents: Record<string, string | null> = {};

  for (const n of nodes) {
    zeroH[n.id] = 0;
    depthScores[n.id] = Infinity;
    parents[n.id] = null;
  }

  depthScores[startNodeId] = 0;

  const queue: FrontierItem[] = [
    {
      nodeId: startNodeId,
      g: 0,
      h: 0,
      f: 0,
      parentId: null,
    },
  ];

  const visitedSet = new Set<string>([startNodeId]);
  const visitedOrder: string[] = [];
  let maxFrontierSize = 1;
  let finalPath: string[] | null = null;
  let totalCost = 0;

  steps.push({
    stepIndex: steps.length,
    phase: 'initial',
    currentVisitingId: null,
    activeEdge: null,
    frontier: [...queue],
    visited: [...visitedOrder],
    gScores: { ...depthScores },
    hScores: zeroH,
    fScores: { ...depthScores },
    parents: { ...parents },
    explanation: `Initialized BFS with Start node "${nodeMap.get(startNodeId)?.label || startNodeId}". Using FIFO queue.`,
    pseudocodeLine: 2,
    pathFound: null,
    totalCost: null,
  });

  while (queue.length > 0) {
    maxFrontierSize = Math.max(maxFrontierSize, queue.length);
    const currentItem = queue.shift()!;
    const currentId = currentItem.nodeId;
    const currentLabel = nodeMap.get(currentId)?.label || currentId;

    if (!visitedOrder.includes(currentId)) visitedOrder.push(currentId);

    if (currentId === goalNodeId) {
      finalPath = reconstructPath(parents, currentId);
      totalCost = calculatePathCost(graph, finalPath);

      steps.push({
        stepIndex: steps.length,
        phase: 'goal_reached',
        currentVisitingId: currentId,
        activeEdge: null,
        frontier: [...queue],
        visited: [...visitedOrder],
        gScores: { ...depthScores },
        hScores: zeroH,
        fScores: { ...depthScores },
        parents: { ...parents },
        explanation: `Goal node "${currentLabel}" reached! BFS guarantees shortest path by number of hops (${finalPath.length - 1} hops). Total edge cost: ${totalCost}.`,
        pseudocodeLine: 5,
        pathFound: finalPath,
        totalCost,
      });
      break;
    }

    steps.push({
      stepIndex: steps.length,
      phase: 'pick_node',
      currentVisitingId: currentId,
      activeEdge: null,
      frontier: [...queue],
      visited: [...visitedOrder],
      gScores: { ...depthScores },
      hScores: zeroH,
      fScores: { ...depthScores },
      parents: { ...parents },
      explanation: `Popped node "${currentLabel}" from front of FIFO queue (depth ${depthScores[currentId]}).`,
      pseudocodeLine: 4,
      pathFound: null,
      totalCost: null,
    });

    const neighbors = getNeighbors(graph, currentId);

    for (const { targetId } of neighbors) {
      const neighborLabel = nodeMap.get(targetId)?.label || targetId;

      if (!visitedSet.has(targetId)) {
        visitedSet.add(targetId);
        parents[targetId] = currentId;
        depthScores[targetId] = depthScores[currentId] + 1;

        queue.push({
          nodeId: targetId,
          g: depthScores[targetId],
          h: 0,
          f: depthScores[targetId],
          parentId: currentId,
        });

        steps.push({
          stepIndex: steps.length,
          phase: 'update_frontier',
          currentVisitingId: currentId,
          activeEdge: { from: currentId, to: targetId },
          frontier: [...queue],
          visited: [...visitedOrder],
          gScores: { ...depthScores },
          hScores: zeroH,
          fScores: { ...depthScores },
          parents: { ...parents },
          examiningNeighborId: targetId,
          explanation: `Marked neighbor "${neighborLabel}" as visited and pushed to FIFO queue at depth ${depthScores[targetId]}.`,
          pseudocodeLine: 9,
          pathFound: null,
          totalCost: null,
        });
      }
    }
  }

  return {
    steps,
    path: finalPath,
    totalCost,
    nodesExpanded: visitedOrder.length,
    maxFrontierSize,
    success: finalPath !== null,
    executionTimeMs: performance.now() - startTime,
  };
}

/**
 * DEPTH-FIRST SEARCH (DFS)
 */
export function runDFS(graph: GraphData): AlgorithmRunResult {
  const startTime = performance.now();
  const steps: SearchStep[] = [];
  const { startNodeId, goalNodeId, nodes } = graph;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const zeroH: Record<string, number> = {};
  const depthScores: Record<string, number> = {};
  const parents: Record<string, string | null> = {};

  for (const n of nodes) {
    zeroH[n.id] = 0;
    depthScores[n.id] = Infinity;
    parents[n.id] = null;
  }

  depthScores[startNodeId] = 0;

  const stack: FrontierItem[] = [
    {
      nodeId: startNodeId,
      g: 0,
      h: 0,
      f: 0,
      parentId: null,
    },
  ];

  const visitedSet = new Set<string>();
  const visitedOrder: string[] = [];
  let maxFrontierSize = 1;
  let finalPath: string[] | null = null;
  let totalCost = 0;

  steps.push({
    stepIndex: steps.length,
    phase: 'initial',
    currentVisitingId: null,
    activeEdge: null,
    frontier: [...stack],
    visited: [...visitedOrder],
    gScores: { ...depthScores },
    hScores: zeroH,
    fScores: { ...depthScores },
    parents: { ...parents },
    explanation: `Initialized DFS with Start node "${nodeMap.get(startNodeId)?.label || startNodeId}". Using LIFO stack.`,
    pseudocodeLine: 2,
    pathFound: null,
    totalCost: null,
  });

  while (stack.length > 0) {
    maxFrontierSize = Math.max(maxFrontierSize, stack.length);
    const currentItem = stack.pop()!;
    const currentId = currentItem.nodeId;
    const currentLabel = nodeMap.get(currentId)?.label || currentId;

    if (visitedSet.has(currentId)) continue;

    visitedSet.add(currentId);
    if (!visitedOrder.includes(currentId)) visitedOrder.push(currentId);

    if (currentId === goalNodeId) {
      finalPath = reconstructPath(parents, currentId);
      totalCost = calculatePathCost(graph, finalPath);

      steps.push({
        stepIndex: steps.length,
        phase: 'goal_reached',
        currentVisitingId: currentId,
        activeEdge: null,
        frontier: [...stack],
        visited: [...visitedOrder],
        gScores: { ...depthScores },
        hScores: zeroH,
        fScores: { ...depthScores },
        parents: { ...parents },
        explanation: `Goal node "${currentLabel}" reached! DFS completed with path length ${finalPath.length - 1} hops and cost ${totalCost}. Notice DFS dives deep before considering other paths.`,
        pseudocodeLine: 7,
        pathFound: finalPath,
        totalCost,
      });
      break;
    }

    steps.push({
      stepIndex: steps.length,
      phase: 'pick_node',
      currentVisitingId: currentId,
      activeEdge: null,
      frontier: [...stack],
      visited: [...visitedOrder],
      gScores: { ...depthScores },
      hScores: zeroH,
      fScores: { ...depthScores },
      parents: { ...parents },
      explanation: `Popped "${currentLabel}" from LIFO stack. Exploring its branch.`,
      pseudocodeLine: 4,
      pathFound: null,
      totalCost: null,
    });

    const neighbors = getNeighbors(graph, currentId);

    // Push in reverse order so first neighbor is popped first
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const { targetId } = neighbors[i];
      const neighborLabel = nodeMap.get(targetId)?.label || targetId;

      if (!visitedSet.has(targetId)) {
        if (!parents[targetId]) parents[targetId] = currentId;
        depthScores[targetId] = depthScores[currentId] + 1;

        stack.push({
          nodeId: targetId,
          g: depthScores[targetId],
          h: 0,
          f: depthScores[targetId],
          parentId: currentId,
        });

        steps.push({
          stepIndex: steps.length,
          phase: 'update_frontier',
          currentVisitingId: currentId,
          activeEdge: { from: currentId, to: targetId },
          frontier: [...stack],
          visited: [...visitedOrder],
          gScores: { ...depthScores },
          hScores: zeroH,
          fScores: { ...depthScores },
          parents: { ...parents },
          examiningNeighborId: targetId,
          explanation: `Pushed unvisited neighbor "${neighborLabel}" onto LIFO stack.`,
          pseudocodeLine: 10,
          pathFound: null,
          totalCost: null,
        });
      }
    }
  }

  return {
    steps,
    path: finalPath,
    totalCost,
    nodesExpanded: visitedOrder.length,
    maxFrontierSize,
    success: finalPath !== null,
    executionTimeMs: performance.now() - startTime,
  };
}

/**
 * BIDIRECTIONAL SEARCH
 */
export function runBidirectional(graph: GraphData): AlgorithmRunResult {
  const startTime = performance.now();
  const steps: SearchStep[] = [];
  const { startNodeId, goalNodeId, nodes } = graph;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const zeroH: Record<string, number> = {};
  const forwardParents: Record<string, string | null> = {};
  const backwardParents: Record<string, string | null> = {};

  for (const n of nodes) {
    zeroH[n.id] = 0;
    forwardParents[n.id] = null;
    backwardParents[n.id] = null;
  }

  const qFwd: FrontierItem[] = [
    {
      nodeId: startNodeId,
      g: 0,
      h: 0,
      f: 0,
      parentId: null,
      direction: 'forward',
    },
  ];

  const qBwd: FrontierItem[] = [
    {
      nodeId: goalNodeId,
      g: 0,
      h: 0,
      f: 0,
      parentId: null,
      direction: 'backward',
    },
  ];

  const visitedFwd = new Set<string>([startNodeId]);
  const visitedBwd = new Set<string>([goalNodeId]);
  const visitedOrder: string[] = [];

  let intersectionNode: string | null = null;
  let finalPath: string[] | null = null;
  let totalCost = 0;

  if (startNodeId === goalNodeId) {
    intersectionNode = startNodeId;
  }

  steps.push({
    stepIndex: steps.length,
    phase: 'initial',
    currentVisitingId: null,
    activeEdge: null,
    frontier: [...qFwd, ...qBwd],
    visited: [...visitedOrder],
    gScores: {},
    hScores: zeroH,
    fScores: {},
    parents: { ...forwardParents },
    explanation: `Initialized Bidirectional Search: Forward queue starting at "${nodeMap.get(startNodeId)?.label || startNodeId}", Backward queue starting at "${nodeMap.get(goalNodeId)?.label || goalNodeId}".`,
    pseudocodeLine: 1,
    pathFound: null,
    totalCost: null,
    forwardVisited: Array.from(visitedFwd),
    backwardVisited: Array.from(visitedBwd),
  });

  while (qFwd.length > 0 && qBwd.length > 0 && !intersectionNode) {
    // 1. Expand Forward
    const currFwd = qFwd.shift()!;
    const fwdId = currFwd.nodeId;
    const fwdLabel = nodeMap.get(fwdId)?.label || fwdId;

    if (!visitedOrder.includes(fwdId)) visitedOrder.push(fwdId);

    if (visitedBwd.has(fwdId)) {
      intersectionNode = fwdId;
      break;
    }

    steps.push({
      stepIndex: steps.length,
      phase: 'pick_node',
      currentVisitingId: fwdId,
      activeEdge: null,
      frontier: [...qFwd, ...qBwd],
      visited: [...visitedOrder],
      gScores: {},
      hScores: zeroH,
      fScores: {},
      parents: { ...forwardParents },
      explanation: `[Forward Search] Popped node "${fwdLabel}". Expanding forward neighbors.`,
      pseudocodeLine: 4,
      pathFound: null,
      totalCost: null,
      forwardVisited: Array.from(visitedFwd),
      backwardVisited: Array.from(visitedBwd),
    });

    const fwdNeighbors = getNeighbors(graph, fwdId, false);
    for (const { targetId } of fwdNeighbors) {
      if (!visitedFwd.has(targetId)) {
        visitedFwd.add(targetId);
        forwardParents[targetId] = fwdId;
        qFwd.push({
          nodeId: targetId,
          g: currFwd.g + 1,
          h: 0,
          f: 0,
          parentId: fwdId,
          direction: 'forward',
        });

        if (visitedBwd.has(targetId)) {
          intersectionNode = targetId;
          break;
        }
      }
    }

    if (intersectionNode) break;

    // 2. Expand Backward
    const currBwd = qBwd.shift()!;
    const bwdId = currBwd.nodeId;
    const bwdLabel = nodeMap.get(bwdId)?.label || bwdId;

    if (!visitedOrder.includes(bwdId)) visitedOrder.push(bwdId);

    if (visitedFwd.has(bwdId)) {
      intersectionNode = bwdId;
      break;
    }

    steps.push({
      stepIndex: steps.length,
      phase: 'pick_node',
      currentVisitingId: bwdId,
      activeEdge: null,
      frontier: [...qFwd, ...qBwd],
      visited: [...visitedOrder],
      gScores: {},
      hScores: zeroH,
      fScores: {},
      parents: { ...backwardParents },
      explanation: `[Backward Search] Popped node "${bwdLabel}". Expanding backward neighbors.`,
      pseudocodeLine: 6,
      pathFound: null,
      totalCost: null,
      forwardVisited: Array.from(visitedFwd),
      backwardVisited: Array.from(visitedBwd),
    });

    // In backward search, traverse edges in reverse
    const bwdNeighbors = getNeighbors(graph, bwdId, true);
    for (const { targetId } of bwdNeighbors) {
      if (!visitedBwd.has(targetId)) {
        visitedBwd.add(targetId);
        backwardParents[targetId] = bwdId;
        qBwd.push({
          nodeId: targetId,
          g: currBwd.g + 1,
          h: 0,
          f: 0,
          parentId: bwdId,
          direction: 'backward',
        });

        if (visitedFwd.has(targetId)) {
          intersectionNode = targetId;
          break;
        }
      }
    }
  }

  if (intersectionNode) {
    const fwdPart = reconstructPath(forwardParents, intersectionNode);
    // Backward part
    const bwdPart: string[] = [];
    let bCurr: string | null = backwardParents[intersectionNode];
    while (bCurr) {
      bwdPart.push(bCurr);
      bCurr = backwardParents[bCurr];
      if (bwdPart.length > 200) break;
    }
    finalPath = [...fwdPart, ...bwdPart];
    totalCost = calculatePathCost(graph, finalPath);

    steps.push({
      stepIndex: steps.length,
      phase: 'goal_reached',
      currentVisitingId: intersectionNode,
      activeEdge: null,
      frontier: [...qFwd, ...qBwd],
      visited: [...visitedOrder],
      gScores: {},
      hScores: zeroH,
      fScores: {},
      parents: { ...forwardParents },
      explanation: `Frontiers met at intersection node "${nodeMap.get(intersectionNode)?.label || intersectionNode}"! Successfully bridged forward and backward paths. Total cost: ${totalCost}.`,
      pseudocodeLine: 5,
      pathFound: finalPath,
      totalCost,
      forwardVisited: Array.from(visitedFwd),
      backwardVisited: Array.from(visitedBwd),
    });
  }

  return {
    steps,
    path: finalPath,
    totalCost,
    nodesExpanded: visitedOrder.length,
    maxFrontierSize: Math.max(qFwd.length + qBwd.length, 1),
    success: finalPath !== null,
    executionTimeMs: performance.now() - startTime,
  };
}

/**
 * ITERATIVE DEEPENING DFS (IDDFS)
 */
export function runIDDFS(graph: GraphData, maxDepthLimit: number = 10): AlgorithmRunResult {
  const startTime = performance.now();
  const steps: SearchStep[] = [];
  const { startNodeId, goalNodeId, nodes } = graph;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const zeroH: Record<string, number> = {};
  for (const n of nodes) zeroH[n.id] = 0;

  let finalPath: string[] | null = null;
  let totalCost = 0;
  const allVisitedInOrder: string[] = [];
  let maxFrontierSize = 1;

  steps.push({
    stepIndex: steps.length,
    phase: 'initial',
    currentVisitingId: null,
    activeEdge: null,
    frontier: [],
    visited: [],
    gScores: {},
    hScores: zeroH,
    fScores: {},
    parents: {},
    explanation: `Beginning Iterative Deepening Search from "${nodeMap.get(startNodeId)?.label || startNodeId}" up to max depth ${maxDepthLimit}.`,
    pseudocodeLine: 1,
    pathFound: null,
    totalCost: null,
  });

  for (let limit = 0; limit <= maxDepthLimit; limit++) {
    const parents: Record<string, string | null> = {};
    for (const n of nodes) parents[n.id] = null;

    const stack: Array<{ nodeId: string; depth: number }> = [
      { nodeId: startNodeId, depth: 0 },
    ];
    const visitedThisIteration = new Set<string>();

    steps.push({
      stepIndex: steps.length,
      phase: 'initial',
      currentVisitingId: startNodeId,
      activeEdge: null,
      frontier: stack.map((s) => ({
        nodeId: s.nodeId,
        g: s.depth,
        h: 0,
        f: s.depth,
        parentId: null,
      })),
      visited: [...allVisitedInOrder],
      gScores: {},
      hScores: zeroH,
      fScores: {},
      parents,
      explanation: `--- Commencing Depth Limit ${limit} --- Resetting visited nodes for this level to avoid missing deeper optimal paths.`,
      pseudocodeLine: 2,
      pathFound: null,
      totalCost: null,
    });

    while (stack.length > 0) {
      maxFrontierSize = Math.max(maxFrontierSize, stack.length);
      const curr = stack.pop()!;
      const currId = curr.nodeId;
      const currDepth = curr.depth;
      const currLabel = nodeMap.get(currId)?.label || currId;

      if (!visitedThisIteration.has(currId)) {
        visitedThisIteration.add(currId);
        if (!allVisitedInOrder.includes(currId)) allVisitedInOrder.push(currId);
      }

      if (currId === goalNodeId) {
        finalPath = reconstructPath(parents, currId);
        totalCost = calculatePathCost(graph, finalPath);

        steps.push({
          stepIndex: steps.length,
          phase: 'goal_reached',
          currentVisitingId: currId,
          activeEdge: null,
          frontier: [],
          visited: [...allVisitedInOrder],
          gScores: {},
          hScores: zeroH,
          fScores: {},
          parents,
          explanation: `Goal "${currLabel}" found at depth limit ${limit}! Path length: ${finalPath.length - 1} hops. Total cost: ${totalCost}.`,
          pseudocodeLine: 3,
          pathFound: finalPath,
          totalCost,
        });
        break;
      }

      steps.push({
        stepIndex: steps.length,
        phase: 'pick_node',
        currentVisitingId: currId,
        activeEdge: null,
        frontier: stack.map((s) => ({
          nodeId: s.nodeId,
          g: s.depth,
          h: 0,
          f: s.depth,
          parentId: parents[s.nodeId],
        })),
        visited: [...allVisitedInOrder],
        gScores: {},
        hScores: zeroH,
        fScores: {},
        parents,
        explanation: `Exploring node "${currLabel}" at current depth ${currDepth} (limit: ${limit}).`,
        pseudocodeLine: 2,
        pathFound: null,
        totalCost: null,
      });

      if (currDepth < limit) {
        const neighbors = getNeighbors(graph, currId);
        for (let i = neighbors.length - 1; i >= 0; i--) {
          const { targetId } = neighbors[i];
          if (!visitedThisIteration.has(targetId)) {
            parents[targetId] = currId;
            stack.push({ nodeId: targetId, depth: currDepth + 1 });
          }
        }
      }
    }

    if (finalPath) break;
  }

  return {
    steps,
    path: finalPath,
    totalCost,
    nodesExpanded: allVisitedInOrder.length,
    maxFrontierSize,
    success: finalPath !== null,
    executionTimeMs: performance.now() - startTime,
  };
}

export function executeAlgorithm(
  algorithm: AlgorithmType,
  graph: GraphData
): AlgorithmRunResult {
  switch (algorithm) {
    case 'astar':
      return runAStar(graph);
    case 'gbfs':
      return runGBFS(graph);
    case 'dijkstra':
      return runDijkstra(graph);
    case 'bfs':
      return runBFS(graph);
    case 'dfs':
      return runDFS(graph);
    case 'bidirectional':
      return runBidirectional(graph);
    case 'iddfs':
      return runIDDFS(graph);
    default:
      return runAStar(graph);
  }
}
