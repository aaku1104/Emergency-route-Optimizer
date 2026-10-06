import { CityGraph } from '../types';

export const initialCityMap: CityGraph = {
  nodes: [
    { id: 'A', name: 'Ambulance Stn', x: 100, y: 300, type: 'Ambulance' },
    { id: 'B', name: 'Junction B', x: 300, y: 100, type: 'Normal' },
    { id: 'C', name: 'Junction C', x: 300, y: 500, type: 'Normal' },
    { id: 'D', name: 'Patient Loc', x: 500, y: 300, type: 'Patient' },
    { id: 'E', name: 'Junction E', x: 700, y: 100, type: 'Normal' },
    { id: 'F', name: 'Junction F', x: 700, y: 500, type: 'Normal' },
    { id: 'H', name: 'City Hospital', x: 900, y: 300, type: 'Hospital' },
  ],
  edges: [
    { from: 'A', to: 'B', distance: 5, traffic: 'Heavy' },
    { from: 'A', to: 'C', distance: 7, traffic: 'Low' },
    { from: 'B', to: 'D', distance: 4, traffic: 'Moderate' },
    { from: 'C', to: 'D', distance: 3, traffic: 'Low' },
    { from: 'B', to: 'E', distance: 6, traffic: 'Low' },
    { from: 'D', to: 'F', distance: 5, traffic: 'Moderate' },
    { from: 'E', to: 'H', distance: 4, traffic: 'Low' },
    { from: 'F', to: 'H', distance: 3, traffic: 'Heavy' },
  ],
};