import { GraphData } from '../types/graph';

export interface PresetGraph {
  id: string;
  name: string;
  category: string;
  description: string;
  recommendedAlgorithm: string;
  data: GraphData;
}

export const PRESET_GRAPHS: PresetGraph[] = [
  {
    id: 'romania',
    name: 'Romania Road Map (Arad to Bucharest)',
    category: 'Classic AI Benchmark',
    description:
      'The classic AI textbook problem from Russell & Norvig. Straight-line distances to Bucharest act as the admissible heuristic h(n).',
    recommendedAlgorithm: 'astar',
    data: {
      startNodeId: 'arad',
      goalNodeId: 'bucharest',
      nodes: [
        { id: 'arad', label: 'Arad', x: 80, y: 160, h: 366 },
        { id: 'zerind', label: 'Zerind', x: 110, y: 80, h: 374 },
        { id: 'oradea', label: 'Oradea', x: 160, y: 30, h: 380 },
        { id: 'sibiu', label: 'Sibiu', x: 260, y: 190, h: 253 },
        { id: 'timisoara', label: 'Timisoara', x: 80, y: 280, h: 329 },
        { id: 'lugoj', label: 'Lugoj', x: 170, y: 320, h: 244 },
        { id: 'mehadia', label: 'Mehadia', x: 170, y: 400, h: 241 },
        { id: 'drobeta', label: 'Drobeta', x: 170, y: 480, h: 242 },
        { id: 'craiova', label: 'Craiova', x: 320, y: 490, h: 160 },
        { id: 'rimnicu', label: 'Rimnicu Vilcea', x: 300, y: 280, h: 193 },
        { id: 'fagaras', label: 'Fagaras', x: 420, y: 190, h: 176 },
        { id: 'pitesti', label: 'Pitesti', x: 440, y: 340, h: 100 },
        { id: 'bucharest', label: 'Bucharest', x: 570, y: 400, h: 0 },
        { id: 'giurgiu', label: 'Giurgiu', x: 540, y: 520, h: 77 },
        { id: 'urziceni', label: 'Urziceni', x: 670, y: 350, h: 80 },
        { id: 'hirsova', label: 'Hirsova', x: 790, y: 350, h: 151 },
        { id: 'eforie', label: 'Eforie', x: 830, y: 450, h: 161 },
        { id: 'vaslui', label: 'Vaslui', x: 740, y: 220, h: 199 },
        { id: 'iasi', label: 'Iasi', x: 700, y: 130, h: 226 },
        { id: 'neamt', label: 'Neamt', x: 580, y: 90, h: 234 },
      ],
      edges: [
        { id: 'e1', source: 'arad', target: 'zerind', weight: 75 },
        { id: 'e2', source: 'zerind', target: 'oradea', weight: 71 },
        { id: 'e3', source: 'oradea', target: 'sibiu', weight: 151 },
        { id: 'e4', source: 'arad', target: 'sibiu', weight: 140 },
        { id: 'e5', source: 'arad', target: 'timisoara', weight: 118 },
        { id: 'e6', source: 'timisoara', target: 'lugoj', weight: 111 },
        { id: 'e7', source: 'lugoj', target: 'mehadia', weight: 70 },
        { id: 'e8', source: 'mehadia', target: 'drobeta', weight: 75 },
        { id: 'e9', source: 'drobeta', target: 'craiova', weight: 120 },
        { id: 'e10', source: 'sibiu', target: 'fagaras', weight: 99 },
        { id: 'e11', source: 'sibiu', target: 'rimnicu', weight: 80 },
        { id: 'e12', source: 'rimnicu', target: 'craiova', weight: 146 },
        { id: 'e13', source: 'rimnicu', target: 'pitesti', weight: 97 },
        { id: 'e14', source: 'craiova', target: 'pitesti', weight: 138 },
        { id: 'e15', source: 'fagaras', target: 'bucharest', weight: 211 },
        { id: 'e16', source: 'pitesti', target: 'bucharest', weight: 101 },
        { id: 'e17', source: 'bucharest', target: 'giurgiu', weight: 90 },
        { id: 'e18', source: 'bucharest', target: 'urziceni', weight: 85 },
        { id: 'e19', source: 'urziceni', target: 'hirsova', weight: 98 },
        { id: 'e20', source: 'hirsova', target: 'eforie', weight: 86 },
        { id: 'e21', source: 'urziceni', target: 'vaslui', weight: 142 },
        { id: 'e22', source: 'vaslui', target: 'iasi', weight: 92 },
        { id: 'e23', source: 'iasi', target: 'neamt', weight: 87 },
      ],
    },
  },
  {
    id: 'greedy_trap',
    name: 'Greedy Trap (A* vs Greedy BFS)',
    category: 'Educational Trap',
    description:
      'Greedy Best-First is lured into a high-cost detour because the immediate heuristic h(n) looks deceptively low, while A* evaluates total cost f(n)=g(n)+h(n) and picks the true optimal route.',
    recommendedAlgorithm: 'gbfs',
    data: {
      startNodeId: 'start',
      goalNodeId: 'goal',
      nodes: [
        { id: 'start', label: 'Start (S)', x: 100, y: 220, h: 25 },
        { id: 'bait', label: 'Tempting Node (T)', x: 300, y: 110, h: 3 },
        { id: 'trap_mid', label: 'Trap Highway', x: 520, y: 110, h: 2 },
        { id: 'opt_a', label: 'Optimal Step 1', x: 260, y: 340, h: 18 },
        { id: 'opt_b', label: 'Optimal Step 2', x: 480, y: 340, h: 9 },
        { id: 'goal', label: 'Goal (G)', x: 700, y: 220, h: 0 },
      ],
      edges: [
        // Upper trap route: S -> Bait (15) -> Trap_Mid (20) -> Goal (20) = Total 55!
        { id: 'e1', source: 'start', target: 'bait', weight: 15 },
        { id: 'e2', source: 'bait', target: 'trap_mid', weight: 20 },
        { id: 'e3', source: 'trap_mid', target: 'goal', weight: 20 },
        // Lower optimal route: S -> OptA (4) -> OptB (5) -> Goal (6) = Total 15!
        { id: 'e4', source: 'start', target: 'opt_a', weight: 4 },
        { id: 'e5', source: 'opt_a', target: 'opt_b', weight: 5 },
        { id: 'e6', source: 'opt_b', target: 'goal', weight: 6 },
      ],
    },
  },
  {
    id: 'tree',
    name: 'Binary Search Tree (BFS vs DFS)',
    category: 'Data Structures',
    description:
      'Demonstrates BFS exploring level by level vs DFS diving deep into the left subtree before backtracking. Perfect to test IDDFS depth limits.',
    recommendedAlgorithm: 'bfs',
    data: {
      startNodeId: 'n1',
      goalNodeId: 'n11',
      nodes: [
        { id: 'n1', label: 'Root (1)', x: 420, y: 60, h: 4 },
        { id: 'n2', label: 'L (2)', x: 240, y: 160, h: 3 },
        { id: 'n3', label: 'R (3)', x: 600, y: 160, h: 3 },
        { id: 'n4', label: 'LL (4)', x: 150, y: 270, h: 4 },
        { id: 'n5', label: 'LR (5)', x: 330, y: 270, h: 2 },
        { id: 'n6', label: 'RL (6)', x: 510, y: 270, h: 3 },
        { id: 'n7', label: 'RR (7)', x: 690, y: 270, h: 2 },
        { id: 'n8', label: 'LLL (8)', x: 100, y: 390, h: 5 },
        { id: 'n9', label: 'LLR (9)', x: 200, y: 390, h: 4 },
        { id: 'n10', label: 'LRL (10)', x: 290, y: 390, h: 3 },
        { id: 'n11', label: 'Target (11)', x: 370, y: 390, h: 0 },
        { id: 'n12', label: 'RLR (12)', x: 550, y: 390, h: 2 },
        { id: 'n13', label: 'RRR (13)', x: 740, y: 390, h: 1 },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', weight: 1, directed: true },
        { id: 'e2', source: 'n1', target: 'n3', weight: 1, directed: true },
        { id: 'e3', source: 'n2', target: 'n4', weight: 1, directed: true },
        { id: 'e4', source: 'n2', target: 'n5', weight: 1, directed: true },
        { id: 'e5', source: 'n3', target: 'n6', weight: 1, directed: true },
        { id: 'e6', source: 'n3', target: 'n7', weight: 1, directed: true },
        { id: 'e7', source: 'n4', target: 'n8', weight: 1, directed: true },
        { id: 'e8', source: 'n4', target: 'n9', weight: 1, directed: true },
        { id: 'e9', source: 'n5', target: 'n10', weight: 1, directed: true },
        { id: 'e10', source: 'n5', target: 'n11', weight: 1, directed: true },
        { id: 'e11', source: 'n6', target: 'n12', weight: 1, directed: true },
        { id: 'e12', source: 'n7', target: 'n13', weight: 1, directed: true },
      ],
    },
  },
  {
    id: 'cycle_mesh',
    name: 'Multi-Path Mesh with Cycles',
    category: 'Complex Graph',
    description:
      'A dense graph with cycles, cross connections, and varying costs. Tests how Dijkstra and A* relax edge costs and maintain shortest distances without infinite loops.',
    recommendedAlgorithm: 'dijkstra',
    data: {
      startNodeId: 'A',
      goalNodeId: 'H',
      nodes: [
        { id: 'A', label: 'A (Start)', x: 100, y: 220, h: 12 },
        { id: 'B', label: 'B', x: 260, y: 110, h: 9 },
        { id: 'C', label: 'C', x: 260, y: 330, h: 10 },
        { id: 'D', label: 'D', x: 420, y: 110, h: 6 },
        { id: 'E', label: 'E', x: 420, y: 220, h: 7 },
        { id: 'F', label: 'F', x: 420, y: 330, h: 6 },
        { id: 'G', label: 'G', x: 580, y: 160, h: 3 },
        { id: 'H', label: 'H (Goal)', x: 740, y: 220, h: 0 },
      ],
      edges: [
        { id: 'e1', source: 'A', target: 'B', weight: 4 },
        { id: 'e2', source: 'A', target: 'C', weight: 2 },
        { id: 'e3', source: 'B', target: 'C', weight: 1 },
        { id: 'e4', source: 'B', target: 'D', weight: 5 },
        { id: 'e5', source: 'C', target: 'E', weight: 8 },
        { id: 'e6', source: 'C', target: 'F', weight: 10 },
        { id: 'e7', source: 'D', target: 'E', weight: 2 },
        { id: 'e8', source: 'D', target: 'G', weight: 6 },
        { id: 'e9', source: 'E', target: 'F', weight: 2 },
        { id: 'e10', source: 'E', target: 'G', weight: 3 },
        { id: 'e11', source: 'F', target: 'H', weight: 5 },
        { id: 'e12', source: 'G', target: 'H', weight: 2 },
      ],
    },
  },
  {
    id: 'blank',
    name: 'Blank Canvas (Build Your Own)',
    category: 'Sandbox',
    description:
      'Clean graph with 2 nodes. Click anywhere with "Add Node" or drag connecting edges to build your custom problem!',
    recommendedAlgorithm: 'astar',
    data: {
      startNodeId: 's',
      goalNodeId: 'g',
      nodes: [
        { id: 's', label: 'Start (S)', x: 180, y: 240, h: 10 },
        { id: 'g', label: 'Goal (G)', x: 620, y: 240, h: 0 },
      ],
      edges: [],
    },
  },
];
