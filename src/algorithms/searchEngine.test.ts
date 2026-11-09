import test from 'node:test';
import assert from 'node:assert/strict';
import {
  executeAlgorithm,
  runAStar,
  runGBFS,
  runDijkstra,
  runBFS,
  runDFS,
  runBidirectional,
  runIDDFS,
  calculatePathCost,
} from './searchEngine';
import { GraphData } from '../types/graph';

// Simple test graph:
// (A) -- 2 --> (B) -- 3 --> (D)
//  |                         ^
// 10                         |
//  v                         |
// (C) ----------- 1 --------+
//
// Shortest path by edge count: A -> B -> D (2 edges) cost = 5
// Path A -> C -> D has cost 11
const testGraph1: GraphData = {
  nodes: [
    { id: 'A', label: 'A', x: 0, y: 0, h: 5 },
    { id: 'B', label: 'B', x: 50, y: 0, h: 3 },
    { id: 'C', label: 'C', x: 0, y: 50, h: 1 },
    { id: 'D', label: 'D', x: 100, y: 50, h: 0 },
  ],
  edges: [
    { id: 'e1', source: 'A', target: 'B', weight: 2, directed: false },
    { id: 'e2', source: 'B', target: 'D', weight: 3, directed: false },
    { id: 'e3', source: 'A', target: 'C', weight: 10, directed: false },
    { id: 'e4', source: 'C', target: 'D', weight: 1, directed: false },
  ],
  startNodeId: 'A',
  goalNodeId: 'D',
};

// Graph where Greedy Best-First Search gets misled by heuristic:
// Start: S, Goal: G
// Path 1: S -> A -> G (S->A cost 10, A->G cost 10, total 20, but h(A) = 2)
// Path 2: S -> B -> G (S->B cost 1, B->G cost 2, total 3, but h(B) = 8)
// Greedy picks A first because h(A)=2 < h(B)=8, so Greedy takes total cost 20!
// A* and Dijkstra pick S -> B -> G with optimal cost 3!
const greedyTrapGraph: GraphData = {
  nodes: [
    { id: 'S', label: 'Start', x: 0, y: 0, h: 10 },
    { id: 'A', label: 'Trap A', x: 50, y: -50, h: 2 }, // Looks tempting to Greedy
    { id: 'B', label: 'True Path B', x: 50, y: 50, h: 8 }, // Looks farther to Greedy
    { id: 'G', label: 'Goal', x: 100, y: 0, h: 0 },
  ],
  edges: [
    { id: 'e1', source: 'S', target: 'A', weight: 10, directed: true },
    { id: 'e2', source: 'A', target: 'G', weight: 10, directed: true },
    { id: 'e3', source: 'S', target: 'B', weight: 1, directed: true },
    { id: 'e4', source: 'B', target: 'G', weight: 2, directed: true },
  ],
  startNodeId: 'S',
  goalNodeId: 'G',
};

test('A* Search finds optimal path on test graph', () => {
  const result = runAStar(testGraph1);
  assert.equal(result.success, true);
  assert.deepEqual(result.path, ['A', 'B', 'D']);
  assert.equal(result.totalCost, 5);
  assert.ok(result.steps.length > 0);
  assert.equal(result.steps[result.steps.length - 1].phase, 'goal_reached');
});

test('Dijkstra finds the cheapest path and ignores heuristics', () => {
  const result = runDijkstra(greedyTrapGraph);
  assert.equal(result.success, true);
  assert.deepEqual(result.path, ['S', 'B', 'G']);
  assert.equal(result.totalCost, 3);
});

test('A* finds optimal path on greedy trap graph', () => {
  const result = runAStar(greedyTrapGraph);
  assert.equal(result.success, true);
  assert.deepEqual(result.path, ['S', 'B', 'G']);
  assert.equal(result.totalCost, 3);
});

test('Greedy Best-First is guided by h(n) and takes the heuristic-favored branch', () => {
  const result = runGBFS(greedyTrapGraph);
  assert.equal(result.success, true);
  // Greedy chooses A because h(A)=2 < h(B)=8
  assert.deepEqual(result.path, ['S', 'A', 'G']);
  assert.equal(result.totalCost, 20); // Suboptimal cost, showing the classic GBFS trade-off!
});

test('BFS finds fewest-hops path', () => {
  const result = runBFS(testGraph1);
  assert.equal(result.success, true);
  assert.deepEqual(result.path, ['A', 'B', 'D']);
  assert.equal(result.totalCost, 5);
});

test('DFS finds a path to the goal', () => {
  const result = runDFS(testGraph1);
  assert.equal(result.success, true);
  assert.ok(result.path && result.path[0] === 'A');
  assert.ok(result.path && result.path[result.path.length - 1] === 'D');
});

test('Bidirectional search connects start and goal frontiers', () => {
  const result = runBidirectional(testGraph1);
  assert.equal(result.success, true);
  assert.ok(result.path !== null);
  assert.equal(result.path[0], 'A');
  assert.equal(result.path[result.path.length - 1], 'D');
});

test('IDDFS finds path within depth limit', () => {
  const result = runIDDFS(testGraph1, 5);
  assert.equal(result.success, true);
  assert.deepEqual(result.path, ['A', 'B', 'D']);
});

test('Disconnected graph returns no path gracefully', () => {
  const disconnectedGraph: GraphData = {
    nodes: [
      { id: '1', label: '1', x: 0, y: 0, h: 5 },
      { id: '2', label: '2', x: 10, y: 10, h: 0 },
    ],
    edges: [],
    startNodeId: '1',
    goalNodeId: '2',
  };
  const result = runAStar(disconnectedGraph);
  assert.equal(result.success, false);
  assert.equal(result.path, null);
  assert.equal(result.steps[result.steps.length - 1].phase, 'no_path');
});
