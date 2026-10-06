export type LocationType = 'Ambulance' | 'Patient' | 'Hospital' | 'Normal';
export type TrafficLevel = 'Low' | 'Moderate' | 'Heavy' | 'Blocked';
export type AlgorithmType = 'dijkstra' | 'astar';
export type PriorityLevel = 'Critical' | 'High' | 'Moderate' | 'Low';

export interface GraphNode {
  id: string;
  name: string;
  x: number; // For visualization
  y: number; // For visualization
  type: LocationType;
  priority?: PriorityLevel; // For patients
}

export interface GraphEdge {
  from: string;
  to: string;
  distance: number; // in km
  traffic: TrafficLevel;
}

export interface CityGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface AlgorithmResult {
  path: string[];
  totalDistance: number;
  totalTime: number;
  nodesExplored: number;
  executionTime: number; // in milliseconds
}

export interface TSPResult {
  route: string[];
  totalDistance: number;
  totalTime: number;
  executionTime: number;
  nodesExplored: number;
  algorithm: 'exact' | 'nearest-neighbor';
}

export interface TSPComparison {
  exact: TSPResult;
  approximate: TSPResult;
  distanceDifference: number;
  timeDifference: number;
  distanceError: number;
  timeError: number;
  exactOptimal: boolean;
}