import React, { useState, useEffect } from 'react';
import { CityGraph } from '../types';
import { runDijkstraAnimated, AnimationStep } from '../algorithms/DijkstraAnimated';
import { runAStarAnimated } from '../algorithms/AStarAnimated';

interface Props {
  graph: CityGraph;
  startNode: string;
  endNode: string;
  hospitalNode: string;
  isVisible: boolean;
  onClose: () => void;
}

const AlgorithmAnimation: React.FC<Props> = ({ graph, startNode, endNode, hospitalNode, isVisible, onClose }) => {
  const [algorithm, setAlgorithm] = useState<'dijkstra' | 'astar'>('dijkstra');
  const [phase, setPhase] = useState<'ambulance-to-patient' | 'patient-to-hospital'>('ambulance-to-patient');
  const [steps, setSteps] = useState<AnimationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [completedPath, setCompletedPath] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);

  useEffect(() => {
    if (isVisible) {
      const algorithmFn = algorithm === 'dijkstra' ? runDijkstraAnimated : runAStarAnimated;
      const { steps: animationSteps } = algorithmFn(graph, startNode, endNode);
      setSteps(animationSteps);
      setCurrentStep(0);
      setIsPlaying(false);
      setPhase('ambulance-to-patient');
      setCompletedPath([]);
      setCurrentPath([]);
    }
  }, [isVisible, graph, startNode, endNode, algorithm]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      }, speed);
    } else if (isPlaying && currentStep >= steps.length - 1) {
      setIsPlaying(false);
      // If first phase complete, start second phase
      if (phase === 'ambulance-to-patient' && steps[currentStep]?.type === 'complete') {
        setTimeout(() => {
          const algorithmFn = algorithm === 'dijkstra' ? runDijkstraAnimated : runAStarAnimated;
          const { steps: hospitalSteps } = algorithmFn(graph, endNode, hospitalNode);
          setSteps(hospitalSteps);
          setCurrentStep(0);
          setPhase('patient-to-hospital');
          setCurrentPath([]);
          setIsPlaying(true);
        }, 1000);
      }
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentStep, steps.length, speed, phase, graph, startNode, endNode, hospitalNode]);

  // Update current path from animation step data
  useEffect(() => {
    const stepData = steps[currentStep];
    if (stepData?.currentPath) {
      if (phase === 'ambulance-to-patient') {
        setCompletedPath(stepData.currentPath);
      } else if (phase === 'patient-to-hospital') {
        setCurrentPath(stepData.currentPath);
      }
    }
  }, [currentStep, phase, steps]);

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];
  const visitedNodes = currentStepData?.visited || [];
  const frontierNodes = currentStepData?.frontier || [];

  const getNodeColor = (nodeId: string) => {
    if (nodeId === hospitalNode) return '#22c55e';
    if (nodeId === endNode && phase === 'ambulance-to-patient') return '#f59e0b';
    if (nodeId === startNode && phase === 'ambulance-to-patient') return '#3b82f6';
    if (nodeId === endNode && phase === 'patient-to-hospital') return '#3b82f6';
    if (completedPath.includes(nodeId)) return '#1e40af';
    if (currentPath.includes(nodeId)) return '#dc2626';
    if (visitedNodes.includes(nodeId)) return '#64748b';
    if (frontierNodes.includes(nodeId)) return '#eab308';
    return '#cbd5e1';
  };

  return (
    <div className="animation-overlay">
      <div className="animation-modal">
        <div className="animation-header">
          <h3>{algorithm === 'dijkstra' ? 'Dijkstra' : 'A*'} Algorithm Animation</h3>
          <div className="algorithm-selector">
            <button
              className={`algo-btn ${algorithm === 'dijkstra' ? 'active' : ''}`}
              onClick={() => {
                setAlgorithm('dijkstra');
                setCurrentStep(0);
                setPhase('ambulance-to-patient');
                setCompletedPath([]);
                setCurrentPath([]);
                const { steps: animationSteps } = runDijkstraAnimated(graph, startNode, endNode);
                setSteps(animationSteps);
              }}
            >
              Dijkstra
            </button>
            <button
              className={`algo-btn ${algorithm === 'astar' ? 'active' : ''}`}
              onClick={() => {
                setAlgorithm('astar');
                setCurrentStep(0);
                setPhase('ambulance-to-patient');
                setCompletedPath([]);
                setCurrentPath([]);
                const { steps: animationSteps } = runAStarAnimated(graph, startNode, endNode);
                setSteps(animationSteps);
              }}
            >
              A*
            </button>
          </div>
          <div className="phase-indicator">
            <span className={`phase ${phase === 'ambulance-to-patient' ? 'active' : ''}`}>
              Phase 1: Ambulance → Patient
            </span>
            <span className="arrow">→</span>
            <span className={`phase ${phase === 'patient-to-hospital' ? 'active' : ''}`}>
              Phase 2: Patient → Hospital
            </span>
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
              setPhase('ambulance-to-patient');
              setCompletedPath([]);
              setCurrentPath([]);
              const algorithmFn = algorithm === 'dijkstra' ? runDijkstraAnimated : runAStarAnimated;
              const { steps: animationSteps } = algorithmFn(graph, startNode, endNode);
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

        <div className="animation-info">
          <div className="info-item">
            <span className="info-label">Phase:</span>
            <span className="info-value">{phase === 'ambulance-to-patient' ? 'Ambulance → Patient' : 'Patient → Hospital'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Step:</span>
            <span className="info-value">{currentStep + 1} / {steps.length}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Current Node:</span>
            <span className="info-value">{currentStepData?.node || '-'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Action:</span>
            <span className="info-value">{currentStepData?.type || '-'}</span>
          </div>
          {algorithm === 'astar' && currentStepData?.gScore !== undefined && (
            <>
              <div className="info-item">
                <span className="info-label">G-Score:</span>
                <span className="info-value">{currentStepData.gScore.toFixed(2)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">F-Score:</span>
                <span className="info-value">{currentStepData.fScore?.toFixed(2) || '-'}</span>
              </div>
            </>
          )}
          <div className="info-item">
            <span className="info-label">Visited:</span>
            <span className="info-value">{visitedNodes.length}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Frontier:</span>
            <span className="info-value">{frontierNodes.length}</span>
          </div>
          {completedPath.length > 0 && (
            <div className="info-item" style={{ gridColumn: '1 / -1' }}>
              <span className="info-label">Phase 1 Path:</span>
              <span className="info-value">{completedPath.join(' → ')}</span>
            </div>
          )}
          {currentPath.length > 0 && (
            <div className="info-item" style={{ gridColumn: '1 / -1' }}>
              <span className="info-label">Phase 2 Path:</span>
              <span className="info-value">{currentPath.join(' → ')}</span>
            </div>
          )}
        </div>

        <div className="animation-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#3b82f6' }}></div>
            <span>Start (Current)</span>
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
            <span>Phase 1 Path</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#dc2626' }}></div>
            <span>Phase 2 Path</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#eab308' }}></div>
            <span>Frontier</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#64748b' }}></div>
            <span>Visited</span>
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
            const isInCompletedPath = completedPath.some((node, i) => {
              if (i < completedPath.length - 1) {
                return (completedPath[i] === edge.from && completedPath[i + 1] === edge.to) ||
                       (completedPath[i] === edge.to && completedPath[i + 1] === edge.from);
              }
              return false;
            });
            const isInCurrentPath = currentPath.some((node, i) => {
              if (i < currentPath.length - 1) {
                return (currentPath[i] === edge.from && currentPath[i + 1] === edge.to) ||
                       (currentPath[i] === edge.to && currentPath[i + 1] === edge.from);
              }
              return false;
            });
            let strokeColor = '#cbd5e1';
            let strokeWidth = 2;
            if (isInCompletedPath) {
              strokeColor = '#1e40af';
              strokeWidth = 4;
            } else if (isInCurrentPath) {
              strokeColor = '#dc2626';
              strokeWidth = 4;
            }
            return (
              <line
                key={idx}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
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

export default AlgorithmAnimation;
