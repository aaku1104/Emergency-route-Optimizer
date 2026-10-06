import { CityGraph } from '../types';
import { getTravelTime } from '../utils/trafficCalculator';
import { PriorityQueue } from './PriorityQueue';

export interface AnimationStep {
  type: 'visit' | 'update' | 'complete';
  node: string;
  fromNode?: string;
  distance?: number;
  gScore?: number;
  fScore?: number;
  frontier: string[];
  visited: string[];
  currentPath?: string[];
}

export const runDijkstraAnimated = (
  graph: CityGraph,
  startNode: string,
  endNode: string
): { steps: AnimationStep[]; result: any } => {
  const steps: AnimationStep[] = [];
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const pq = new PriorityQueue();
  let nodesExplored = 0;
  const visited: string[] = [];
  const frontier: string[] = [];

  // Initialize
  graph.nodes.forEach(node => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
  });
  distances[startNode] = 0;
  pq.insert(startNode, 0);
  frontier.push(startNode);

  steps.push({
    type: 'visit',
    node: startNode,
    distance: 0,
    gScore: 0,
    fScore: 0,
    frontier: [...frontier],
    visited: [...visited],
    currentPath: [startNode],
  });

  // Build adjacency list
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

    if (visited.includes(currentNode)) continue;
    visited.push(currentNode);
    const frontierIndex = frontier.indexOf(currentNode);
    if (frontierIndex > -1) frontier.splice(frontierIndex, 1);

    // Reconstruct current path to this node
    const currentPath: string[] = [];
    let temp: string | null = currentNode;
    while (temp) {
      currentPath.unshift(temp);
      temp = previous[temp];
    }

    steps.push({
      type: 'visit',
      node: currentNode,
      distance: distances[currentNode],
      gScore: distances[currentNode],
      fScore: distances[currentNode],
      frontier: [...frontier],
      visited: [...visited],
      currentPath: [...currentPath],
    });

    if (currentNode === endNode) break;

    for (const { neighbor, time } of adj[currentNode]) {
      const altTime = distances[currentNode] + time;
      if (altTime < distances[neighbor]) {
        distances[neighbor] = altTime;
        previous[neighbor] = currentNode;
        pq.insert(neighbor, altTime);
        if (!frontier.includes(neighbor)) {
          frontier.push(neighbor);
        }
        // Reconstruct current path to neighbor
        const currentPath: string[] = [];
        let temp: string | null = neighbor;
        while (temp) {
          currentPath.unshift(temp);
          temp = previous[temp];
        }

        steps.push({
          type: 'update',
          node: neighbor,
          fromNode: currentNode,
          distance: altTime,
          gScore: altTime,
          fScore: altTime,
          frontier: [...frontier],
          visited: [...visited],
          currentPath: [...currentPath],
        });
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

  steps.push({
    type: 'complete',
    node: endNode,
    frontier: [...frontier],
    visited: [...visited],
    currentPath: path[0] === startNode ? path : [],
  });

  return {
    steps,
    result: {
      path: path[0] === startNode ? path : [],
      totalTime: distances[endNode] === Infinity ? 0 : distances[endNode],
      nodesExplored,
      executionTime: 0,
    },
  };
};
