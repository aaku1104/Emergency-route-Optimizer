import React from 'react';
import { AlgorithmResult } from '../types';

interface Props {
  dijkstraResult: AlgorithmResult | null;
  astarResult: AlgorithmResult | null;
}

const ResultCard: React.FC<{ title: string; result: AlgorithmResult | null; badgeClass: string }> = ({ title, result, badgeClass }) => (
  <div className="result-card">
    <span className={`algorithm-badge ${badgeClass}`}>{title}</span>
    {result ? (
      <>
        <div className="path-display">
          {result.path.join(' → ') || 'No path found'}
        </div>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="label">Est. Time</div>
            <div className="value">{result.totalTime === Infinity ? '∞' : result.totalTime.toFixed(2)}m</div>
          </div>
          <div className="stat-item">
            <div className="label">Nodes Explored</div>
            <div className="value">{result.nodesExplored}</div>
          </div>
          <div className="stat-item">
            <div className="label">Execution Time</div>
            <div className="value">{result.executionTime.toFixed(3)}ms</div>
          </div>
          <div className="stat-item">
            <div className="label">Path Length</div>
            <div className="value">{result.path.length}</div>
          </div>
        </div>
      </>
    ) : (
      <p style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>Run algorithm to see results</p>
    )}
  </div>
);

const ResultPanel: React.FC<Props> = ({ dijkstraResult, astarResult }) => {
  return (
    <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
      <div style={{ flex: 1 }}>
        <ResultCard title="Dijkstra" result={dijkstraResult} badgeClass="dijkstra-badge" />
      </div>
      <div style={{ flex: 1 }}>
        <ResultCard title="A-Star" result={astarResult} badgeClass="astar-badge" />
      </div>
    </div>
  );
};

export default ResultPanel;