import { useState } from 'react';
import { useMine, useSensorCompat } from '../store/MineContext';
import PageHeader from '../components/PageHeader';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  FileText, Download, Printer, MapPin, Clock, Bot,
  AlertTriangle, Users, Thermometer, Wind, Droplets,
  Brain, CheckCircle, Shield, Eye,
} from 'lucide-react';

export default function SurveyReport() {
  const { state } = useMine();
  const { gases, environment } = useSensorCompat(state);
  const [downloaded, setDownloaded] = useState(false);

  const s = state;
  const isRunning = s.simulation.isRunning;

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  // Build per-tunnel environmental data from tunnel profiles for charts
  const exploredTunnels = s.tunnels.filter(t => t.status === 'explored');

  const tunnelChartData = exploredTunnels.map(t => {
    const cond = t.condition || 'safe';
    return {
      name: t.name.replace('Tunnel ', 'T-').replace('Main Shaft', 'MS'),
      temp: +(27 + Math.random() * 12).toFixed(1),
      methane: +(0.5 + Math.random() * 6).toFixed(1),
      oxygen: +(18.5 + Math.random() * 2.5).toFixed(1),
      humidity: +(52 + Math.random() * 25).toFixed(0),
      condition: cond,
    };
  });

  // Env summary uses live sensor readings
  const envSummary = [
    { label: 'Temperature', value: `${environment.temperature.value}°C`, color: '#F59E0B' },
    { label: 'Methane (CH₄)', value: `${gases.methane.value}%`, color: gases.methane.status === 'critical' ? '#DC2626' : gases.methane.status === 'warning' ? '#F59E0B' : '#16A34A' },
    { label: 'Oxygen (O₂)', value: `${gases.oxygen.value}%`, color: gases.oxygen.status === 'critical' ? '#DC2626' : '#16A34A' },
    { label: 'Humidity', value: `${environment.humidity.value}%`, color: '#06B6D4' },
    { label: 'CO', value: `${gases.co.value} ppm`, color: gases.co.status === 'critical' ? '#DC2626' : '#64748B' },
  ];

  // Chart history from simulation
  const historyData = s.sensorHistory.slice(-30);

  const safeZones = s.tunnels.filter(t => t.condition === 'safe' && t.status === 'explored').length;

  return (
    <>
      <PageHeader
        title="Mine Survey Report"
        subtitle="Automated reconnaissance report — generated from live simulation data"
      />

      <div className="page-content">

        {/* Notification */}
        {downloaded && (
          <div style={{
            padding: '12px 20px', background: 'var(--safe-bg)', border: '1px solid var(--safe-border)',
            borderRadius: 'var(--radius)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
            fontSize: '0.82rem', fontWeight: 500, color: 'var(--safe)',
          }}>
            <CheckCircle size={16} /> Demo report generated successfully.
          </div>
        )}

        {/* Live data badge */}
        {isRunning && (
          <div style={{
            padding: '8px 16px', borderRadius: 'var(--radius)', marginBottom: 16,
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
            fontSize: '0.78rem', color: 'var(--safe)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            Survey data is synced to live simulation — values update automatically as the mission progresses
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 20 }}>
          <button className="btn btn-primary" onClick={handleDownload}>
            <Download size={14} /> Download Report
          </button>
          <button className="btn btn-outline" onClick={handleDownload}>
            <Printer size={14} /> Print Report
          </button>
        </div>

        {/* ── Mission Summary ── */}
        <div className="card mb-20">
          <div className="card-header">
            <h3><FileText size={16} /> Mission Summary</h3>
            <span className={`badge ${isRunning ? 'badge-safe' : 'badge-info'}`}>{isRunning ? 'ACTIVE' : s.missionProgress === 100 ? 'COMPLETED' : 'STANDBY'}</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              <ReportField label="Mission ID" value={s.mission.id} />
              <ReportField label="Mine" value={s.mission.area} />
              <ReportField label="Survey Date" value={new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} />
              <ReportField label="Elapsed Time" value={(() => { const sec = Math.floor(s.simulation.simTime); const m = Math.floor(sec/60); const sc = sec%60; return `${m}m ${sc}s`; })()} />
              <ReportField label="Rover" value={s.rover.id} />
              <ReportField label="Area Surveyed" value={`${s.mineCoverage}%`} />
              <ReportField label="Distance Travelled" value={`${s.rover.distance} km`} />
              <ReportField label="Status" value={isRunning ? 'Running' : s.missionProgress === 100 ? 'Complete' : 'Standby'} valueColor={isRunning ? 'var(--safe)' : s.missionProgress === 100 ? 'var(--safe)' : 'var(--text-secondary)'} />
            </div>
          </div>
        </div>

        {/* ── Survey Overview ── */}
        <div className="card mb-20">
          <div className="card-header">
            <h3><MapPin size={16} /> Survey Overview</h3>
          </div>
          <div className="card-body">
            <div className="summary-cards" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
              <OverviewStat label="Area Surveyed" value={`${s.mineCoverage}%`} icon={<MapPin size={14} />} color="blue" />
              <OverviewStat label="Tunnels Explored" value={`${exploredTunnels.length} / ${s.tunnels.length}`} icon={<Eye size={14} />} color="cyan" />
              <OverviewStat label="Workers Located" value={s.workersDetected} icon={<Users size={14} />} color="orange" />
              <OverviewStat label="Hazards Detected" value={s.hazardsDetected} icon={<AlertTriangle size={14} />} color="red" />
              <OverviewStat label="Critical Hazards" value={s.criticalHazards} icon={<Shield size={14} />} color="red" />
              <OverviewStat label="Safe Zones" value={safeZones} icon={<CheckCircle size={14} />} color="green" />
            </div>
          </div>
        </div>

        {/* ── Tunnel Status Table ── */}
        <div className="card mb-20">
          <div className="card-header">
            <h3><Eye size={16} /> Tunnel Status Report</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Tunnel</th>
                  <th>Status</th>
                  <th>Condition</th>
                  <th>Hazard</th>
                </tr>
              </thead>
              <tbody>
                {s.tunnels.map(t => {
                  const hz = s.hazards.find(h => h.tunnelId === t.id && h.status === 'Active');
                  return (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>{t.name}</td>
                      <td>
                        <span style={{
                          color: t.status === 'explored' ? 'var(--safe)' : t.status === 'blocked' ? 'var(--critical)' : 'var(--text-secondary)',
                          fontWeight: 600, fontSize: '0.78rem',
                        }}>
                          {t.status === 'explored' ? '✓ Explored' : t.status === 'blocked' ? '✗ Blocked' : '○ Unexplored'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${t.condition === 'critical' ? 'critical' : t.condition === 'warning' ? 'warning' : 'safe'}`} style={{ fontSize: '0.62rem' }}>
                          {(t.condition || 'SAFE').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem' }}>
                        {hz ? <span style={{ color: hz.severity === 'critical' ? 'var(--critical)' : 'var(--warning)' }}>{hz.icon} {hz.type}</span> : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Hazard Report ── */}
        <div className="card mb-20">
          <div className="card-header">
            <h3><AlertTriangle size={16} /> Hazard Report</h3>
            {s.hazards.length > 0 && <span className="badge badge-critical">{s.hazards.length} DETECTED</span>}
          </div>
          <div className="card-body" style={{ padding: s.hazards.length > 0 ? 0 : '20px' }}>
            {s.hazards.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', textAlign: 'center' }}>
                ✓ No hazards detected during mission
              </div>
            ) : (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Hazard</th>
                    <th>Location</th>
                    <th>Severity</th>
                    <th>Detected At</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {s.hazards.map(h => (
                    <tr key={h.id}>
                      <td style={{ fontWeight: 600 }}>{h.icon || '⚠'} {h.type}</td>
                      <td>{h.location}</td>
                      <td><span className={`badge badge-${h.severity === 'high' ? 'warning' : h.severity}`}>{h.severity.toUpperCase()}</span></td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{h.detected || h.time}</td>
                      <td>
                        <span style={{ color: h.status === 'Active' ? 'var(--critical)' : h.status === 'Resolved' ? 'var(--safe)' : 'var(--warning)', fontWeight: 600, fontSize: '0.78rem' }}>
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Worker Detection Report ── */}
        <div className="card mb-20">
          <div className="card-header">
            <h3><Users size={16} /> Worker Detection Report</h3>
            {s.workers.length > 0 && <span className="badge badge-warning">{s.workers.length} LOCATED</span>}
          </div>
          <div className="card-body">
            {s.workers.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', textAlign: 'center', padding: '20px 0' }}>
                No workers detected yet
              </div>
            ) : (
              <div className="grid-2" style={{ gap: 16 }}>
                {s.workers.map(w => (
                  <div key={w.id} className="worker-card">
                    <div className="worker-header">
                      <div className="worker-avatar">#{w.id.slice(-2)}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{w.id}</div>
                        <span className="badge badge-warning">{w.status}</span>
                      </div>
                    </div>
                    <div className="worker-details">
                      <div className="worker-detail"><label>Location</label><span>{w.location}</span></div>
                      <div className="worker-detail">
                        <label>AI Confidence</label>
                        <span style={{ color: w.confidence > 90 ? 'var(--safe)' : 'var(--warning)' }}>{w.confidence}%</span>
                      </div>
                      <div className="worker-detail"><label>Status</label><span>{w.status}</span></div>
                      <div className="worker-detail">
                        <label>Thermal Detection</label>
                        <span style={{ color: w.thermal ? 'var(--safe)' : 'var(--text-secondary)' }}>{w.thermal ? '✓ Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Environmental Summary ── */}
        <div className="card mb-20">
          <div className="card-header">
            <h3><Thermometer size={16} /> Environmental Summary</h3>
            {isRunning && <span style={{ fontSize: '0.6rem', color: '#22c55e', fontWeight: 700 }}>● LIVE</span>}
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
              {envSummary.map(item => (
                <div key={item.label} style={{
                  textAlign: 'center', padding: 16, border: '1px solid var(--card-border)',
                  borderRadius: 'var(--radius)', background: 'var(--bg)',
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: item.color, transition: 'color 0.5s' }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid-2" style={{ gap: 20 }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: 8 }}>Methane Trend</div>
                <div style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="time" tick={{ fontSize: 9 }} stroke="#94A3B8" interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 9 }} stroke="#94A3B8" width={35} />
                      <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 8, fontSize: '0.72rem' }} />
                      <Line type="monotone" dataKey="methane" stroke="#DC2626" strokeWidth={2} dot={false} isAnimationActive={false} name="CH₄ %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: 8 }}>Temperature & Oxygen Trend</div>
                <div style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="time" tick={{ fontSize: 9 }} stroke="#94A3B8" interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 9 }} stroke="#94A3B8" width={35} />
                      <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 8, fontSize: '0.72rem' }} />
                      <Line type="monotone" dataKey="temperature" stroke="#F59E0B" strokeWidth={2} dot={false} isAnimationActive={false} name="Temp °C" />
                      <Line type="monotone" dataKey="oxygen" stroke="#16A34A" strokeWidth={2} dot={false} isAnimationActive={false} name="O₂ %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── AI Survey Summary ── */}
        <div className="card ai-card mb-20">
          <div className="card-header">
            <h3><Brain size={16} /> AI Survey Summary</h3>
            <span className="badge badge-ai">AUTO-GENERATED</span>
          </div>
          <div className="card-body">
            <div className="ai-analysis-text" style={{ fontSize: '0.85rem', lineHeight: 1.8 }}>
              "{s.aiAnalysis.text}
              {s.workersDetected > 0 && ` ${s.workersDetected} possible survivor${s.workersDetected > 1 ? 's have' : ' has'} been located via thermal imaging.`}
              {s.hazardsDetected > 0 && ` ${s.hazardsDetected} active hazard${s.hazardsDetected > 1 ? 's' : ''} detected. ${s.criticalHazards > 0 ? s.criticalHazards + ' critical.' : ''}`}
              {s.mineCoverage > 0 && ` Mine coverage: ${s.mineCoverage}% of network surveyed.`}"
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 16 }}>
              <div className="ai-metric">
                <label>Overall Risk</label>
                <span style={{ color: s.aiAnalysis.riskLevel === 'CRITICAL' ? 'var(--critical)' : s.aiAnalysis.riskLevel === 'HIGH' || s.aiAnalysis.riskLevel === 'MEDIUM' ? 'var(--warning)' : 'var(--safe)' }}>
                  {s.aiAnalysis.riskLevel}
                </span>
              </div>
              <div className="ai-metric">
                <label>AI Confidence</label>
                <span style={{ color: 'var(--ai)' }}>{s.aiAnalysis.confidence}%</span>
              </div>
              <div className="ai-metric">
                <label>Coverage</label>
                <span style={{ color: s.mineCoverage > 70 ? 'var(--safe)' : 'var(--warning)' }}>{s.mineCoverage}%</span>
              </div>
              <div className="ai-metric">
                <label>Report Status</label>
                <span style={{ color: isRunning ? 'var(--safe)' : 'var(--primary)' }}>{isRunning ? 'LIVE' : 'COMPLETE'}</span>
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" onClick={handleDownload}><Download size={14} /> Download Report</button>
              <button className="btn btn-outline" onClick={handleDownload}><Printer size={14} /> Print Report</button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

function ReportField({ label, value, valueColor }) {
  return (
    <div>
      <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: valueColor || 'var(--text)', transition: 'color 0.5s' }}>{value}</div>
    </div>
  );
}

function OverviewStat({ label, value, icon, color }) {
  return (
    <div className="summary-card" style={{ marginBottom: 0 }}>
      <div className="sc-top">
        <span className="sc-label">{label}</span>
        <span className={`sc-icon ${color}`}>{icon}</span>
      </div>
      <div className="sc-value">{value}</div>
    </div>
  );
}
