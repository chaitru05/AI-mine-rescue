import { useState, useEffect } from 'react';
import { useMine } from '../store/MineContext';

export default function CameraFeed({ type = 'rgb' }) {
  const { state } = useMine();
  const isRGB = type === 'rgb';
  const [tick, setTick] = useState(0);

  // Animate camera overlay
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const now = new Date().toLocaleTimeString('en-US', { hour12: false });
  const isRunning = state.simulation.isRunning;
  const networkLost = state.networkLost;
  const workers = state.workers;
  const hasWorker = workers.length > 0;
  const methane = state.sensors.methane;
  const riskLevel = state.aiAnalysis.riskLevel;
  const currentTunnel = state.rover.currentTunnel;
  const depth = state.rover.currentDepth;
  const isHazardous = riskLevel === 'CRITICAL' || riskLevel === 'HIGH';

  return (
    <div className="camera-feed" style={{ position: 'relative', minHeight: 220, background: '#000', overflow: 'hidden' }}>

      {/* ── Main camera view ── */}
      {networkLost ? (
        <SignalLostView />
      ) : isRGB ? (
        <RGBView workers={workers} isHazardous={isHazardous} methane={methane} tick={tick} isRunning={isRunning} currentTunnel={currentTunnel} />
      ) : (
        <ThermalView workers={workers} isRunning={isRunning} tick={tick} />
      )}

      {/* ── Top HUD overlay ── */}
      <div className="camera-overlay-top">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="camera-label">{isRGB ? '📷 CAM-01 RGB' : '🌡 THERMAL-01'}</span>
          {!networkLost && (
            <span style={{
              fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.06em',
              color: isRunning ? '#22c55e' : '#64748b',
              background: isRunning ? 'rgba(34,197,94,0.15)' : 'rgba(100,116,139,0.15)',
              padding: '2px 6px', borderRadius: 4
            }}>
              {isRunning ? '● LIVE' : '○ STANDBY'}
            </span>
          )}
          {isHazardous && isRunning && (
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#DC2626', background: 'rgba(220,38,38,0.2)', padding: '2px 6px', borderRadius: 4 }}>
              ⚠ ENV ALERT
            </span>
          )}
        </div>
        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono' }}>{now}</span>
      </div>

      {/* ── Bottom HUD overlay ── */}
      <div className="camera-overlay-bottom">
        <div className="camera-info">
          <div style={{ display: 'flex', gap: 12 }}>
            <span>{currentTunnel}</span>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Depth: {depth}m</span>
          </div>

          {/* RGB: AI detection overlay */}
          {isRGB && (
            <div style={{ marginTop: 4 }}>
              {!isRunning ? (
                <span style={{ color: '#64748b' }}>🔍 AI Detection: STANDBY</span>
              ) : hasWorker ? (
                <span style={{ color: '#22c55e', fontWeight: 600 }}>
                  ✅ PERSON DETECTED — {workers.length} worker{workers.length > 1 ? 's' : ''}
                </span>
              ) : isHazardous ? (
                <span style={{ color: '#F59E0B', fontWeight: 600 }}>
                  ⚠ ENVIRONMENTAL HAZARD — CH₄ {methane.toFixed(1)}%
                </span>
              ) : (
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                  🔍 AI Detection: Scanning{'.'.repeat((tick % 3) + 1)}
                </span>
              )}
            </div>
          )}

          {/* Thermal: heat signature info */}
          {!isRGB && (
            <div style={{ marginTop: 4 }}>
              {!isRunning ? (
                <span style={{ color: '#64748b' }}>Thermal scanner: STANDBY</span>
              ) : hasWorker ? (
                <div>
                  {workers.map(w => (
                    <div key={w.id} style={{ color: '#F59E0B', fontWeight: 600 }}>
                      🔥 {w.id} — {w.confidence}% confidence — {(36.5 + Math.random() * 5).toFixed(1)}°C
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Thermal scanning{'.'.repeat((tick % 3) + 1)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// RGB Camera View
// ──────────────────────────────────────────────────────────
function RGBView({ workers, isHazardous, methane, tick, isRunning, currentTunnel }) {
  const hasWorker = workers.length > 0;
  const showHazardSmoke = isHazardous && methane > 4;

  return (
    <svg width="100%" height="100%" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="rgb_tunnelLight" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={isHazardous ? '#3A2A10' : '#2A3042'} />
          <stop offset="60%" stopColor={isHazardous ? '#1E1608' : '#151A28'} />
          <stop offset="100%" stopColor="#0A0E18" />
        </radialGradient>
        <linearGradient id="rgb_ceilGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0D1117" />
          <stop offset="100%" stopColor="#1A2035" />
        </linearGradient>
        {showHazardSmoke && (
          <filter id="smoke_blur">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        )}
      </defs>

      {/* Background */}
      <rect width="400" height="220" fill="url(#rgb_tunnelLight)" />

      {/* Hazard color tint */}
      {isHazardous && <rect width="400" height="220" fill="rgba(120,60,0,0.2)" />}

      {/* Tunnel perspective geometry */}
      <polygon points="0,0 160,60 240,60 400,0" fill="url(#rgb_ceilGrad)" opacity="0.6" />
      <polygon points="0,220 160,160 240,160 400,220" fill="#0D1117" opacity="0.5" />
      <line x1="0" y1="0" x2="160" y2="60" stroke="rgba(100,116,139,0.25)" strokeWidth="1" />
      <line x1="0" y1="220" x2="160" y2="160" stroke="rgba(100,116,139,0.25)" strokeWidth="1" />
      <line x1="400" y1="0" x2="240" y2="60" stroke="rgba(100,116,139,0.25)" strokeWidth="1" />
      <line x1="400" y1="220" x2="240" y2="160" stroke="rgba(100,116,139,0.25)" strokeWidth="1" />

      {/* Wall texture */}
      {[80, 130, 170, 200, 230, 270, 320].map((x, i) => (
        <line key={i} x1={x} y1={30 + Math.abs(200 - x) * 0.15} x2={x} y2={190 - Math.abs(200 - x) * 0.15}
          stroke="rgba(100,116,139,0.07)" strokeWidth="1" />
      ))}

      {/* Floor track lines */}
      <line x1="180" y1="160" x2="190" y2="220" stroke="rgba(100,116,139,0.15)" strokeWidth="2" />
      <line x1="220" y1="160" x2="210" y2="220" stroke="rgba(100,116,139,0.15)" strokeWidth="2" />

      {/* Ceiling bolt markers */}
      {[185, 200, 215].map((x, i) => (
        <rect key={i} x={x - 2} y={57 + i * 4} width="4" height={106 - i * 8} rx="1"
          fill="rgba(100,116,139,0.07)" />
      ))}

      {/* Light bulb */}
      <circle cx="200" cy="65" r="3" fill={isHazardous ? '#FF8800' : '#F59E0B'} opacity="0.7" />
      <circle cx="200" cy="65" r="10" fill={isHazardous ? '#FF8800' : '#F59E0B'} opacity="0.08" />

      {/* Hazard smoke particles */}
      {showHazardSmoke && (
        <g filter="url(#smoke_blur)">
          {[100, 160, 220, 280, 340].map((x, i) => (
            <circle key={i} cx={x} cy={80 + i * 15} r={20 + i * 8}
              fill={`rgba(200,180,100,${0.04 + i * 0.01})`} />
          ))}
        </g>
      )}

      {/* Person bounding box + body */}
      {hasWorker && workers.map((w, idx) => {
        const bx = 155 + idx * 60;
        return (
          <g key={w.id}>
            {/* Bounding box */}
            <rect x={bx} y={82} width={52} height={73} rx="2"
              fill="none" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="4,2">
              {isRunning && <animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite" />}
            </rect>
            {/* Label tag */}
            <rect x={bx} y={76} width={62} height={13} rx="2" fill="rgba(22,163,74,0.85)" />
            <text x={bx + 4} y={86} fill="white" fontSize="8" fontFamily="Inter" fontWeight="700">
              PERSON {w.confidence}%
            </text>
            {/* Stick figure */}
            <circle cx={bx + 26} cy={96} r={7} fill="rgba(245,158,11,0.55)" />
            <rect x={bx + 20} y={104} width={12} height={26} rx="3" fill="rgba(245,158,11,0.4)" />
            <line x1={bx + 20} y1={110} x2={bx + 12} y2={122} stroke="rgba(245,158,11,0.35)" strokeWidth="2" />
            <line x1={bx + 32} y1={110} x2={bx + 40} y2={122} stroke="rgba(245,158,11,0.35)" strokeWidth="2" />
          </g>
        );
      })}

      {/* Corner scan reticle */}
      {isRunning && (
        <g>
          <line x1="8" y1="8" x2="22" y2="8" stroke="rgba(37,99,235,0.6)" strokeWidth="1.5" />
          <line x1="8" y1="8" x2="8" y2="22" stroke="rgba(37,99,235,0.6)" strokeWidth="1.5" />
          <line x1="378" y1="8" x2="392" y2="8" stroke="rgba(37,99,235,0.6)" strokeWidth="1.5" />
          <line x1="392" y1="8" x2="392" y2="22" stroke="rgba(37,99,235,0.6)" strokeWidth="1.5" />
          <line x1="8" y1="212" x2="22" y2="212" stroke="rgba(37,99,235,0.6)" strokeWidth="1.5" />
          <line x1="8" y1="212" x2="8" y2="198" stroke="rgba(37,99,235,0.6)" strokeWidth="1.5" />
          <line x1="378" y1="212" x2="392" y2="212" stroke="rgba(37,99,235,0.6)" strokeWidth="1.5" />
          <line x1="392" y1="212" x2="392" y2="198" stroke="rgba(37,99,235,0.6)" strokeWidth="1.5" />
        </g>
      )}

      {/* Scan line */}
      {isRunning && (
        <line x1="0" y1="0" x2="400" y2="0" stroke="rgba(37,99,235,0.2)" strokeWidth="1">
          <animate attributeName="y1" values="0;220;0" dur="4s" repeatCount="indefinite" />
          <animate attributeName="y2" values="0;220;0" dur="4s" repeatCount="indefinite" />
        </line>
      )}

      {/* CH4 warning overlay */}
      {methane > 4.0 && (
        <g>
          <rect x="4" y="185" width="120" height="16" rx="2" fill="rgba(220,38,38,0.85)" />
          <text x="8" y="196" fill="white" fontSize="9" fontFamily="Inter" fontWeight="700">
            ☣ CH₄ {methane.toFixed(1)}% — HAZARD
          </text>
        </g>
      )}
    </svg>
  );
}

// ──────────────────────────────────────────────────────────
// Thermal Camera View
// ──────────────────────────────────────────────────────────
function ThermalView({ workers, isRunning, tick }) {
  const hasWorker = workers.length > 0;

  return (
    <svg width="100%" height="100%" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="therm_bg" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#1a0a2e" />
          <stop offset="100%" stopColor="#080414" />
        </radialGradient>
        {workers.map((w, i) => (
          <radialGradient key={`hg${i}`} id={`heatSig_${i}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF3333" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#FF8800" stopOpacity="0.65" />
            <stop offset="55%" stopColor="#FFCC00" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFCC00" stopOpacity="0" />
          </radialGradient>
        ))}
        <linearGradient id="therm_scale" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#1a0a4e" />
          <stop offset="33%" stopColor="#3322AA" />
          <stop offset="66%" stopColor="#FF8800" />
          <stop offset="100%" stopColor="#FF2222" />
        </linearGradient>
        <radialGradient id="therm_ambient" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#150a3a" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0a0520" stopOpacity="0.1" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width="400" height="220" fill="url(#therm_bg)" />
      <rect width="400" height="220" fill="url(#therm_ambient)" />

      {/* Cool tunnel walls */}
      <polygon points="0,0 160,60 240,60 400,0" fill="#1a0a4e" opacity="0.35" />
      <polygon points="0,220 160,160 240,160 400,220" fill="#0a0528" opacity="0.45" />

      {/* Ambient thermal noise (rocks/walls) */}
      {[40, 80, 120, 300, 340, 370].map((x, i) => (
        <circle key={i}
          cx={x} cy={50 + i * 20}
          r={8 + i * 2}
          fill={`rgba(${40 + i * 8}, ${10 + i * 5}, ${80 + i * 10}, 0.15)`}
        />
      ))}

      {/* Heat signatures — shown only when workers detected */}
      {hasWorker && workers.map((w, i) => {
        const cx = 175 + i * 55;
        const cy = 105 + i * 8;
        return (
          <g key={w.id}>
            <circle cx={cx} cy={cy} r="42" fill={`url(#heatSig_${i})`}>
              {isRunning && <animate attributeName="r" values="40;46;40" dur={`${2.8 + i * 0.5}s`} repeatCount="indefinite" />}
            </circle>
            <circle cx={cx} cy={cy - 12} r="9" fill="#FF2222" opacity="0.9" />
            <rect x={cx - 6} y={cy} width="12" height="24" rx="4" fill="#FF5500" opacity="0.75" />
            <text x={cx} y={cy + 36} textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="8" fontFamily="Inter" fontWeight="700">
              {w.id}
            </text>
            <text x={cx} y={cy + 46} textAnchor="middle" fill="rgba(255,180,100,0.9)" fontSize="7" fontFamily="JetBrains Mono">
              {(36.5 + (i + 1) * 2.8).toFixed(1)}°C
            </text>
            {/* Detection box */}
            <rect x={cx - 28} y={cy - 30} width={56} height={72} rx="2"
              fill="none" stroke="#FF6600" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.8">
              {isRunning && <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.2s" repeatCount="indefinite" />}
            </rect>
          </g>
        );
      })}

      {/* Hotspot from rock */}
      <circle cx="310" cy="75" r="13" fill="#FF4400" opacity="0.22">
        {isRunning && <animate attributeName="r" values="11;16;11" dur="2s" repeatCount="indefinite" />}
      </circle>

      {/* Human heat signature banner */}
      {hasWorker && (
        <g>
          <rect x="115" y="9" width="170" height="18" rx="3" fill="rgba(255,68,0,0.25)" stroke="rgba(255,68,0,0.5)" strokeWidth="0.5" />
          <text x="200" y="21" textAnchor="middle" fill="#FF6644" fontSize="8.5" fontFamily="Inter" fontWeight="700">
            ▲ HUMAN HEAT SIGNATURE
          </text>
        </g>
      )}

      {/* Scanning label */}
      {!hasWorker && isRunning && (
        <text x="200" y="110" textAnchor="middle" fill="rgba(100,100,200,0.6)" fontSize="11" fontFamily="Inter" fontWeight="600">
          Thermal scanning{'.'.repeat((tick % 3) + 1)}
        </text>
      )}

      {/* Temperature scale */}
      <rect x="376" y="50" width="10" height="120" rx="3" fill="url(#therm_scale)" />
      <text x="374" y="48" fill="rgba(255,255,255,0.45)" fontSize="7" fontFamily="JetBrains Mono" textAnchor="end">45°C</text>
      <text x="374" y="115" fill="rgba(255,255,255,0.45)" fontSize="7" fontFamily="JetBrains Mono" textAnchor="end">25°C</text>
      <text x="374" y="175" fill="rgba(255,255,255,0.45)" fontSize="7" fontFamily="JetBrains Mono" textAnchor="end">10°C</text>

      {/* Scan line */}
      {isRunning && (
        <line x1="0" y1="0" x2="400" y2="0" stroke="rgba(100,50,220,0.15)" strokeWidth="1">
          <animate attributeName="y1" values="0;220;0" dur="3s" repeatCount="indefinite" />
          <animate attributeName="y2" values="0;220;0" dur="3s" repeatCount="indefinite" />
        </line>
      )}
    </svg>
  );
}

// ──────────────────────────────────────────────────────────
// Signal Lost View
// ──────────────────────────────────────────────────────────
function SignalLostView() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill="#0a0a0a" />
      {/* Static noise effect */}
      {Array.from({ length: 60 }).map((_, i) => (
        <rect key={i}
          x={Math.random() * 400} y={Math.random() * 220}
          width={2 + Math.random() * 6} height={1 + Math.random() * 2}
          fill={`rgba(255,255,255,${Math.random() * 0.08})`}
        />
      ))}
      <text x="200" y="95" textAnchor="middle" fill="rgba(220,38,38,0.9)" fontSize="28" fontFamily="Inter" fontWeight="800">
        📡
      </text>
      <text x="200" y="118" textAnchor="middle" fill="rgba(220,38,38,0.8)" fontSize="13" fontFamily="Inter" fontWeight="700">
        SIGNAL LOST
      </text>
      <text x="200" y="134" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="Inter">
        Communication link interrupted
      </text>
      <text x="200" y="147" textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="JetBrains Mono">
        Last known position recorded
      </text>
    </svg>
  );
}
