import React from 'react';
import { CityGraph, TrafficLevel } from '../types';

interface Props {
  graph: CityGraph;
  highlightPath1: string[];
  highlightPath2: string[];
}

const trafficColors: Record<TrafficLevel, string> = {
  Low: '#22c55e',
  Moderate: '#eab308',
  Heavy: '#ef4444',
  Blocked: '#94a3b8',
};

const GraphVisualization: React.FC<Props> = ({ graph, highlightPath1, highlightPath2 }) => {
  const getNodeColor = (type: string) => {
    switch(type) {
      case 'Ambulance': return '#3b82f6';
      case 'Patient': return '#eab308';
      case 'Hospital': return '#22c55e';
      default: return '#64748b';
    }
  };

  const getEdgePathInfo = (from: string, to: string) => {
    let inPath1 = false;
    let inPath2 = false;

    for (let i = 0; i < highlightPath1.length - 1; i++) {
      if (
        (highlightPath1[i] === from && highlightPath1[i + 1] === to) ||
        (highlightPath1[i] === to && highlightPath1[i + 1] === from)
      ) {
        inPath1 = true;
        break;
      }
    }

    for (let i = 0; i < highlightPath2.length - 1; i++) {
      if (
        (highlightPath2[i] === from && highlightPath2[i + 1] === to) ||
        (highlightPath2[i] === to && highlightPath2[i + 1] === from)
      ) {
        inPath2 = true;
        break;
      }
    }

    return { inPath1, inPath2 };
  };

  return (
    <svg width="100%" height="400" viewBox="0 0 1000 600" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', borderRadius: '12px', border: '2px solid #0ea5e9', boxShadow: '0 4px 12px rgba(14, 165, 233, 0.15)' }}>
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.2"/>
        </filter>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Edges */}
      {graph.edges.map((edge, idx) => {
        const fromNode = graph.nodes.find(n => n.id === edge.from)!;
        const toNode = graph.nodes.find(n => n.id === edge.to)!;
        const { inPath1, inPath2 } = getEdgePathInfo(edge.from, edge.to);

        let strokeColor = trafficColors[edge.traffic];
        let strokeWidth = 3;
        let opacity = 0.75;
        let filter = 'none';

        if (inPath1 && inPath2) {
          // Edge is in both paths - use alternating or combined visual
          strokeColor = '#9333ea'; // Purple for both
          strokeWidth = 8;
          opacity = 1;
          filter = 'url(#glow)';
        } else if (inPath1) {
          // Phase 1 path - Blue
          strokeColor = '#1d4ed8';
          strokeWidth = 6;
          opacity = 1;
          filter = 'url(#glow)';
        } else if (inPath2) {
          // Phase 2 path - Red
          strokeColor = '#dc2626';
          strokeWidth = 6;
          opacity = 1;
          filter = 'url(#glow)';
        }

        return (
          <g key={idx}>
            {inPath1 && !inPath2 && (
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="#3b82f6"
                strokeWidth={10}
                strokeLinecap="round"
                opacity="0.2"
              />
            )}
            {inPath2 && !inPath1 && (
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="#ef4444"
                strokeWidth={10}
                strokeLinecap="round"
                opacity="0.2"
              />
            )}
            <line
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={edge.traffic === 'Blocked' ? '10,10' : '0'}
              strokeLinecap="round"
              opacity={opacity}
              filter={filter}
            />
          </g>
        );
      })}
      
      {/* Nodes */}
      {graph.nodes.map(node => (
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r={32}
            fill={getNodeColor(node.type)}
            stroke="white"
            strokeWidth="4"
            filter="url(#shadow)"
          />
          <circle
            cx={node.x}
            cy={node.y}
            r={26}
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="2"
          />
          <text x={node.x} y={node.y + 7} textAnchor="middle" fill="white" fontSize="18" fontWeight="800" fontFamily="Inter" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
            {node.id}
          </text>
          <text x={node.x} y={node.y + 52} textAnchor="middle" fill="#1e293b" fontSize="14" fontWeight="700" fontFamily="Inter" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
            {node.name}
          </text>
        </g>
      ))}
      
      {/* Legend */}
      <g transform="translate(20, 20)">
        <rect x="0" y="0" width="150" height="155" fill="white" rx="10" stroke="#0ea5e9" strokeWidth="2" filter="url(#shadow)" />
        <text x="16" y="26" fontSize="13" fontWeight="800" fill="#0c4a6e">Node Types</text>
        <circle cx="22" cy="48" r="9" fill="#3b82f6" />
        <text x="40" y="52" fontSize="12" fill="#334155" fontWeight="600">Start</text>
        <circle cx="22" cy="70" r="9" fill="#eab308" />
        <text x="40" y="74" fontSize="12" fill="#334155" fontWeight="600">Patient</text>
        <circle cx="22" cy="92" r="9" fill="#22c55e" />
        <text x="40" y="96" fontSize="12" fill="#334155" fontWeight="600">Hospital</text>
        <circle cx="22" cy="114" r="9" fill="#64748b" />
        <text x="40" y="118" fontSize="12" fill="#334155" fontWeight="600">Normal</text>
        <line x1="18" y1="134" x2="40" y2="134" stroke="#1d4ed8" strokeWidth="4" strokeLinecap="round" />
        <text x="48" y="138" fontSize="12" fill="#334155" fontWeight="600">Phase 1</text>
        <line x1="18" y1="149" x2="40" y2="149" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
        <text x="48" y="153" fontSize="12" fill="#334155" fontWeight="600">Phase 2</text>
      </g>
      
      {/* Traffic Legend */}
      <g transform="translate(830, 20)">
        <rect x="0" y="0" width="150" height="115" fill="white" rx="10" stroke="#0ea5e9" strokeWidth="2" filter="url(#shadow)" />
        <text x="16" y="26" fontSize="13" fontWeight="800" fill="#0c4a6e">Traffic Levels</text>
        <line x1="18" y1="44" x2="40" y2="44" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
        <text x="48" y="48" fontSize="12" fill="#334155" fontWeight="600">Low</text>
        <line x1="18" y1="66" x2="40" y2="66" stroke="#eab308" strokeWidth="4" strokeLinecap="round" />
        <text x="48" y="70" fontSize="12" fill="#334155" fontWeight="600">Moderate</text>
        <line x1="18" y1="88" x2="40" y2="88" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
        <text x="48" y="92" fontSize="12" fill="#334155" fontWeight="600">Heavy</text>
        <line x1="18" y1="110" x2="40" y2="110" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" strokeDasharray="5,5" />
        <text x="48" y="114" fontSize="12" fill="#334155" fontWeight="600">Blocked</text>
      </g>
    </svg>
  );
};

export default GraphVisualization;