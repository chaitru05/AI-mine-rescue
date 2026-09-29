import { useState } from 'react';
import { useMine, junctions, tunnelNetwork } from '../store/MineContext';

export default function MineMap({ showRoute = true, interactive = false, height = 500 }) {
  const { state } = useMine();
  const [zoom, setZoom] = useState(1);
  const [showHazards, setShowHazards] = useState(true);
  const [showWorkers, setShowWorkers] = useState(true);
  const [showAIRoute, setShowAIRoute] = useState(true);

  const { roverPosition, tunnels = [], hazards = [], workers = [], aiRoute = [] } = state;
  const isRunning = state.simulation.isRunning;
  const networkLost = state.networkLost;

  const handleZoom = (delta) => setZoom(z => Math.max(0.5, Math.min(2.5, z + delta)));

  const getJunction = (id) => junctions.find(j => j.id === id) || { x: 0, y: 0 };

  // Style per tunnel state
  const getTunnelStyle = (tunnel) => {
    const condition = tunnel.condition || 'safe';
    const status = tunnel.status || 'unexplored';

    if (status === 'unexplored') return { stroke: '#334155', dash: '5,4', width: 12, opacity: 0.35, glow: false };
    if (status === 'blocked') return { stroke: '#7C3AED', dash: '3,3', width: 12, opacity: 0.8, glow: false };

    // Explored
    if (condition === 'critical') return { stroke: '#DC2626', dash: 'none', width: 14, opacity: 0.9, glow: true };
    if (condition === 'warning') return { stroke: '#F59E0B', dash: 'none', width: 14, opacity: 0.85, glow: false };
    return { stroke: '#06B6D4', dash: 'none', width: 14, opacity: 0.8, glow: false };
  };

  // Infrastructure locations
  const infra = [
    { x: 400, y: 20, label: '⬆ SURFACE', color: 'rgba(56,189,248,0.5)' },
    { x: 100, y: 330, label: '🏥 REFUGE', color: 'rgba(22,163,74,0.6)' },
    { x: 600, y: 460, label: '⚡ CHARGE', color: 'rgba(250,204,21,0.6)' },
    { x: 400, y: 570, label: '🚪 E.EXIT', color: 'rgba(239,68,68,0.6)' },
  ];

  // Depth bands
  const depthBands = [
    { y: 40, label: 'SURFACE', y2: 60 },
    { y: 150, label: '-180m', y2: 170 },
    { y: 320, label: '-320m', y2: 340 },
    { y: 460, label: '-400m', y2: 480 },
    { y: 560, label: '-480m', y2: 580 },
  ];

  return (
    <div style={{ height, background: '#060D1B', position: 'relative', overflow: 'hidden', borderRadius: '0 0 8px 8px' }}>

      {/* Controls */}
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 20, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {[
          { label: '+', onClick: () => handleZoom(0.25), title: 'Zoom In' },
          { label: '−', onClick: () => handleZoom(-0.25), title: 'Zoom Out' },
          { label: '⊕ Center', onClick: () => setZoom(1), title: 'Reset' },
        ].map(b => (
          <button key={b.label} onClick={b.onClick} title={b.title} style={{
            background: 'rgba(12,18,34,0.9)', border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff', fontSize: '0.72rem', padding: '4px 8px', borderRadius: 5, cursor: 'pointer', fontFamily: 'Inter',
          }}>
            {b.label}
          </button>
        ))}
        <div style={{ width: 1, background: 'rgba(255,255,255,0.15)', margin: '0 3px' }} />
        {[
          { label: `☣ Hazards`, active: showHazards, toggle: () => setShowHazards(!showHazards), activeColor: '#DC2626' },
          { label: `👷 Workers`, active: showWorkers, toggle: () => setShowWorkers(!showWorkers), activeColor: '#F59E0B' },
          { label: `↗ AI Route`, active: showAIRoute, toggle: () => setShowAIRoute(!showAIRoute), activeColor: '#7C3AED' },
        ].map(b => (
          <button key={b.label} onClick={b.toggle} style={{
            background: b.active ? 'rgba(12,18,34,0.9)' : 'rgba(12,18,34,0.4)',
            border: `1px solid ${b.active ? b.activeColor : 'rgba(255,255,255,0.1)'}`,
            color: b.active ? b.activeColor : '#64748b',
            fontSize: '0.72rem', padding: '4px 8px', borderRadius: 5, cursor: 'pointer', fontFamily: 'Inter',
          }}>
            {b.label}
          </button>
        ))}
      </div>

      {/* SVG */}
      <svg width="100%" height="100%" viewBox="0 0 800 620" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="mm_grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(56,189,248,0.04)" strokeWidth="0.8" />
          </pattern>
          <filter id="mm_glow_red" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="mm_glow_blue" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="mm_rover_glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={networkLost ? 0.1 : 0.6} />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mm_hazard_pulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#DC2626" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.35s ease' }}>
          {/* Background */}
          <rect x="-200" y="-200" width="1200" height="1100" fill="url(#mm_grid)" />

          {/* Depth bands */}
          {depthBands.map((b, i) => (
            <g key={i}>
              <line x1="-200" y1={b.y} x2="1000" y2={b.y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <text x="752" y={b.y - 4} fill="rgba(255,255,255,0.18)" fontSize="9" fontFamily="JetBrains Mono" textAnchor="end">
                {b.label}
              </text>
            </g>
          ))}

          {/* Surface strip */}
          <rect x="-200" y="-10" width="1200" height="52" fill="rgba(30,58,95,0.12)" />
          <line x1="-200" y1="40" x2="1000" y2="40" stroke="rgba(56,189,248,0.25)" strokeWidth="1" strokeDasharray="8,4" />

          {/* Infrastructure labels */}
          {infra.map((item, i) => (
            <text key={i} x={item.x} y={item.y} textAnchor="middle"
              fill={item.color} fontSize="9" fontFamily="Inter" fontWeight="600">
              {item.label}
            </text>
          ))}

          {/* Tunnels */}
          {tunnelNetwork.map(tNet => {
            const tState = tunnels.find(t => t.id === tNet.id) || { status: 'unexplored', condition: 'safe' };
            const style = getTunnelStyle(tState);
            const from = getJunction(tNet.from);
            const to = getJunction(tNet.to);

            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;
            const isVertical = Math.abs(from.x - to.x) < Math.abs(from.y - to.y);

            return (
              <g key={tNet.id}>
                {/* Glow layer */}
                {style.glow && (
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={style.stroke} strokeWidth={style.width + 8}
                    strokeOpacity={0.2} filter="url(#mm_glow_red)" strokeLinecap="round" />
                )}
                {/* Tunnel body */}
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={style.stroke} strokeWidth={style.width}
                  strokeOpacity={style.opacity} strokeDasharray={style.dash}
                  strokeLinecap="round" />
                {/* Inner track */}
                {tState.status === 'explored' && (
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke="rgba(255,255,255,0.15)" strokeWidth={1.5}
                    strokeDasharray="6,5" strokeLinecap="round" />
                )}
                {/* Label */}
                {tState.status === 'explored' && (
                  <text
                    x={mx} y={my - (isVertical ? 0 : 12)}
                    fill={style.stroke} fontSize="10" fontFamily="Inter" fontWeight="700"
                    textAnchor="middle" opacity="0.9"
                    transform={isVertical ? `rotate(-90 ${mx} ${my})` : undefined}
                    dy={isVertical ? -14 : 0}
                  >
                    {tNet.name}
                  </text>
                )}
                {/* Blocked marker */}
                {tState.status === 'blocked' && (
                  <g transform={`translate(${mx}, ${my})`}>
                    <rect x="-18" y="-8" width="36" height="16" rx="3" fill="rgba(124,58,237,0.4)" stroke="#7C3AED" strokeWidth="1" />
                    <text x="0" y="5" textAnchor="middle" fill="#C4B5FD" fontSize="8" fontFamily="Inter" fontWeight="700">BLOCKED</text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Junctions */}
          {junctions.map(j => {
            const isKey = ['J-0', 'J-1', 'J-3', 'J-6'].includes(j.id);
            return (
              <g key={j.id}>
                <circle cx={j.x} cy={j.y} r={isKey ? 9 : 6} fill="#060D1B" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                {isKey && (
                  <>
                    <circle cx={j.x} cy={j.y} r={3} fill="rgba(56,189,248,0.6)" />
                    <text x={j.x + 13} y={j.y + 4} fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="Inter" fontWeight="600">
                      {j.name}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* AI Route */}
          {showRoute && showAIRoute && aiRoute.length > 0 && (() => {
            // Build polyline points from route tunnel IDs
            const points = [];
            aiRoute.forEach(tId => {
              const tNet = tunnelNetwork.find(t => t.id === tId);
              if (!tNet) return;
              const from = getJunction(tNet.from);
              const to = getJunction(tNet.to);
              if (points.length === 0) points.push(`${from.x},${from.y}`);
              points.push(`${to.x},${to.y}`);
            });
            return (
              <g>
                <polyline points={points.join(' ')} fill="none"
                  stroke="#7C3AED" strokeWidth="4.5" strokeDasharray="9,6"
                  strokeLinejoin="round" strokeLinecap="round" opacity="0.85">
                  <animate attributeName="stroke-dashoffset" from="30" to="0" dur="1.5s" repeatCount="indefinite" />
                </polyline>
                <rect x="320" y="180" width="90" height="16" rx="3" fill="rgba(124,58,237,0.3)" stroke="rgba(124,58,237,0.6)" strokeWidth="0.5" />
                <text x="365" y="191" textAnchor="middle" fill="#C4B5FD" fontSize="8.5" fontFamily="Inter" fontWeight="700">
                  ↗ AI ROUTE
                </text>
              </g>
            );
          })()}

          {/* Hazards */}
          {showHazards && hazards.map(h => {
            if (h.status !== 'Active') return null;
            const tNet = tunnelNetwork.find(t => t.id === h.tunnelId);
            if (!tNet) return null;
            const from = getJunction(tNet.from);
            const to = getJunction(tNet.to);
            const hx = (from.x + to.x) / 2 + 10;
            const hy = (from.y + to.y) / 2 + 10;
            const color = h.severity === 'critical' ? '#DC2626' : '#F59E0B';
            return (
              <g key={h.id}>
                <circle cx={hx} cy={hy} r="30" fill="url(#mm_hazard_pulse)">
                  {isRunning && <animate attributeName="r" values="22;36;22" dur="2s" repeatCount="indefinite" />}
                </circle>
                <circle cx={hx} cy={hy} r="11" fill={color} stroke="white" strokeWidth="2" />
                <text x={hx} y={hy + 4} textAnchor="middle" fill="white" fontSize="11" fontWeight="900">!</text>
                <rect x={hx + 16} y={hy - 10} width="92" height="20" rx="3"
                  fill="#060D1B" stroke={color} strokeWidth="1" />
                <text x={hx + 20} y={hy + 4} fill={color} fontSize="8.5" fontFamily="Inter" fontWeight="800">
                  {h.type.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* Workers */}
          {showWorkers && workers.map((w, i) => {
            const tNet = tunnelNetwork.find(t => t.id === w.tunnelId);
            if (!tNet) return null;
            const from = getJunction(tNet.from);
            const to = getJunction(tNet.to);
            const wx = (from.x + to.x) / 2 + (i % 2 === 0 ? -20 : 20);
            const wy = (from.y + to.y) / 2 + (i % 2 === 0 ? 15 : -15);
            return (
              <g key={w.id}>
                <circle cx={wx} cy={wy} r="16" fill="rgba(245,158,11,0.2)" stroke="#F59E0B" strokeWidth="1.5">
                  {isRunning && <animate attributeName="r" values="14;19;14" dur="2.5s" repeatCount="indefinite" />}
                </circle>
                <circle cx={wx} cy={wy} r="7" fill="#F59E0B" />
                <text x={wx} y={wy + 3} textAnchor="middle" fill="white" fontSize="9" fontWeight="800">👷</text>
                <text x={wx} y={wy - 22} textAnchor="middle" fill="#FCD34D" fontSize="8.5" fontFamily="Inter" fontWeight="700">
                  {w.id}
                </text>
                <text x={wx} y={wy - 12} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7.5" fontFamily="Inter">
                  {w.confidence}%
                </text>
              </g>
            );
          })}

          {/* Rover */}
          <g transform={`translate(${roverPosition.x}, ${roverPosition.y})`}
            style={{ transition: isRunning ? 'transform 1.5s ease-in-out' : 'none' }}>
            {/* Glow */}
            <circle cx="0" cy="0" r="35" fill="url(#mm_rover_glow)">
              {isRunning && !networkLost && <animate attributeName="r" values="28;42;28" dur="2s" repeatCount="indefinite" />}
            </circle>
            {/* Body */}
            <circle cx="0" cy="0" r="13" fill={networkLost ? '#374151' : '#2563EB'} stroke={networkLost ? '#6B7280' : '#60A5FA'} strokeWidth="2.5" />
            <circle cx="0" cy="0" r="5" fill="white" opacity={networkLost ? 0.3 : 0.9} />

            {/* ID label */}
            <rect x="18" y="-11" width="52" height="18" rx="3"
              fill="rgba(6,13,27,0.85)" stroke={networkLost ? '#6B7280' : '#3B82F6'} strokeWidth="1" />
            <text x="44" y="1" textAnchor="middle" fill={networkLost ? '#9CA3AF' : '#93C5FD'}
              fontSize="9.5" fontFamily="Inter" fontWeight="800">
              RV-01
            </text>
            {networkLost && (
              <text x="0" y="28" textAnchor="middle" fill="#DC2626" fontSize="8" fontFamily="Inter" fontWeight="700">
                OFFLINE
              </text>
            )}
          </g>

        </g>
      </svg>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 14, right: 14,
        background: 'rgba(6,13,27,0.9)', backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8, padding: '10px 14px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 18px',
      }}>
        {[
          { color: '#06B6D4', line: true, label: 'Explored' },
          { color: '#334155', line: true, dash: true, label: 'Unexplored' },
          { color: '#DC2626', dot: true, label: 'Critical' },
          { color: '#F59E0B', dot: true, label: 'Warning' },
          { color: '#7C3AED', line: true, dash: true, label: 'AI Route' },
          { color: '#2563EB', dot: true, label: 'Rover' },
          { color: '#F59E0B', label: '👷 Worker' },
          { color: '#DC2626', label: '☣ Hazard' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.68rem', color: '#cbd5e1' }}>
            {item.dot && <span style={{ width: 9, height: 9, borderRadius: '50%', background: item.color, flexShrink: 0 }} />}
            {item.line && !item.dot && <span style={{ width: 14, height: 2, background: item.color, borderBottom: item.dash ? `2px dashed ${item.color}` : undefined, background: item.dash ? 'transparent' : item.color, flexShrink: 0 }} />}
            {!item.dot && !item.line && <span style={{ fontSize: '0.75rem' }}></span>}
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
