import { CityGraph } from '../types';
import { getTravelTime } from '../utils/trafficCalculator';
import { PriorityQueue } from './PriorityQueue';
import { AnimationStep } from './DijkstraAnimated';

export const runAStarAnimated = (
  graph: CityGraph,
  startNode: string,
  endNode: string
): { steps: AnimationStep[]; result: any } => {
  const steps: AnimationStep[] = [];
  const gScore: Record<string, number> = {};
  const fScore: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const pq = new PriorityQueue();
  let nodesExplored = 0;
  const visited: string[] = [];
  const frontier: string[] = [];

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
  frontier.push(startNode);

  steps.push({
    type: 'visit',
    node: startNode,
    distance: 0,
    gScore: 0,
    fScore: fScore[startNode],
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
      distance: gScore[currentNode],
      gScore: gScore[currentNode],
      fScore: fScore[currentNode],
      frontier: [...frontier],
      visited: [...visited],
      currentPath: [...currentPath],
    });

    if (currentNode === endNode) break;

    for (const { neighbor, time } of adj[currentNode]) {
      const tentativeGScore = gScore[currentNode] + time;
      if (tentativeGScore < gScore[neighbor]) {
        previous[neighbor] = currentNode;
        gScore[neighbor] = tentativeGScore;
        fScore[neighbor] = tentativeGScore + heuristic(neighbor, endNode);
        pq.insert(neighbor, fScore[neighbor]);
        if (!frontier.includes(neighbor)) {
          frontier.push(neighbor);
        }

        // Reconstruct current path to neighbor
        const neighborPath: string[] = [];
        let temp: string | null = neighbor;
        while (temp) {
          neighborPath.unshift(temp);
          temp = previous[temp];
        }

        steps.push({
          type: 'update',
          node: neighbor,
          fromNode: currentNode,
          distance: tentativeGScore,
          gScore: tentativeGScore,
          fScore: fScore[neighbor],
          frontier: [...frontier],
          visited: [...visited],
          currentPath: [...neighborPath],
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
      totalTime: gScore[endNode] === Infinity ? 0 : gScore[endNode],
      nodesExplored,
      executionTime: 0,
    },
  };
};
