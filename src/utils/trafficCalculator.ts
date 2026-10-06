import { TrafficLevel } from '../types';

export const getTravelTime = (distance: number, traffic: TrafficLevel): number => {
  let speedMultiplier = 1; // Base speed: 1 km/min (60 km/h)

  switch (traffic) {
    case 'Low':
      speedMultiplier = 1; // 60 km/h
      break;
    case 'Moderate':
      speedMultiplier = 0.6; // 36 km/h
      break;
    case 'Heavy':
      speedMultiplier = 0.3; // 18 km/h
      break;
    case 'Blocked':
      return Infinity; // Impassable
  }

  return distance / speedMultiplier;
};