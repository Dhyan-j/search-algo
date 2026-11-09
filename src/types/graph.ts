export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  h: number; // Heuristic value to the goal
  description?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number; // Path cost c(u, v)
  directed?: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  startNodeId: string;
  goalNodeId: string;
}

export type AlgorithmType =
  | 'astar'
  | 'gbfs'
  | 'dijkstra'
  | 'bfs'
  | 'dfs'
  | 'bidirectional'
  | 'iddfs';

export interface AlgorithmInfo {
  id: AlgorithmType;
  name: string;
  shortName: string;
  formula: string;
  isHeuristic: boolean;
  guaranteedOptimal: boolean;
  complete: boolean;
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  pseudocode: {
    line: number;
    text: string;
    indent: number;
  }[];
}

export interface FrontierItem {
  nodeId: string;
  g: number;
  h: number;
  f: number;
  parentId: string | null;
  priorityKey?: number; // Sorting key
  direction?: 'forward' | 'backward'; // for bidirectional
}

export type StepPhase =
  | 'initial'
  | 'pick_node'
  | 'check_goal'
  | 'examine_neighbor'
  | 'update_frontier'
  | 'prune_frontier'
  | 'goal_reached'
  | 'no_path';

export interface SearchStep {
  stepIndex: number;
  phase: StepPhase;
  currentVisitingId: string | null;
  activeEdge: { from: string; to: string } | null;
  frontier: FrontierItem[];
  visited: string[]; // List of closed/visited node IDs in expansion order
  gScores: Record<string, number>;
  hScores: Record<string, number>;
  fScores: Record<string, number>;
  parents: Record<string, string | null>;
  examiningNeighborId?: string | null;
  explanation: string;
  pseudocodeLine: number;
  pathFound: string[] | null;
  totalCost: number | null;
  forwardVisited?: string[]; // for bidirectional
  backwardVisited?: string[]; // for bidirectional
}

export interface AlgorithmRunResult {
  steps: SearchStep[];
  path: string[] | null;
  totalCost: number;
  nodesExpanded: number;
  maxFrontierSize: number;
  success: boolean;
  executionTimeMs: number;
}
