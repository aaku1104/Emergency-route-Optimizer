import { CityGraph, AlgorithmResult } from '../types';
import { getTravelTime } from '../utils/trafficCalculator';
import { PriorityQueue } from './PriorityQueue';

export const runDijkstra = (
  graph: CityGraph,
  startNode: string,
  endNode: string
): AlgorithmResult => {
  const startTime = performance.now();
  
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const pq = new PriorityQueue();
  let nodesExplored = 0;

  // Initialize
  graph.nodes.forEach(node => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
  });
  distances[startNode] = 0;
  pq.insert(startNode, 0);

  // Build adjacency list
  const adj: Record<string, { neighbor: string; time: number; distance: number }[]> = {};
  graph.nodes.forEach(n => (adj[n.id] = []));
  graph.edges.forEach(edge => {
    const time = getTravelTime(edge.distance, edge.traffic);
    adj[edge.from].push({ neighbor: edge.to, time, distance: edge.distance });
    adj[edge.to].push({ neighbor: edge.from, time, distance: edge.distance }); // Undirected
  });

  while (!pq.isEmpty()) {
    const current = pq.extractMin();
    if (!current) break;
    
    nodesExplored++;
    const currentNode = current.node;

    if (currentNode === endNode) break; // Early exit if destination reached

    for (const { neighbor, time } of adj[currentNode]) {
      const altTime = distances[currentNode] + time;
      if (altTime < distances[neighbor]) {
        distances[neighbor] = altTime;
        previous[neighbor] = currentNode;
        pq.insert(neighbor, altTime);
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let curr: string | null = endNode;
  while (curr) {
    path.unshift(curr);
    curr = previous[curr];
  }

  const endTime = performance.now();
  
  return {
    path: path[0] === startNode ? path : [],
    totalDistance: 0, // Calculated below
    totalTime: distances[endNode] === Infinity ? 0 : distances[endNode],
    nodesExplored,
    executionTime: endTime - startTime,
  };
};