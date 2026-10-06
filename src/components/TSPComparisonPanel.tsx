import React from 'react';
import { TSPComparison } from '../types';

interface Props {
  comparison: TSPComparison | null;
}

const TSPComparisonPanel: React.FC<Props> = ({ comparison }) => {
  if (!comparison) {
    return (
      <div className="tsp-comparison-panel">
        <h3>TSP Algorithm Comparison</h3>
        <p className="placeholder">Run route optimization to see TSP comparison</p>
      </div>
    );
  }

  const { exact, approximate, distanceDifference, timeDifference, distanceError, timeError } = comparison;

  return (
    <div className="tsp-comparison-panel">
      <h3>TSP Algorithm Comparison</h3>

      <div className="tsp-results-grid">
        {/* Exact TSP */}
        <div className="tsp-result-card exact">
          <div className="algorithm-badge exact-badge">Exact (Brute Force)</div>
          <div className="tsp-route">
            <strong>Route:</strong>
            <span className="route-path">{exact.route.join(' → ')}</span>
          </div>
          <div className="tsp-stats">
            <div className="stat">
              <span className="stat-label">Total Distance:</span>
              <span className="stat-value">{exact.totalDistance.toFixed(2)} km</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Time:</span>
              <span className="stat-value">{exact.totalTime.toFixed(2)} min</span>
            </div>
            <div className="stat">
              <span className="stat-label">Execution Time:</span>
              <span className="stat-value">{exact.executionTime.toFixed(3)} ms</span>
            </div>
            <div className="stat">
              <span className="stat-label">Nodes Explored:</span>
              <span className="stat-value">{exact.nodesExplored}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Complexity:</span>
              <span className="stat-value">O(n!)</span>
            </div>
          </div>
        </div>

        {/* Approximate TSP */}
        <div className="tsp-result-card approximate">
          <div className="algorithm-badge approximate-badge">Nearest Neighbor</div>
          <div className="tsp-route">
            <strong>Route:</strong>
            <span className="route-path">{approximate.route.join(' → ')}</span>
          </div>
          <div className="tsp-stats">
            <div className="stat">
              <span className="stat-label">Total Distance:</span>
              <span className="stat-value">{approximate.totalDistance.toFixed(2)} km</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Time:</span>
              <span className="stat-value">{approximate.totalTime.toFixed(2)} min</span>
            </div>
            <div className="stat">
              <span className="stat-label">Execution Time:</span>
              <span className="stat-value">{approximate.executionTime.toFixed(3)} ms</span>
            </div>
            <div className="stat">
              <span className="stat-label">Nodes Explored:</span>
              <span className="stat-value">{approximate.nodesExplored}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Complexity:</span>
              <span className="stat-value">O(n²)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Metrics */}
      <div className="tsp-comparison-metrics">
        <h4>Comparison Analysis</h4>
        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-label">Distance Difference:</span>
            <span className={`metric-value ${distanceDifference > 0 ? 'positive' : 'neutral'}`}>
              {distanceDifference > 0 ? '+' : ''}{distanceDifference.toFixed(2)} km
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Time Difference:</span>
            <span className={`metric-value ${timeDifference > 0 ? 'positive' : 'neutral'}`}>
              {timeDifference > 0 ? '+' : ''}{timeDifference.toFixed(2)} min
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Distance Error:</span>
            <span className={`metric-value ${distanceError > 5 ? 'warning' : 'good'}`}>
              {distanceError.toFixed(2)}%
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Time Error:</span>
            <span className={`metric-value ${timeError > 5 ? 'warning' : 'good'}`}>
              {timeError.toFixed(2)}%
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Speedup:</span>
            <span className="metric-value good">
              {(exact.executionTime / approximate.executionTime).toFixed(2)}x faster
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Quality:</span>
            <span className={`metric-value ${comparison.exactOptimal ? 'good' : 'warning'}`}>
              {comparison.exactOptimal ? 'Near Optimal' : 'Suboptimal'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TSPComparisonPanel;
