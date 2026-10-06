import React from 'react';
import { AlgorithmType } from '../types/index';

interface ControlPanelProps {
  startNode: string;
  endNode: string;
  algorithm: AlgorithmType;
  onStartNodeChange: (value: string) => void;
  onEndNodeChange: (value: string) => void;
  onAlgorithmChange: (value: AlgorithmType) => void;
  onFindPath: () => void;
  onReset: () => void;
  availableNodes: string[];
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  startNode,
  endNode,
  algorithm,
  onStartNodeChange,
  onEndNodeChange,
  onAlgorithmChange,
  onFindPath,
  onReset,
  availableNodes,
}) => {
  return (
    <div className="control-panel">
      <h3>Route Controls</h3>
      
      <div className="control-group">
        <label htmlFor="startNode">Start Location:</label>
        <select
          id="startNode"
          value={startNode}
          onChange={(e) => onStartNodeChange(e.target.value)}
        >
          <option value="">Select start</option>
          {availableNodes.map(node => (
            <option key={node} value={node}>{node}</option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label htmlFor="endNode">Destination:</label>
        <select
          id="endNode"
          value={endNode}
          onChange={(e) => onEndNodeChange(e.target.value)}
        >
          <option value="">Select destination</option>
          {availableNodes.map(node => (
            <option key={node} value={node}>{node}</option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label htmlFor="algorithm">Algorithm:</label>
        <select
          id="algorithm"
          value={algorithm}
          onChange={(e) => onAlgorithmChange(e.target.value as AlgorithmType)}
        >
          <option value="dijkstra">Dijkstra</option>
          <option value="astar">A* Search</option>
        </select>
      </div>

      <div className="button-group">
        <button onClick={onFindPath} className="find-button">
          Find Route
        </button>
        <button onClick={onReset} className="reset-button">
          Reset
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
