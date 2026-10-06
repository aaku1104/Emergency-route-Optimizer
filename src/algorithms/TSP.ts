import { CityGraph, TSPResult, TSPComparison } from '../types';
import { runDijkstra } from './Dijkstra';

/**
 * Exact TSP using Brute Force
 * Tries all possible permutations of patients to find the optimal route
 * Complexity: O(n!)
 */
export const exactTSP = (
  graph: CityGraph,
  startNode: string,
  patients: string[],
  hospitals: string[]
): TSPResult => {
  const startTime = performance.now();
  let nodesExplored = 0;
  let bestRoute: string[] = [];
  let bestTotalDistance = Infinity;
  let bestTotalTime = Infinity;

  // Helper function to generate all permutations
  const permute = (arr: string[]): string[][] => {
    if (arr.length <= 1) return [arr];
    const result: string[][] = [];
    for (let i = 0; i < arr.length; i++) {
      const current = arr[i];
      const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
      const remainingPerms = permute(remaining);
      for (const perm of remainingPerms) {
        result.push([current, ...perm]);
      }
    }
    return result;
  };

  // Generate all possible patient orderings
  const patientPermutations = permute(patients);
  nodesExplored = patientPermutations.length;

  // For each permutation, calculate the total route cost
  for (const patientOrder of patientPermutations) {
    // Build complete route: start -> patients in order -> best hospital
    let currentTotalDistance = 0;
    let currentTotalTime = 0;
    let currentLocation = startNode;

    // Path through patients
    for (const patient of patientOrder) {
      const result = runDijkstra(graph, currentLocation, patient);
      currentTotalDistance += result.totalDistance;
      currentTotalTime += result.totalTime;
      currentLocation = patient;
    }

    // Find best hospital to end at
    let bestHospitalDistance = Infinity;
    let bestHospitalTime = Infinity;
    let bestHospital = hospitals[0];

    for (const hospital of hospitals) {
      const result = runDijkstra(graph, currentLocation, hospital);
      if (result.totalTime < bestHospitalTime) {
        bestHospitalTime = result.totalTime;
        bestHospitalDistance = result.totalDistance;
        bestHospital = hospital;
      }
    }

    currentTotalDistance += bestHospitalDistance;
    currentTotalTime += bestHospitalTime;

    // Update best route if this is better
    if (currentTotalTime < bestTotalTime) {
      bestTotalTime = currentTotalTime;
      bestTotalDistance = currentTotalDistance;
      bestRoute = [startNode, ...patientOrder, bestHospital];
    }
  }

  const endTime = performance.now();

  return {
    route: bestRoute,
    totalDistance: bestTotalDistance,
    totalTime: bestTotalTime,
    executionTime: endTime - startTime,
    nodesExplored,
    algorithm: 'exact',
  };
};

/**
 * Nearest Neighbor TSP (Approximation)
 * Greedy approach: always visit the nearest unvisited patient
 * Complexity: O(n²)
 */
export const nearestNeighborTSP = (
  graph: CityGraph,
  startNode: string,
  patients: string[],
  hospitals: string[]
): TSPResult => {
  const startTime = performance.now();
  let nodesExplored = 0;
  const route: string[] = [startNode];
  let totalDistance = 0;
  let totalTime = 0;
  let currentLocation = startNode;
  const unvisitedPatients = [...patients];

  // Visit patients one by one, always choosing the nearest
  while (unvisitedPatients.length > 0) {
    let nearestPatient = unvisitedPatients[0];
    let nearestDistance = Infinity;
    let nearestTime = Infinity;

    for (const patient of unvisitedPatients) {
      const result = runDijkstra(graph, currentLocation, patient);
      nodesExplored++;
      if (result.totalTime < nearestTime) {
        nearestTime = result.totalTime;
        nearestDistance = result.totalDistance;
        nearestPatient = patient;
      }
    }

    totalDistance += nearestDistance;
    totalTime += nearestTime;
    route.push(nearestPatient);
    currentLocation = nearestPatient;

    // Remove visited patient
    const index = unvisitedPatients.indexOf(nearestPatient);
    unvisitedPatients.splice(index, 1);
  }

  // Find best hospital to end at
  let bestHospital = hospitals[0];
  let bestHospitalDistance = Infinity;
  let bestHospitalTime = Infinity;

  for (const hospital of hospitals) {
    const result = runDijkstra(graph, currentLocation, hospital);
    nodesExplored++;
    if (result.totalTime < bestHospitalTime) {
      bestHospitalTime = result.totalTime;
      bestHospitalDistance = result.totalDistance;
      bestHospital = hospital;
    }
  }

  totalDistance += bestHospitalDistance;
  totalTime += bestHospitalTime;
  route.push(bestHospital);

  const endTime = performance.now();

  return {
    route,
    totalDistance,
    totalTime,
    executionTime: endTime - startTime,
    nodesExplored,
    algorithm: 'nearest-neighbor',
  };
};

/**
 * Compare exact and approximate TSP solutions
 */
export const compareTSP = (
  exact: TSPResult,
  approximate: TSPResult
): TSPComparison => {
  const distanceDifference = approximate.totalDistance - exact.totalDistance;
  const timeDifference = approximate.totalTime - exact.totalTime;
  const distanceError = exact.totalDistance > 0 ? (distanceDifference / exact.totalDistance) * 100 : 0;
  const timeError = exact.totalTime > 0 ? (timeDifference / exact.totalTime) * 100 : 0;

  return {
    exact,
    approximate,
    distanceDifference,
    timeDifference,
    distanceError,
    timeError,
    exactOptimal: approximate.totalTime >= exact.totalTime,
  };
};
