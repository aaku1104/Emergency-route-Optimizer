import { CityGraph } from '../types';
import { runDijkstra } from './Dijkstra';

export interface TSPAnimationStep {
  type: 'evaluate' | 'update' | 'complete';
  currentRoute: string[];
  currentDistance: number;
  currentTime: number;
  bestRoute: string[];
  bestDistance: number;
  bestTime: number;
  permutationsChecked: number;
  totalPermutations: number;
  algorithm: 'exact' | 'nearest-neighbor';
  currentPatient?: string;
  remainingPatients?: string[];
}

/**
 * Animated Exact TSP using Brute Force
 * Shows each permutation being evaluated
 */
export const exactTSPAnimated = (
  graph: CityGraph,
  startNode: string,
  patients: string[],
  hospitals: string[]
): { steps: TSPAnimationStep[]; result: any } => {
  const steps: TSPAnimationStep[] = [];
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
  const totalPermutations = patientPermutations.length;

  // Initialize with empty best route
  steps.push({
    type: 'evaluate',
    currentRoute: [],
    currentDistance: 0,
    currentTime: 0,
    bestRoute: [],
    bestDistance: Infinity,
    bestTime: Infinity,
    permutationsChecked: 0,
    totalPermutations,
    algorithm: 'exact',
  });

  // For each permutation, calculate the total route cost
  for (let i = 0; i < patientPermutations.length; i++) {
    const patientOrder = patientPermutations[i];
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

    const completeRoute = [startNode, ...patientOrder, bestHospital];

    // Update best route if this is better
    if (currentTotalTime < bestTotalTime) {
      bestTotalTime = currentTotalTime;
      bestTotalDistance = currentTotalDistance;
      bestRoute = completeRoute;

      steps.push({
        type: 'update',
        currentRoute: completeRoute,
        currentDistance: currentTotalDistance,
        currentTime: currentTotalTime,
        bestRoute: [...bestRoute],
        bestDistance: bestTotalDistance,
        bestTime: bestTotalTime,
        permutationsChecked: i + 1,
        totalPermutations,
        algorithm: 'exact',
      });
    } else {
      steps.push({
        type: 'evaluate',
        currentRoute: completeRoute,
        currentDistance: currentTotalDistance,
        currentTime: currentTotalTime,
        bestRoute: [...bestRoute],
        bestDistance: bestTotalDistance,
        bestTime: bestTotalTime,
        permutationsChecked: i + 1,
        totalPermutations,
        algorithm: 'exact',
      });
    }
  }

  // Final step
  steps.push({
    type: 'complete',
    currentRoute: bestRoute,
    currentDistance: bestTotalDistance,
    currentTime: bestTotalTime,
    bestRoute: [...bestRoute],
    bestDistance: bestTotalDistance,
    bestTime: bestTotalTime,
    permutationsChecked: totalPermutations,
    totalPermutations,
    algorithm: 'exact',
  });

  return {
    steps,
    result: {
      route: bestRoute,
      totalDistance: bestTotalDistance,
      totalTime: bestTotalTime,
      executionTime: 0,
      nodesExplored: totalPermutations,
      algorithm: 'exact',
    },
  };
};

/**
 * Animated Nearest Neighbor TSP
 * Shows the greedy step-by-step selection
 */
export const nearestNeighborTSPAnimated = (
  graph: CityGraph,
  startNode: string,
  patients: string[],
  hospitals: string[]
): { steps: TSPAnimationStep[]; result: any } => {
  const steps: TSPAnimationStep[] = [];
  const route: string[] = [startNode];
  let totalDistance = 0;
  let totalTime = 0;
  let currentLocation = startNode;
  const unvisitedPatients = [...patients];
  const totalSteps = patients.length + 1; // patients + hospital selection

  // Initialize
  steps.push({
    type: 'evaluate',
    currentRoute: [...route],
    currentDistance: 0,
    currentTime: 0,
    bestRoute: [...route],
    bestDistance: 0,
    bestTime: 0,
    permutationsChecked: 0,
    totalPermutations: totalSteps,
    algorithm: 'nearest-neighbor',
    currentPatient: undefined,
    remainingPatients: [...unvisitedPatients],
  });

  // Visit patients one by one, always choosing the nearest
  let stepIndex = 0;
  while (unvisitedPatients.length > 0) {
    stepIndex++;
    let nearestPatient = unvisitedPatients[0];
    let nearestDistance = Infinity;
    let nearestTime = Infinity;

    // Evaluate all remaining patients
    for (const patient of unvisitedPatients) {
      const result = runDijkstra(graph, currentLocation, patient);
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

    steps.push({
      type: 'update',
      currentRoute: [...route],
      currentDistance: totalDistance,
      currentTime: totalTime,
      bestRoute: [...route],
      bestDistance: totalDistance,
      bestTime: totalTime,
      permutationsChecked: stepIndex,
      totalPermutations: totalSteps,
      algorithm: 'nearest-neighbor',
      currentPatient: nearestPatient,
      remainingPatients: [...unvisitedPatients],
    });
  }

  // Find best hospital to end at
  stepIndex++;
  let bestHospital = hospitals[0];
  let bestHospitalDistance = Infinity;
  let bestHospitalTime = Infinity;

  for (const hospital of hospitals) {
    const result = runDijkstra(graph, currentLocation, hospital);
    if (result.totalTime < bestHospitalTime) {
      bestHospitalTime = result.totalTime;
      bestHospitalDistance = result.totalDistance;
      bestHospital = hospital;
    }
  }

  totalDistance += bestHospitalDistance;
  totalTime += bestHospitalTime;
  route.push(bestHospital);

  steps.push({
    type: 'complete',
    currentRoute: [...route],
    currentDistance: totalDistance,
    currentTime: totalTime,
    bestRoute: [...route],
    bestDistance: totalDistance,
    bestTime: totalTime,
    permutationsChecked: stepIndex,
    totalPermutations: totalSteps,
    algorithm: 'nearest-neighbor',
    currentPatient: bestHospital,
    remainingPatients: [],
  });

  return {
    steps,
    result: {
      route,
      totalDistance,
      totalTime,
      executionTime: 0,
      nodesExplored: stepIndex,
      algorithm: 'nearest-neighbor',
    },
  };
};
