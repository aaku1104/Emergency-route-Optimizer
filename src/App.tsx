import React, { useState, useEffect } from 'react';
import { CityGraph, AlgorithmResult, TrafficLevel, TSPComparison } from './types';
import { initialCityMap } from './data/cityMap';
import { runDijkstra } from './algorithms/Dijkstra';
import { runAStar } from './algorithms/AStar';
import { exactTSP, nearestNeighborTSP, compareTSP } from './algorithms/TSP';
import GraphVisualization from './components/GraphVisualization';
import ResultPanel from './components/ResultPanel';
import AlgorithmAnimation from './components/AlgorithmAnimation';
import TSPComparisonPanel from './components/TSPComparisonPanel';
import TSPAnimation from './components/TSPAnimation';
import './App.css';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [graph, setGraph] = useState<CityGraph>(initialCityMap);
  const [ambulanceLoc, setAmbulanceLoc] = useState('A');
  const [patientLoc, setPatientLoc] = useState('D');
  const [hospitalLoc, setHospitalLoc] = useState('H');

  const [dijkstraToPatient, setDijkstraToPatient] = useState<AlgorithmResult | null>(null);
  const [astarToPatient, setAstarToPatient] = useState<AlgorithmResult | null>(null);
  const [dijkstraToHospital, setDijkstraToHospital] = useState<AlgorithmResult | null>(null);
  const [astarToHospital, setAstarToHospital] = useState<AlgorithmResult | null>(null);

  const [activePath1, setActivePath1] = useState<string[]>([]);
  const [activePath2, setActivePath2] = useState<string[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showTSPAnimation, setShowTSPAnimation] = useState(false);
  const [tspComparison, setTspComparison] = useState<TSPComparison | null>(null);
  const tspPatients = ['B', 'C', 'D', 'E'];
  const tspHospitals = ['H'];

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const handleTrafficChange = (index: number, newTraffic: TrafficLevel) => {
    const newEdges = [...graph.edges];
    newEdges[index] = { ...newEdges[index], traffic: newTraffic };
    setGraph({ ...graph, edges: newEdges });
  };

  const findRoutes = () => {
    // 1. Ambulance -> Patient
    const dRes1 = runDijkstra(graph, ambulanceLoc, patientLoc);
    const aRes1 = runAStar(graph, ambulanceLoc, patientLoc);
    setDijkstraToPatient(dRes1);
    setAstarToPatient(aRes1);

    // 2. Patient -> Hospital
    const dRes2 = runDijkstra(graph, patientLoc, hospitalLoc);
    const aRes2 = runAStar(graph, patientLoc, hospitalLoc);
    setDijkstraToHospital(dRes2);
    setAstarToHospital(aRes2);

    // Set separate paths for visualization with different colors
    setActivePath1(aRes1.path);
    setActivePath2(aRes2.path);
  };

  const runTSP = () => {
    // For demo, use multiple patients and hospitals
    // In a real implementation, these would be selected by the user
    const patients = ['B', 'C', 'D', 'E']; // Example patients
    const hospitals = ['H']; // Single hospital for now

    const exact = exactTSP(graph, ambulanceLoc, patients, hospitals);
    const approximate = nearestNeighborTSP(graph, ambulanceLoc, patients, hospitals);
    const comparison = compareTSP(exact, approximate);

    setTspComparison(comparison);

    // Update visualization with the exact route
    setActivePath1(exact.route);
    setActivePath2([]);
  };

  return (
    <div className={`App ${darkMode ? 'dark' : ''}`}>
      <div className="header">
        <h1>Emergency Route Optimizer</h1>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
      <p className="subtitle">Advanced pathfinding using Dijkstra and A* algorithms with dynamic traffic simulation</p>
      
      <div className="main-layout">
        <div className="left-panel">
          <div className="control-group">
            <label>Start Location:</label>
            <select value={ambulanceLoc} onChange={e => setAmbulanceLoc(e.target.value)}>
              {graph.nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
            
            <label>Patient Location:</label>
            <select value={patientLoc} onChange={e => setPatientLoc(e.target.value)}>
              {graph.nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>

            <label>Hospital Location:</label>
            <select value={hospitalLoc} onChange={e => setHospitalLoc(e.target.value)}>
              {graph.nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>

            <button onClick={findRoutes} className="find-btn">Find Optimal Route</button>
            <button onClick={runTSP} className="tsp-btn">
              🔄 Run TSP Comparison
            </button>
            <button onClick={() => setShowTSPAnimation(true)} className="tsp-animation-btn">
              ▶ Animate TSP
            </button>
            <button onClick={() => setShowAnimation(true)} className="animation-btn">
              ▶ Animate Dijkstra/A*
            </button>
            <button onClick={() => setShowAnalytics(!showAnalytics)} className="analytics-btn">
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </button>
          </div>

          <h3>Dynamic Traffic Updates</h3>
          <div className="traffic-list">
            {graph.edges.map((edge, idx) => (
              <div key={idx} className="traffic-item">
                <span>{edge.from} → {edge.to}</span>
                <select value={edge.traffic} onChange={e => handleTrafficChange(idx, e.target.value as TrafficLevel)}>
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Heavy">Heavy</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="right-panel">
          <GraphVisualization graph={graph} highlightPath1={activePath1} highlightPath2={activePath2} />
          
          <h3>Start to Patient</h3>
          <ResultPanel dijkstraResult={dijkstraToPatient} astarResult={astarToPatient} />
          
          <h3>Patient to Hospital</h3>
          <ResultPanel dijkstraResult={dijkstraToHospital} astarResult={astarToHospital} />

          <TSPComparisonPanel comparison={tspComparison} />

          {showAnalytics && (
            <div className="analytics-dashboard">
              <h3>Performance Analytics</h3>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h4>Execution Time Comparison</h4>
                  <div className="chart-container">
                    {dijkstraToPatient && astarToPatient && (
                      <div className="bar-chart">
                        <div className="bar-group">
                          <div className="bar-label">Dijkstra</div>
                          <div className="bar" style={{ width: `${Math.min((dijkstraToPatient.executionTime / Math.max(dijkstraToPatient.executionTime, astarToPatient.executionTime)) * 100, 100)}%`, background: '#3b82f6' }}>
                            <span>{dijkstraToPatient.executionTime.toFixed(2)}ms</span>
                          </div>
                        </div>
                        <div className="bar-group">
                          <div className="bar-label">A-Star</div>
                          <div className="bar" style={{ width: `${Math.min((astarToPatient.executionTime / Math.max(dijkstraToPatient.executionTime, astarToPatient.executionTime)) * 100, 100)}%`, background: '#ec4899' }}>
                            <span>{astarToPatient.executionTime.toFixed(2)}ms</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="analytics-card">
                  <h4>Nodes Explored</h4>
                  <div className="chart-container">
                    {dijkstraToPatient && astarToPatient && (
                      <div className="bar-chart">
                        <div className="bar-group">
                          <div className="bar-label">Dijkstra</div>
                          <div className="bar" style={{ width: `${Math.min((dijkstraToPatient.nodesExplored / Math.max(dijkstraToPatient.nodesExplored, astarToPatient.nodesExplored)) * 100, 100)}%`, background: '#3b82f6' }}>
                            <span>{dijkstraToPatient.nodesExplored}</span>
                          </div>
                        </div>
                        <div className="bar-group">
                          <div className="bar-label">A-Star</div>
                          <div className="bar" style={{ width: `${Math.min((astarToPatient.nodesExplored / Math.max(dijkstraToPatient.nodesExplored, astarToPatient.nodesExplored)) * 100, 100)}%`, background: '#ec4899' }}>
                            <span>{astarToPatient.nodesExplored}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="analytics-card">
                  <h4>Total Time Comparison (Both Legs)</h4>
                  <div className="chart-container">
                    {dijkstraToPatient && astarToPatient && dijkstraToHospital && astarToHospital && (
                      <div className="bar-chart">
                        <div className="bar-group">
                          <div className="bar-label">Dijkstra Total</div>
                          <div className="bar" style={{ width: `${Math.min(((dijkstraToPatient.totalTime + dijkstraToHospital.totalTime) / Math.max(dijkstraToPatient.totalTime + dijkstraToHospital.totalTime, astarToPatient.totalTime + astarToHospital.totalTime)) * 100, 100)}%`, background: '#3b82f6' }}>
                            <span>{(dijkstraToPatient.totalTime + dijkstraToHospital.totalTime).toFixed(2)}m</span>
                          </div>
                        </div>
                        <div className="bar-group">
                          <div className="bar-label">A-Star Total</div>
                          <div className="bar" style={{ width: `${Math.min(((astarToPatient.totalTime + astarToHospital.totalTime) / Math.max(dijkstraToPatient.totalTime + dijkstraToHospital.totalTime, astarToPatient.totalTime + astarToHospital.totalTime)) * 100, 100)}%`, background: '#ec4899' }}>
                            <span>{(astarToPatient.totalTime + astarToHospital.totalTime).toFixed(2)}m</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="analytics-card">
                  <h4>Efficiency Score</h4>
                  <div className="efficiency-metrics">
                    {dijkstraToPatient && astarToPatient && (
                      <>
                        <div className="metric">
                          <span className="metric-label">Dijkstra Efficiency:</span>
                          <span className="metric-value">{((dijkstraToPatient.path.length / dijkstraToPatient.nodesExplored) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">A-Star Efficiency:</span>
                          <span className="metric-value">{((astarToPatient.path.length / astarToPatient.nodesExplored) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Speedup:</span>
                          <span className="metric-value">
                            {dijkstraToPatient.executionTime > 0 
                              ? `${(dijkstraToPatient.executionTime / astarToPatient.executionTime).toFixed(2)}x`
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Time Saved:</span>
                          <span className="metric-value">
                            {dijkstraToPatient.totalTime > 0 && astarToPatient.totalTime > 0
                              ? `${((dijkstraToPatient.totalTime - astarToPatient.totalTime) / dijkstraToPatient.totalTime * 100).toFixed(1)}%`
                              : 'N/A'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="analytics-card full-width">
                  <h4>Path Length Comparison</h4>
                  <div className="dual-chart">
                    {dijkstraToPatient && astarToPatient && dijkstraToHospital && astarToHospital && (
                      <>
                        <div className="chart-section">
                          <h5>Ambulance → Patient</h5>
                          <div className="bar-chart">
                            <div className="bar-group">
                              <div className="bar-label">Dijkstra</div>
                              <div className="bar" style={{ width: `${Math.min((dijkstraToPatient.path.length / Math.max(dijkstraToPatient.path.length, astarToPatient.path.length)) * 100, 100)}%`, background: '#3b82f6' }}>
                                <span>{dijkstraToPatient.path.length} nodes</span>
                              </div>
                            </div>
                            <div className="bar-group">
                              <div className="bar-label">A-Star</div>
                              <div className="bar" style={{ width: `${Math.min((astarToPatient.path.length / Math.max(dijkstraToPatient.path.length, astarToPatient.path.length)) * 100, 100)}%`, background: '#ec4899' }}>
                                <span>{astarToPatient.path.length} nodes</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="chart-section">
                          <h5>Patient → Hospital</h5>
                          <div className="bar-chart">
                            <div className="bar-group">
                              <div className="bar-label">Dijkstra</div>
                              <div className="bar" style={{ width: `${Math.min((dijkstraToHospital.path.length / Math.max(dijkstraToHospital.path.length, astarToHospital.path.length)) * 100, 100)}%`, background: '#3b82f6' }}>
                                <span>{dijkstraToHospital.path.length} nodes</span>
                              </div>
                            </div>
                            <div className="bar-group">
                              <div className="bar-label">A-Star</div>
                              <div className="bar" style={{ width: `${Math.min((astarToHospital.path.length / Math.max(dijkstraToHospital.path.length, astarToHospital.path.length)) * 100, 100)}%`, background: '#ec4899' }}>
                                <span>{astarToHospital.path.length} nodes</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <AlgorithmAnimation
        graph={graph}
        startNode={ambulanceLoc}
        endNode={patientLoc}
        hospitalNode={hospitalLoc}
        isVisible={showAnimation}
        onClose={() => setShowAnimation(false)}
      />

      <TSPAnimation
        graph={graph}
        startNode={ambulanceLoc}
        patients={tspPatients}
        hospitals={tspHospitals}
        isVisible={showTSPAnimation}
        onClose={() => setShowTSPAnimation(false)}
      />
    </div>
  );
};

export default App;