import { useMine, useSensorCompat } from '../store/MineContext';
import PageHeader from '../components/PageHeader';
import MineMap from '../components/MineMap';
import CameraFeed from '../components/CameraFeed';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Radio, Bot, Users, AlertTriangle, MapPin, Wifi,
  Battery, Signal, Gauge, Navigation, Clock, ArrowDown,
  Thermometer, Wind, Eye, Brain, ShieldAlert,
} from 'lucide-react';

export default function Dashboard() {
  const { state } = useMine();
  const { gases, environment } = useSensorCompat(state);

  const s = state;
  const isRunning = s.simulation.isRunning;
  const riskColor = { LOW: 'var(--safe)', MEDIUM: 'var(--warning)', HIGH: 'var(--warning)', CRITICAL: 'var(--critical)' }[s.aiAnalysis.riskLevel] || 'var(--text)';

  // Chart data
  const chartData = s.sensorHistory.slice(-30);

  return (
    <>
      <PageHeader
        title="Mine Safety Command Center"
        subtitle="Real-time underground mine monitoring, hazard detection and rescue intelligence"
      />

      <div className="page-content">

        {/* ── System Status Banner ── */}
        <div style={{
          padding: '10px 20px', borderRadius: 'var(--radius)',
          background: isRunning ? 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(37,99,235,0.08))' : 'rgba(100,116,139,0.08)',
          border: `1px solid ${isRunning ? 'rgba(34,197,94,0.25)' : 'rgba(100,116,139,0.2)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10,
        }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <StatusPill label="Mission" value={s.mission.systemStatus} active={isRunning} />
            <StatusPill label="Rover" value={s.rover.status} active={isRunning} />
            <StatusPill label="AI Risk" value={s.aiAnalysis.riskLevel} color={riskColor} />
            <StatusPill label="Current Tunnel" value={s.rover.currentTunnel} />
          </div>
          {isRunning && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1s ease infinite', display: 'inline-block' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22c55e' }}>LIVE MONITORING</span>
            </div>
          )}
        </div>

        {/* ── Summary Cards ── */}
        <div className="summary-cards mb-20">
          <SummaryCard label="Mission ID" value={s.mission.id} sub={isRunning ? 'Active Mission' : 'Standby'} subClass={isRunning ? 'safe' : ''} icon={<Radio size={16} />} color="blue" />
          <SummaryCard label="Rover Status" value={s.rover.status.toUpperCase()} sub="RV-01" subClass={isRunning ? 'safe' : ''} icon={<Bot size={16} />} color="green" />
          <SummaryCard label="Workers Detected" value={String(s.workersDetected).padStart(2, '0')} sub={s.workersDetected > 0 ? `${s.workersDetected} Possible Survivor${s.workersDetected > 1 ? 's' : ''}` : 'None detected'} subClass={s.workersDetected > 0 ? 'critical' : ''} icon={<Users size={16} />} color="orange" />
          <SummaryCard label="Active Hazards" value={String(s.hazardsDetected).padStart(2, '0')} sub={`${s.criticalHazards} Critical`} subClass={s.criticalHazards > 0 ? 'critical' : ''} icon={<AlertTriangle size={16} />} color="red" />
          <SummaryCard label="Mine Coverage" value={`${s.mineCoverage}%`} sub="Area surveyed" icon={<MapPin size={16} />} color="cyan" />
          <SummaryCard label="Signal" value={s.networkLost ? 'LOST' : `${s.rover.signal}%`} sub={s.rover.connection} subClass={s.networkLost ? 'critical' : 'safe'} icon={<Wifi size={16} />} color={s.networkLost ? 'red' : 'green'} />
        </div>

        {/* ── Mine Map + Rover Telemetry ── */}
        <div className="grid-3-1 mb-20">
          <div className="card">
            <div className="card-header">
              <h3><MapPin size={16} /> Underground Mine Digital Twin</h3>
              <span className="badge badge-info">{isRunning ? 'LIVE' : 'STANDBY'}</span>
            </div>
            <MineMap height={460} />
          </div>

          <div className="card">
            <div className="card-header">
              <h3><Bot size={16} /> Rover Telemetry</h3>
              <span className="badge badge-safe" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>RV-01</span>
            </div>
            <div className="card-body">
              <div className="telemetry-grid">
                <TelRow icon={<Bot size={14} />} label="Rover ID" value="RV-01" />
                <TelRow icon={<Eye size={14} />} label="Status" value={`● ${s.rover.status}`} valueClass={isRunning ? 'green' : ''} />
                <TelRow icon={<Battery size={14} />} label="Battery" value={`${s.rover.battery}%`} valueClass={s.rover.battery < 20 ? 'red' : 'green'} />
                <TelRow icon={<Wifi size={14} />} label="Connection" value={s.rover.connection} valueClass={s.networkLost ? 'red' : 'green'} />
                <TelRow icon={<Signal size={14} />} label="Signal" value={s.networkLost ? '0%' : `${s.rover.signal}%`} valueClass="blue" />
                <TelRow icon={<Gauge size={14} />} label="Speed" value={`${s.rover.speed} m/s`} />
                <TelRow icon={<MapPin size={14} />} label="Distance" value={`${s.rover.distance} km`} />
                <TelRow icon={<Navigation size={14} />} label="Current Tunnel" value={s.rover.currentTunnel} valueClass="blue" />
                <TelRow icon={<ArrowDown size={14} />} label="Depth" value={`${s.rover.currentDepth} m`} />
                <TelRow icon={<Navigation size={14} />} label="Navigation" value={s.rover.navigation} valueClass="blue" />
                <TelRow icon={<Clock size={14} />} label="Progress" value={`${s.missionProgress}%`} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Gas + Environmental Monitoring ── */}
        <div className="grid-2 mb-20">
          <div className="card">
            <div className="card-header">
              <h3><Wind size={16} /> Gas Monitoring</h3>
              {isRunning && <span style={{ fontSize: '0.6rem', color: '#22c55e', fontWeight: 700 }}>● LIVE</span>}
            </div>
            <div className="card-body">
              <div className="gas-grid">
                {Object.entries(gases).map(([key, gas]) => (
                  <GasItem key={key} gas={gas} />
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3><Thermometer size={16} /> Environmental Monitoring</h3>
              {isRunning && <span style={{ fontSize: '0.6rem', color: '#22c55e', fontWeight: 700 }}>● LIVE</span>}
            </div>
            <div className="card-body">
              <div className="env-grid">
                <EnvItem name="Temperature" value={`${environment.temperature.value} °C`} status={environment.temperature.status} trend={environment.temperature.trend} />
                <EnvItem name="Humidity" value={`${environment.humidity.value}%`} status={environment.humidity.status} trend={environment.humidity.trend} />
                <EnvItem name="Smoke" value={`${environment.smoke.value} ppm`} status={environment.smoke.status} trend={environment.smoke.trend} />
                <EnvItem name="Pressure" value={`${environment.pressure.value} hPa`} status={environment.pressure.status} trend={environment.pressure.trend} />
                <EnvItem name="Air Quality" value={environment.airQuality.value} status={environment.airQuality.status} trend={environment.airQuality.trend} />
                <EnvItem name="Structural Stability" value={`${environment.structural.value}%`} status={environment.structural.status} trend={environment.structural.trend} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Camera Feeds ── */}
        <div className="grid-2 mb-20">
          <div className="card">
            <div className="card-header">
              <h3><Eye size={16} /> Live Camera</h3>
              <span className="badge badge-critical" style={{ fontSize: '0.6rem' }}>● LIVE</span>
            </div>
            <CameraFeed type="rgb" />
          </div>
          <div className="card">
            <div className="card-header">
              <h3><Thermometer size={16} /> Thermal Imaging</h3>
              <span className="badge badge-critical" style={{ fontSize: '0.6rem' }}>● LIVE</span>
            </div>
            <CameraFeed type="thermal" />
          </div>
        </div>

        {/* ── AI Analysis + Hazard Detection ── */}
        <div className="grid-2 mb-20">
          <div className="card ai-card">
            <div className="card-header">
              <h3><Brain size={16} /> AI Situation Analysis</h3>
              <span className="badge badge-ai">AI POWERED</span>
            </div>
            <div className="card-body">
              <div className="ai-analysis-text">"{s.aiAnalysis.text}"</div>
              <div className="ai-metrics">
                <div className="ai-metric">
                  <label>Risk Level</label>
                  <span style={{ color: riskColor, fontWeight: 800 }}>{s.aiAnalysis.riskLevel}</span>
                </div>
                <div className="ai-metric">
                  <label>AI Confidence</label>
                  <span style={{ color: 'var(--ai)' }}>{s.aiAnalysis.confidence}%</span>
                </div>
                <div className="ai-metric">
                  <label>Recommendation</label>
                  <span style={{ color: 'var(--text)', fontSize: '0.72rem', fontWeight: 500 }}>{s.aiAnalysis.recommendation}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3><ShieldAlert size={16} /> Hazard Detection</h3>
              {s.hazards.length > 0 && <span className="badge badge-critical">{s.hazards.filter(h => h.status === 'Active').length} ACTIVE</span>}
            </div>
            <div className="card-body">
              {s.hazards.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', textAlign: 'center', padding: '20px 0' }}>
                  ✓ No hazards detected
                </div>
              ) : (
                <div className="hazard-list">
                  {s.hazards.slice(0, 5).map(h => (
                    <div key={h.id} className="hazard-item">
                      <div className={`hazard-icon ${h.severity}`}><span>{h.icon || '⚠'}</span></div>
                      <div className="hazard-info">
                        <div className="hazard-name">{h.type}</div>
                        <div className="hazard-location">{h.location}</div>
                      </div>
                      <div className="hazard-meta">
                        <span className={`badge badge-${h.severity === 'high' ? 'warning' : h.severity}`}>{h.severity.toUpperCase()}</span>
                        <div className="hazard-time">{h.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', textAlign: 'center', padding: '20px 0' }}>
                ✓ System nominal — no active alerts
              </div>
            ) : (
              s.alerts.slice(0, 6).map(alert => (
                <div key={alert.id} className="alert-item">
                  <span className={`alert-dot ${alert.severity}`} />
                  <div className="alert-content">
                    <div className={`alert-severity ${alert.severity}`}>{alert.severity.toUpperCase()}</div>
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-meta">
                      <span>{alert.location}</span>
                      <span>{alert.time}</span>
                    </div>
                    <div className="alert-actions">
                      <button className="btn btn-sm btn-outline">View Location</button>
                      <button className="btn btn-sm btn-ghost">Acknowledge</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Trend Charts ── */}
        <div className="card mb-20">
          <div className="card-header">
            <h3>📈 Real-Time Sensor Trends</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Live data</span>
          </div>
          <div className="card-body">
            <div className="grid-2 gap-20">
              <TrendChart data={chartData} dataKey="methane" label="Methane CH₄ (%)" color="#DC2626" />
              <TrendChart data={chartData} dataKey="temperature" label="Temperature (°C)" color="#F59E0B" />
              <TrendChart data={chartData} dataKey="humidity" label="Humidity (%)" color="#06B6D4" />
              <TrendChart data={chartData} dataKey="oxygen" label="Oxygen O₂ (%)" color="#16A34A" />
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────

function StatusPill({ label, value, active, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span style={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: color || (active ? 'var(--safe)' : 'var(--text)') }}>{value}</span>
    </div>
  );
}

function SummaryCard({ label, value, sub, subClass, icon, color }) {
  return (
    <div className="summary-card">
      <div className="sc-top">
        <span className="sc-label">{label}</span>
        <span className={`sc-icon ${color}`}>{icon}</span>
      </div>
      <div className="sc-value">{value}</div>
      {sub && <div className={`sc-sub ${subClass || ''}`}>{sub}</div>}
    </div>
  );
}

function TelRow({ icon, label, value, valueClass = '' }) {
  return (
    <div className="telemetry-row">
      <span className="telemetry-label">{icon} {label}</span>
      <span className={`telemetry-value ${valueClass}`} style={{ transition: 'color 0.5s' }}>{value}</span>
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
      <div className={`gas-value`} style={{ color: gas.status === 'critical' ? 'var(--critical)' : gas.status === 'warning' ? 'var(--warning)' : 'var(--safe)', transition: 'color 0.5s' }}>
        {gas.value} {gas.unit}
      </div>
      <div className="progress-bar">
        <div className={`progress-fill ${gas.status}`} style={{ width: `${Math.min(100, pct)}%`, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

function EnvItem({ name, value, status, trend }) {
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  const trendLabel = trend === 'up' ? 'Increasing' : trend === 'down' ? 'Decreasing' : 'Stable';
  return (
    <div className="env-item">
      <div className="env-item-header">
        <span className="env-name">{name}</span>
        <span className={`env-trend ${trend}`} title={trendLabel}>{trendIcon} {trendLabel}</span>
      </div>
      <div className="env-value" style={{ color: status === 'critical' ? 'var(--critical)' : status === 'warning' ? 'var(--warning)' : 'var(--text)', transition: 'color 0.5s' }}>
        {value}
      </div>
      {status !== 'safe' && (
        <span className={`badge badge-${status}`} style={{ marginTop: 6 }}>{status.toUpperCase()}</span>
      )}
    </div>
  );
}

function TrendChart({ data, dataKey, label, color }) {
  return (
    <div>
      <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>{label}</div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="time" tick={{ fontSize: 9 }} stroke="#94A3B8" interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 9 }} stroke="#94A3B8" width={38} />
            <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 8, fontSize: '0.72rem' }} />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
