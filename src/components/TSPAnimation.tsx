import React, { useState, useEffect } from 'react';
import { CityGraph } from '../types';
import { exactTSPAnimated, nearestNeighborTSPAnimated, TSPAnimationStep } from '../algorithms/TSPAnimated';

interface Props {
  graph: CityGraph;
  startNode: string;
  patients: string[];
  hospitals: string[];
  isVisible: boolean;
  onClose: () => void;
}

const TSPAnimation: React.FC<Props> = ({ graph, startNode, patients, hospitals, isVisible, onClose }) => {
  const [algorithm, setAlgorithm] = useState<'exact' | 'nearest-neighbor'>('exact');
  const [steps, setSteps] = useState<TSPAnimationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);

  useEffect(() => {
    if (isVisible) {
      const algorithmFn = algorithm === 'exact' ? exactTSPAnimated : nearestNeighborTSPAnimated;
      const { steps: animationSteps } = algorithmFn(graph, startNode, patients, hospitals);
      setSteps(animationSteps);
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [isVisible, graph, startNode, patients, hospitals, algorithm]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      }, speed);
    } else if (isPlaying && currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, speed]);

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];

  if (!currentStepData) {
    return (
      <div className="animation-overlay">
        <div className="animation-modal tsp-modal">
          <div className="animation-header">
            <h3>Loading...</h3>
            <button onClick={onClose} className="close-btn">×</button>
          </div>
        </div>
      </div>
    );
  }

  const getNodeColor = (nodeId: string) => {
    if (hospitals.includes(nodeId)) return '#22c55e';
    if (patients.includes(nodeId)) return '#f59e0b';
    if (nodeId === startNode) return '#3b82f6';
    if (currentStepData?.currentRoute && currentStepData.currentRoute.includes(nodeId)) return '#1e40af';
    return '#cbd5e1';
  };

  return (
    <div className="animation-overlay">
      <div className="animation-modal tsp-modal">
        <div className="animation-header">
          <h3>
            {algorithm === 'exact' ? 'Exact TSP (Brute Force)' : 'Nearest Neighbor TSP'} Animation
          </h3>
          <div className="algorithm-selector">
            <button
              className={`algo-btn ${algorithm === 'exact' ? 'active' : ''}`}
              onClick={() => {
                setAlgorithm('exact');
                setCurrentStep(0);
                const { steps: animationSteps } = exactTSPAnimated(graph, startNode, patients, hospitals);
                setSteps(animationSteps);
              }}
            >
              Exact
            </button>
            <button
              className={`algo-btn ${algorithm === 'nearest-neighbor' ? 'active' : ''}`}
              onClick={() => {
                setAlgorithm('nearest-neighbor');
                setCurrentStep(0);
                const { steps: animationSteps } = nearestNeighborTSPAnimated(graph, startNode, patients, hospitals);
                setSteps(animationSteps);
              }}
            >
              Nearest Neighbor
            </button>
          </div>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="animation-controls">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="control-btn"
            disabled={currentStep >= steps.length - 1}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            onClick={() => {
              setCurrentStep(0);
              const algorithmFn = algorithm === 'exact' ? exactTSPAnimated : nearestNeighborTSPAnimated;
              const { steps: animationSteps } = algorithmFn(graph, startNode, patients, hospitals);
              setSteps(animationSteps);
            }}
            className="control-btn"
          >
            ⏮ Reset
          </button>
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            className="control-btn"
            disabled={currentStep === 0}
          >
            ◀ Step Back
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            className="control-btn"
            disabled={currentStep >= steps.length - 1}
          >
            Step Forward ▶
          </button>
          <div className="speed-control">
            <label>Speed:</label>
            <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
              <option value={1000}>Slow</option>
              <option value={500}>Normal</option>
              <option value={200}>Fast</option>
            </select>
          </div>
        </div>

        <div className="animation-info tsp-info">
          <div className="info-item">
            <span className="info-label">Algorithm:</span>
            <span className="info-value">{algorithm === 'exact' ? 'Exact (Brute Force)' : 'Nearest Neighbor'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Step:</span>
            <span className="info-value">{currentStep + 1} / {steps.length}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Action:</span>
            <span className="info-value">{currentStepData?.type || '-'}</span>
          </div>
          {algorithm === 'exact' && (
            <>
              <div className="info-item">
                <span className="info-label">Permutations Checked:</span>
                <span className="info-value">{currentStepData?.permutationsChecked || 0} / {currentStepData?.totalPermutations || 0}</span>
              </div>
            </>
          )}
          <div className="info-item">
            <span className="info-label">Current Distance:</span>
            <span className="info-value">{currentStepData?.currentDistance?.toFixed(2) || 0} km</span>
          </div>
          <div className="info-item">
            <span className="info-label">Current Time:</span>
            <span className="info-value">{currentStepData?.currentTime?.toFixed(2) || 0} min</span>
          </div>
          <div className="info-item">
            <span className="info-label">Best Distance:</span>
            <span className="info-value">{currentStepData?.bestDistance === Infinity ? '-' : currentStepData.bestDistance.toFixed(2) + ' km'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Best Time:</span>
            <span className="info-value">{currentStepData?.bestTime === Infinity ? '-' : currentStepData.bestTime.toFixed(2) + ' min'}</span>
          </div>
          {currentStepData?.currentRoute && currentStepData.currentRoute.length > 0 && (
            <div className="info-item" style={{ gridColumn: '1 / -1' }}>
              <span className="info-label">Current Route:</span>
              <span className="info-value">{currentStepData.currentRoute.join(' → ')}</span>
            </div>
          )}
          {currentStepData?.bestRoute && currentStepData.bestRoute.length > 0 && (
            <div className="info-item" style={{ gridColumn: '1 / -1' }}>
              <span className="info-label">Best Route So Far:</span>
              <span className="info-value">{currentStepData.bestRoute.join(' → ')}</span>
            </div>
          )}
        </div>

        <div className="animation-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#3b82f6' }}></div>
            <span>Start (Ambulance)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#f59e0b' }}></div>
            <span>Patient</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#22c55e' }}></div>
            <span>Hospital</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#1e40af' }}></div>
            <span>In Route</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#cbd5e1' }}></div>
            <span>Unvisited</span>
          </div>
        </div>

        <svg width="100%" height="300" viewBox="0 0 1000 600" style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          {graph.edges.map((edge, idx) => {
            const fromNode = graph.nodes.find(n => n.id === edge.from)!;
            const toNode = graph.nodes.find(n => n.id === edge.to)!;
            const isInRoute = currentStepData?.currentRoute.some((node, i) => {
              if (i < currentStepData.currentRoute.length - 1) {
                return (currentStepData.currentRoute[i] === edge.from && currentStepData.currentRoute[i + 1] === edge.to) ||
                       (currentStepData.currentRoute[i] === edge.to && currentStepData.currentRoute[i + 1] === edge.from);
              }
              return false;
            });

            return (
              <line
                key={idx}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={isInRoute ? '#1e40af' : '#cbd5e1'}
                strokeWidth={isInRoute ? 4 : 2}
                strokeLinecap="round"
              />
            );
          })}
          {graph.nodes.map(node => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={24}
                fill={getNodeColor(node.id)}
                stroke="white"
                strokeWidth="2"
              />
              <text x={node.x} y={node.y + 5} textAnchor="middle" fill="white" fontSize="14" fontWeight="600">
                {node.id}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default TSPAnimation;
