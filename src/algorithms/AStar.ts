import { CityGraph, AlgorithmResult } from '../types';
import { getTravelTime } from '../utils/trafficCalculator';
import { PriorityQueue } from './PriorityQueue';

export const runAStar = (
  graph: CityGraph,
  startNode: string,
  endNode: string
): AlgorithmResult => {
  const startTime = performance.now();

  const gScore: Record<string, number> = {};
  const fScore: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const pq = new PriorityQueue();
  let nodesExplored = 0;

  const nodeMap: Record<string, { x: number; y: number }> = {};
  graph.nodes.forEach(n => {
    nodeMap[n.id] = { x: n.x, y: n.y };
    gScore[n.id] = Infinity;
    fScore[n.id] = Infinity;
    previous[n.id] = null;
  });

  // Heuristic: Euclidean distance / Max Speed (Admissible)
  const heuristic = (nodeA: string, nodeB: string) => {
    const a = nodeMap[nodeA];
    const b = nodeMap[nodeB];
    const distance = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    return distance * 0.2; // Scaled down to act as time estimate
  };

  gScore[startNode] = 0;
  fScore[startNode] = heuristic(startNode, endNode);
  pq.insert(startNode, fScore[startNode]);

  const adj: Record<string, { neighbor: string; time: number }[]> = {};
  graph.nodes.forEach(n => (adj[n.id] = []));
  graph.edges.forEach(edge => {
    const time = getTravelTime(edge.distance, edge.traffic);
    adj[edge.from].push({ neighbor: edge.to, time });
    adj[edge.to].push({ neighbor: edge.from, time });
  });

  while (!pq.isEmpty()) {
    const current = pq.extractMin();
    if (!current) break;
    
    nodesExplored++;
    const currentNode = current.node;

    if (currentNode === endNode) break;

    for (const { neighbor, time } of adj[currentNode]) {
      const tentativeGScore = gScore[currentNode] + time;
      if (tentativeGScore < gScore[neighbor]) {
        previous[neighbor] = currentNode;
        gScore[neighbor] = tentativeGScore;
        fScore[neighbor] = tentativeGScore + heuristic(neighbor, endNode);
        pq.insert(neighbor, fScore[neighbor]);
      }
    }
  }

  const path: string[] = [];
  let curr: string | null = endNode;
  while (curr) {
    path.unshift(curr);
    curr = previous[curr];
  }

  const endTime = performance.now();

  return {
    path: path[0] === startNode ? path : [],
    totalDistance: 0,
    totalTime: gScore[endNode] === Infinity ? 0 : gScore[endNode],
    nodesExplored,
    executionTime: endTime - startTime,
  };
};