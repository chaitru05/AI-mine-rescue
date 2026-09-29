import { useMine, useSensorCompat, MISSION_WAYPOINTS } from '../store/MineContext';
import PageHeader from '../components/PageHeader';
import MineMap from '../components/MineMap';
import CameraFeed from '../components/CameraFeed';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Play, RotateCcw, Square, Users, MapPin, Battery, Gauge,
  Thermometer, Wind, Signal, Clock, Brain, Route, AlertTriangle,
  Bot, Wifi, Navigation, ArrowDown,
} from 'lucide-react';

export default function RescueSimulation() {
  const { state, dispatch, simulateEvent, resetState } = useMine();
  const { gases, environment } = useSensorCompat(state);

  const s = state;
  const isRunning = s.simulation.isRunning;
  const simTime = s.simulation.simTime;
  const networkLost = s.networkLost;

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const sc = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(sc).padStart(2, '0')}`;
  };

  const startSim = () => {
    resetState();
    setTimeout(() => dispatch({ type: 'START_SIMULATION' }), 100);
  };

  const stopSim = () => dispatch({ type: 'STOP_SIMULATION' });
  const restartSim = () => { dispatch({ type: 'STOP_SIMULATION' }); setTimeout(resetState, 100); };

  const riskColor = {
    LOW: 'var(--safe)', MEDIUM: 'var(--warning)', HIGH: 'var(--warning)', CRITICAL: 'var(--critical)',
  }[s.aiAnalysis.riskLevel] || 'var(--text)';

  // Chart data from rolling history
  const chartData = s.sensorHistory.slice(-30);

  return (
    <>
      <PageHeader
        title="Rescue Mission Simulation"
        subtitle="Real-time autonomous underground mine reconnaissance and rescue"
      />

      <div className="page-content">

        {/* ── Simulation Time Banner ── */}
        {isRunning && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.10))',
            border: '1px solid rgba(37,99,235,0.3)',
            borderRadius: 'var(--radius)', padding: '12px 20px', marginBottom: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          }}>
            <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: 2 }}>Simulation Time</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{formatTime(simTime)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: 2 }}>Mission Phase</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>
                  {MISSION_WAYPOINTS[s.simulation.currentStep]?.label || 'Initializing...'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: 2 }}>AI Risk</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: riskColor }}>{s.aiAnalysis.riskLevel}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 1s ease infinite' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#22c55e' }}>LIVE MISSION RUNNING</span>
            </div>
          </div>
        )}

        {/* ── Controls ── */}
        <div className="card mb-20">
          <div className="card-header">
            <h3>🎮 Simulation Controls</h3>
            {isRunning && <span className="badge badge-safe">● RUNNING — {formatTime(simTime)}</span>}
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 8 }}>Mission</div>
                <div className="sim-controls">
                  <button className="btn btn-primary" onClick={startSim} disabled={isRunning}>
                    <Play size={14} /> Start Mission
                  </button>
                  <button className="btn btn-outline" onClick={restartSim}>
                    <RotateCcw size={14} /> Restart
                  </button>
                  <button className="btn btn-danger" onClick={stopSim} disabled={!isRunning}>
                    <Square size={14} /> Stop Mission
                  </button>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 8 }}>Manual Events</div>
                <div className="sim-events">
                  <button className="sim-event-btn" onClick={() => simulateEvent('SIMULATE_GAS_LEAK', { tunnelId: 'T-B' })}>☣ Gas Leak</button>
                  <button className="sim-event-btn" onClick={() => simulateEvent('SIMULATE_WORKER_DETECTION', { tunnelId: 'T-F' })}>👷 Worker Detection</button>
                  <button className="sim-event-btn" onClick={() => simulateEvent('SIMULATE_COLLAPSE', { tunnelId: 'T-D' })}>🧱 Collapse</button>
                  <button className="sim-event-btn" onClick={() => simulateEvent('SIMULATE_FLOODING', { tunnelId: 'T-H' })}>🌊 Flooding</button>
                  <button className="sim-event-btn" onClick={() => simulateEvent('SIMULATE_NETWORK_LOSS')}>📡 Network Loss</button>
                  <button className="sim-event-btn" onClick={() => simulateEvent('SIMULATE_NETWORK_RESTORE')}>📡 Restore</button>
                  <button className="sim-event-btn" onClick={() => simulateEvent('SIMULATE_LOW_BATTERY')}>🔋 Low Battery</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Summary Stats ── */}
        <div className="summary-cards mb-20" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
          <SimStat label="Workers" value={String(s.workersDetected).padStart(2, '0')} icon={<Users size={14} />} color="orange" />
          <SimStat label="Hazards" value={String(s.hazardsDetected).padStart(2, '0')} icon={<AlertTriangle size={14} />} color="red" />
          <SimStat label="Coverage" value={`${s.mineCoverage}%`} icon={<MapPin size={14} />} color="cyan" />
          <SimStat label="Battery" value={`${s.rover.battery}%`} icon={<Battery size={14} />} color={s.rover.battery < 20 ? 'red' : 'green'} />
          <SimStat label="Speed" value={`${s.rover.speed} m/s`} icon={<Gauge size={14} />} color="blue" />
          <SimStat label="Distance" value={`${s.rover.distance} km`} icon={<Route size={14} />} color="blue" />
          <SimStat label="Progress" value={`${s.missionProgress}%`} icon={<Clock size={14} />} color="purple" />
        </div>

        {/* ── Mine Map + Timeline ── */}
        <div className="grid-3-1 mb-20">
          <div className="card">
            <div className="card-header">
              <h3><MapPin size={16} /> Underground Digital Twin</h3>
              <span className="badge badge-info" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
                {s.rover.currentTunnel} • {s.rover.currentDepth}m
              </span>
            </div>
            <MineMap height={560} interactive />
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Mission Progress</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{s.missionProgress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill blue" style={{ width: `${s.missionProgress}%`, transition: 'width 1s ease' }} />
              </div>
            </div>
          </div>

          <div className="card" style={{ maxHeight: 680, overflowY: 'auto' }}>
            <div className="card-header">
              <h3><Clock size={16} /> Mission Log</h3>
              {isRunning && <span style={{ fontSize: '0.6rem', color: '#22c55e', fontWeight: 700 }}>● LIVE</span>}
            </div>
            <div className="card-body" style={{ padding: '12px 16px' }}>
              {s.missionEvents.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center', padding: '30px 0' }}>
                  Mission not started
                </div>
              ) : (
                <div className="timeline">
                  {s.missionEvents.map((item) => (
                    <div key={item.id} className="timeline-item">
                      <div className={`timeline-dot ${item.type} active`} />
                      <div className="timeline-time">{item.time}</div>
                      <div className="timeline-text">{item.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Cameras (side-by-side) ── */}
        <div className="grid-2 mb-20">
          <div className="card">
            <div className="card-header">
              <h3>📷 RGB Camera</h3>
              <span className="badge badge-critical" style={{ fontSize: '0.6rem' }}>● LIVE</span>
            </div>
            <CameraFeed type="rgb" />
          </div>
          <div className="card">
            <div className="card-header">
              <h3>🌡 Thermal Camera</h3>
              <span className="badge badge-critical" style={{ fontSize: '0.6rem' }}>● LIVE</span>
            </div>
            <CameraFeed type="thermal" />
          </div>
        </div>

        {/* ── Live Telemetry (4-col) ── */}
        <div className="card mb-20">
          <div className="card-header">
            <h3><Bot size={16} /> Live Rover Telemetry</h3>
            {isRunning && <span className="badge badge-safe" style={{ fontSize: '0.6rem' }}>● LIVE</span>}
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <TelBox label="Rover ID" value={s.rover.id} icon={<Bot size={14} />} />
              <TelBox label="Status" value={s.rover.status} icon={<Navigation size={14} />} color={s.rover.status === 'Moving' ? 'var(--safe)' : 'var(--text-secondary)'} />
              <TelBox label="Current Tunnel" value={s.rover.currentTunnel} icon={<MapPin size={14} />} color="var(--primary)" />
              <TelBox label="Depth" value={`${s.rover.currentDepth} m`} icon={<ArrowDown size={14} />} />
              <TelBox label="Speed" value={`${s.rover.speed} m/s`} icon={<Gauge size={14} />} />
              <TelBox label="Battery" value={`${s.rover.battery}%`} icon={<Battery size={14} />} color={s.rover.battery < 20 ? 'var(--critical)' : 'var(--safe)'} />
              <TelBox label="Signal" value={networkLost ? 'DISCONNECTED' : `${s.rover.signal}%`} icon={<Signal size={14} />} color={networkLost ? 'var(--critical)' : 'var(--primary)'} />
              <TelBox label="Distance" value={`${s.rover.distance} km`} icon={<Route size={14} />} />
            </div>
          </div>
        </div>

        {/* ── Gas Monitoring (live) ── */}
        <div className="card mb-20">
          <div className="card-header">
            <h3><Wind size={16} /> Live Gas Monitoring</h3>
            {isRunning && <span className="badge badge-safe" style={{ fontSize: '0.6rem' }}>● LIVE</span>}
          </div>
          <div className="card-body">
            <div className="gas-grid">
              {Object.entries(gases).map(([key, gas]) => (
                <GasItem key={key} gas={gas} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Environmental Monitoring (live) ── */}
        <div className="card mb-20">
          <div className="card-header">
            <h3><Thermometer size={16} /> Live Environmental Monitoring</h3>
            {isRunning && <span className="badge badge-safe" style={{ fontSize: '0.6rem' }}>● LIVE</span>}
          </div>
          <div className="card-body">
            <div className="env-grid">
              {Object.entries(environment).map(([key, env]) => (
                <EnvItem key={key} name={env.label || key} value={`${env.value} ${env.unit || ''}`} status={env.status} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Real-Time Sensor Charts ── */}
        <div className="card mb-20">
          <div className="card-header">
            <h3>📈 Real-Time Sensor History</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Last 30 readings</span>
          </div>
          <div className="card-body">
            <div className="grid-2" style={{ gap: 20 }}>
              <SensorChart data={chartData} dataKey="methane" label={`CH₄ Methane — ${gases.methane.value}%`} color="#DC2626" threshold={5.5} />
              <SensorChart data={chartData} dataKey="temperature" label={`Temperature — ${environment.temperature.value}°C`} color="#F59E0B" />
              <SensorChart data={chartData} dataKey="oxygen" label={`O₂ Oxygen — ${gases.oxygen.value}%`} color="#16A34A" />
              <SensorChart data={chartData} dataKey="co" label={`CO — ${gases.co.value} ppm`} color="#8B5CF6" threshold={50} />
            </div>
          </div>
        </div>

        {/* ── AI Decision Panel ── */}
        <div className="card ai-card mb-20">
          <div className="card-header">
            <h3><Brain size={16} /> AI Rescue Decision Engine</h3>
            <span className="badge badge-ai">AI POWERED</span>
          </div>
          <div className="card-body">
            <div className="grid-2" style={{ gap: 24 }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 10 }}>Situation Assessment</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <SitItem label={`Workers detected: ${s.workersDetected}`} severity={s.workersDetected > 0 ? 'warning' : 'safe'} />
                  <SitItem label={`Methane: ${gases.methane.value}%`} severity={gases.methane.status} />
                  <SitItem label={`Structural integrity: ${environment.structural.value}%`} severity={environment.structural.status} />
                  <SitItem label={`Oxygen: ${gases.oxygen.value}%`} severity={gases.oxygen.status} />
                  <SitItem label={`Air quality: ${environment.airQuality.value}`} severity={environment.airQuality.status} />
                </div>
                <div style={{ marginTop: 16, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 8 }}>AI Analysis</div>
                <div className="ai-analysis-text" style={{ fontSize: '0.82rem' }}>
                  "{s.aiAnalysis.text}"
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 10 }}>Active Route</div>
                <div style={{ padding: 14, background: 'var(--ai-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--ai-border)', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 600, color: 'var(--ai)', flexWrap: 'wrap' }}>
                    <Route size={16} />
                    {s.aiRoute.length > 0
                      ? s.aiRoute.map((rId, i) => {
                          const t = (s.tunnels || []).find(t => t.id === rId);
                          return <span key={rId}>{t?.name || rId}{i < s.aiRoute.length - 1 ? ' → ' : ''}</span>;
                        })
                      : 'No active route'}
                  </div>
                  {s.altRouteLabel && (
                    <div style={{ marginTop: 8, fontSize: '0.72rem', color: 'var(--warning)' }}>
                      ⚠ Rerouted to avoid {s.gasLeakTunnel}
                    </div>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="ai-metric">
                    <label>Risk Level</label>
                    <span style={{ color: riskColor, fontWeight: 800 }}>{s.aiAnalysis.riskLevel}</span>
                  </div>
                  <div className="ai-metric">
                    <label>AI Confidence</label>
                    <span style={{ color: 'var(--ai)' }}>{s.aiAnalysis.confidence}%</span>
                  </div>
                  <div className="ai-metric" style={{ gridColumn: 'span 2' }}>
                    <label>Recommendation</label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text)', fontWeight: 500 }}>{s.aiAnalysis.recommendation}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Alert Center ── */}
        <div className="card mb-20">
          <div className="card-header">
            <h3><AlertTriangle size={16} /> 🚨 Alert Center</h3>
            <span className="badge badge-critical">{s.alerts.length} ALERTS</span>
          </div>
          <div className="card-body">
            {s.alerts.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center', padding: '20px 0' }}>
                No alerts — system nominal
              </div>
            ) : (
              s.alerts.slice(0, 8).map(alert => (
                <div key={alert.id} className="alert-item">
                  <span className={`alert-dot ${alert.severity}`} />
                  <div className="alert-content">
                    <div className={`alert-severity ${alert.severity}`}>{alert.severity.toUpperCase()}</div>
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-meta">
                      <span>{alert.location}</span>
                      <span>{alert.time}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────

function SimStat({ label, value, icon, color }) {
  return (
    <div className="summary-card">
      <div className="sc-top">
        <span className="sc-label">{label}</span>
        <span className={`sc-icon ${color}`}>{icon}</span>
      </div>
      <div className="sc-value" style={{ fontSize: '1.25rem' }}>{value}</div>
    </div>
  );
}

function TelBox({ label, value, icon, color }) {
  return (
    <div style={{ padding: 12, border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: color || 'var(--text)', transition: 'color 0.5s' }}>
        {value}
      </div>
    </div>
  );
}

function GasItem({ gas }) {
  const pct =
    gas.formula === 'O₂' ? Math.min(100, (gas.value / 21) * 100)
    : gas.formula === 'CH₄' ? Math.min(100, (gas.value / 8) * 100)
    : gas.formula === 'CO' ? Math.min(100, (gas.value / 60) * 100)
    : gas.formula === 'CO₂' ? Math.min(100, (gas.value / 3000) * 100)
    : Math.min(100, (gas.value / 15) * 100);

  return (
    <div className="gas-item">
      <div className="gas-item-header">
        <div>
          <div className="gas-name">{gas.label}</div>
          <div className="gas-formula">{gas.formula}</div>
        </div>
        <span className={`badge badge-${gas.status}`}>
          {gas.status === 'critical' ? '⚠ CRITICAL' : gas.status === 'warning' ? '⚠ WARNING' : '✓ SAFE'}
        </span>
      </div>
      <div className="gas-value" style={{ color: gas.status === 'critical' ? 'var(--critical)' : gas.status === 'warning' ? 'var(--warning)' : 'var(--safe)', transition: 'color 0.5s' }}>
        {gas.value} {gas.unit}
      </div>
      <div className="progress-bar">
        <div className={`progress-fill ${gas.status}`} style={{ width: `${pct}%`, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

function EnvItem({ name, value, status }) {
  return (
    <div className="env-item">
      <div className="env-item-header">
        <span className="env-name">{name}</span>
        <span className={`badge badge-${status}`} style={{ fontSize: '0.6rem' }}>{status.toUpperCase()}</span>
      </div>
      <div className="env-value" style={{
        color: status === 'critical' ? 'var(--critical)' : status === 'warning' ? 'var(--warning)' : 'var(--text)',
        transition: 'color 0.5s',
      }}>{value}</div>
    </div>
  );
}

function SitItem({ label, severity }) {
  const color = severity === 'critical' ? 'var(--critical)' : severity === 'warning' ? 'var(--warning)' : 'var(--safe)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', border: '1px solid var(--card-border)', borderRadius: 6, fontSize: '0.78rem' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {label}
    </div>
  );
}

function SensorChart({ data, dataKey, label, color, threshold }) {
  return (
    <div>
      <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: 8, color: 'var(--text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{label}</span>
        {threshold && data.length > 0 && data[data.length - 1][dataKey] > threshold && (
          <span style={{ fontSize: '0.65rem', color: '#DC2626', fontWeight: 700 }}>⚠ THRESHOLD EXCEEDED</span>
        )}
      </div>
      <div style={{ height: 130 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="time" tick={{ fontSize: 9 }} stroke="#94A3B8" interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 9 }} stroke="#94A3B8" width={36} />
            <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 8, fontSize: '0.72rem' }} />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
            {threshold && <Line type="monotone" data={data.map(d => ({ ...d, threshold }))} dataKey="threshold" stroke="rgba(220,38,38,0.4)" strokeWidth={1} strokeDasharray="5,3" dot={false} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
