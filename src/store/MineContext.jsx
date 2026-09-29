import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';

// =============================================
// Mine Network: Junctions
// =============================================
export const junctions = [
  { id: 'J-0', name: 'Surface', x: 400, y: 40, depth: 0 },
  { id: 'J-1', name: 'Junction 1', x: 400, y: 150, depth: -180 },
  { id: 'J-2', name: 'Junction 2', x: 200, y: 150, depth: -180 },
  { id: 'J-3', name: 'Junction 3', x: 400, y: 320, depth: -320 },
  { id: 'J-4', name: 'Junction 4', x: 600, y: 150, depth: -180 },
  { id: 'J-5', name: 'Junction 5', x: 100, y: 320, depth: -320 },
  { id: 'J-6', name: 'Junction 6', x: 400, y: 460, depth: -400 },
  { id: 'J-7', name: 'Junction 7', x: 100, y: 460, depth: -400 },
  { id: 'J-8', name: 'Junction 8', x: 400, y: 560, depth: -480 },
  { id: 'J-9', name: 'Junction 9', x: 600, y: 460, depth: -400 },
  { id: 'J-10', name: 'Junction 10', x: 250, y: 560, depth: -480 },
];

// =============================================
// Mine Network: Tunnels
// =============================================
export const tunnelNetwork = [
  { id: 'T-MS', name: 'Main Shaft', from: 'J-0', to: 'J-1' },
  { id: 'T-A', name: 'Tunnel A', from: 'J-1', to: 'J-2' },
  { id: 'T-B', name: 'Tunnel B', from: 'J-1', to: 'J-3' },
  { id: 'T-C', name: 'Tunnel C', from: 'J-1', to: 'J-4' },
  { id: 'T-D', name: 'Tunnel D', from: 'J-2', to: 'J-5' },
  { id: 'T-E', name: 'Tunnel E', from: 'J-2', to: 'J-3' },
  { id: 'T-F', name: 'Tunnel F', from: 'J-3', to: 'J-6' },
  { id: 'T-G', name: 'Tunnel G', from: 'J-6', to: 'J-9' },
  { id: 'T-H', name: 'Tunnel H', from: 'J-5', to: 'J-7' },
  { id: 'T-I', name: 'Tunnel I', from: 'J-6', to: 'J-8' },
  { id: 'T-J', name: 'Tunnel J', from: 'J-8', to: 'J-10' },
];

// =============================================
// Tunnel Environmental Profiles
// Each tunnel has distinct sensor baselines
// =============================================
export const TUNNEL_PROFILES = {
  'T-MS': { methane: 0.5, co: 5, co2: 420, oxygen: 20.8, temperature: 27, humidity: 52, smoke: 1, pressure: 1013, structural: 98 },
  'T-A': { methane: 1.5, co: 12, co2: 680, oxygen: 20.4, temperature: 30, humidity: 60, smoke: 3, pressure: 1010, structural: 92 },
  'T-B': { methane: 6.8, co: 52, co2: 1600, oxygen: 18.6, temperature: 38, humidity: 74, smoke: 22, pressure: 1006, structural: 64 },
  'T-C': { methane: 1.1, co: 9, co2: 560, oxygen: 20.6, temperature: 29, humidity: 57, smoke: 2, pressure: 1011, structural: 95 },
  'T-D': { methane: 4.2, co: 35, co2: 1200, oxygen: 19.2, temperature: 36, humidity: 71, smoke: 14, pressure: 1007, structural: 44 },
  'T-E': { methane: 2.8, co: 22, co2: 940, oxygen: 19.8, temperature: 33, humidity: 66, smoke: 8, pressure: 1008, structural: 80 },
  'T-F': { methane: 2.2, co: 16, co2: 780, oxygen: 20.1, temperature: 32, humidity: 64, smoke: 5, pressure: 1009, structural: 86 },
  'T-G': { methane: 1.7, co: 13, co2: 700, oxygen: 20.3, temperature: 31, humidity: 62, smoke: 4, pressure: 1010, structural: 89 },
  'T-H': { methane: 4.5, co: 38, co2: 1280, oxygen: 19.1, temperature: 37, humidity: 74, smoke: 17, pressure: 1006, structural: 52 },
  'T-I': { methane: 1.6, co: 11, co2: 640, oxygen: 20.5, temperature: 30, humidity: 61, smoke: 3, pressure: 1010, structural: 91 },
  'T-J': { methane: 3.8, co: 31, co2: 1080, oxygen: 19.5, temperature: 35, humidity: 70, smoke: 13, pressure: 1007, structural: 63 },
};

// =============================================
// Mission Route Waypoints (pixel coords in 800x600 SVG space)
// =============================================
export const MISSION_WAYPOINTS = [
  { step: 0,  x: 400, y: 40,  tunnelId: 'T-MS', depth: 0,    progress: 0,   label: 'Mission Start — Surface' },
  { step: 1,  x: 400, y: 95,  tunnelId: 'T-MS', depth: -90,  progress: 8,   label: 'Descending Main Shaft' },
  { step: 2,  x: 400, y: 150, tunnelId: 'T-A',  depth: -180, progress: 16,  label: 'Junction 1 — Entering Tunnel A' },
  { step: 3,  x: 300, y: 150, tunnelId: 'T-A',  depth: -180, progress: 28,  label: 'Tunnel A — Midpoint' },
  { step: 4,  x: 200, y: 150, tunnelId: 'T-A',  depth: -180, progress: 35,  label: 'Junction 2 — Tunnel A Complete' },
  // Gas leak fires at step 4
  { step: 5,  x: 300, y: 235, tunnelId: 'T-E',  depth: -250, progress: 48,  label: 'Reroute via Tunnel E' },
  { step: 6,  x: 400, y: 320, tunnelId: 'T-F',  depth: -320, progress: 60,  label: 'Junction 3 — Heading to Tunnel F' },
  { step: 7,  x: 400, y: 390, tunnelId: 'T-F',  depth: -370, progress: 72,  label: 'Tunnel F Entry' },
  // Worker 1 fires at step 7
  { step: 8,  x: 400, y: 430, tunnelId: 'T-F',  depth: -400, progress: 85,  label: 'Worker #1 Located' },
  // Worker 2 fires at step 8
  { step: 9,  x: 400, y: 460, tunnelId: 'T-F',  depth: -420, progress: 95,  label: 'Worker #2 Located — Rescue Initiated' },
  { step: 10, x: 400, y: 460, tunnelId: 'T-F',  depth: -430, progress: 100, label: 'Mission Complete — Rescue Route Secured' },
];

// =============================================
// Initial Tunnel States
// =============================================
function buildInitialTunnels() {
  return tunnelNetwork.map(t => ({
    ...t,
    status: 'unexplored',
    condition: 'safe',
  }));
}

// =============================================
// Helper: smooth interpolation
// =============================================
function lerp(current, target, alpha = 0.12) {
  return +(current + (target - current) * alpha).toFixed(2);
}

function addNoise(value, amount = 0.05) {
  return +(value + (Math.random() - 0.5) * 2 * amount).toFixed(2);
}

// =============================================
// Dynamic AI Risk Calculation
// =============================================
function calculateRisk(env, structural) {
  let score = 0;
  if (env.methane > 5.5) score += 40;
  else if (env.methane > 4.0) score += 25;
  else if (env.methane > 2.5) score += 10;

  if (env.oxygen < 18.0) score += 35;
  else if (env.oxygen < 19.5) score += 20;

  if (env.co > 50) score += 20;
  else if (env.co > 25) score += 10;

  if (env.temperature > 40) score += 15;
  else if (env.temperature > 35) score += 8;

  if (structural < 50) score += 20;
  else if (structural < 70) score += 10;

  if (score >= 60) return 'CRITICAL';
  if (score >= 35) return 'HIGH';
  if (score >= 15) return 'MEDIUM';
  return 'LOW';
}

function calculateConfidence(risk) {
  const base = { LOW: 98, MEDIUM: 94, HIGH: 91, CRITICAL: 96 };
  return base[risk] || 95;
}

function buildAIText(risk, workers, methane, oxygen, structural, currentTunnel, networkLost, gasLeakTunnel, altRoute) {
  if (networkLost) return 'Communication link lost. Rover telemetry unavailable. Last known position recorded. Awaiting signal recovery.';
  if (risk === 'CRITICAL')
    return `CRITICAL: ${methane.toFixed(1)}% methane concentration detected in ${gasLeakTunnel || currentTunnel}. Human entry is strictly prohibited. Rover maintaining reconnaissance from safe distance. ${altRoute ? 'Alternative route calculated via ' + altRoute + '.' : ''}`;
  if (risk === 'HIGH' && workers > 0)
    return `${workers} possible survivor${workers > 1 ? 's' : ''} detected via thermal imaging. Elevated sensor readings in current sector. Rescue approach route generated. Rescue team on standby.`;
  if (risk === 'HIGH')
    return `Elevated environmental readings detected. Methane at ${methane.toFixed(1)}%, Oxygen at ${oxygen.toFixed(1)}%. Proceeding with caution. Continuous AI monitoring active.`;
  if (workers > 0)
    return `${workers} possible survivor${workers > 1 ? 's' : ''} located via thermal imaging. Conditions acceptable for cautious approach. AI-guided rescue route is active.`;
  if (structural < 70)
    return `Structural integrity concern detected in current sector (${structural.toFixed(0)}%). Recommend avoiding unstable zones. Route adjusted.`;
  return 'Environmental conditions within acceptable limits. Rover-01 conducting autonomous reconnaissance. All sensor readings nominal.';
}

// =============================================
// Initial State
// =============================================
function createInitialState() {
  return {
    mission: {
      id: 'MR-2026-041',
      area: 'Jharkhand Underground Mine',
      systemStatus: 'STANDBY',
      startTime: null,
    },

    rover: {
      id: 'RV-01',
      status: 'Standby',
      battery: 82,
      connection: 'Connected',
      signal: 96,
      speed: 0,
      distance: 0,
      currentTunnelId: 'T-MS',
      currentTunnel: 'Main Shaft',
      currentDepth: 0,
      navigation: 'Autonomous',
    },

    // Live sensor readings (smoothly interpolated)
    sensors: {
      methane: 0.5,
      co: 5,
      co2: 420,
      oxygen: 20.8,
      h2s: 0,
      temperature: 27,
      humidity: 52,
      smoke: 1,
      pressure: 1013,
      structural: 98,
      airQuality: 'GOOD',
    },

    tunnels: buildInitialTunnels(),
    hazards: [],
    workers: [],
    alerts: [],

    aiAnalysis: {
      text: 'System online. Rover-01 ready for autonomous deployment. All environmental sensors nominal.',
      riskLevel: 'LOW',
      confidence: 98,
      recommendation: 'Ready to start mission.',
    },
    aiRoute: ['T-MS', 'T-A', 'T-E', 'T-F'],
    gasLeakTunnel: null,
    altRouteLabel: null,
    networkLost: false,

    missionProgress: 0,
    mineCoverage: 0,
    workersDetected: 0,
    hazardsDetected: 0,
    criticalHazards: 0,
    distanceTravelled: 0,

    // Simulation control
    simulation: {
      isRunning: false,
      isPaused: false,
      currentStep: 0,
      simTime: 0, // seconds elapsed
    },

    roverPosition: { x: 400, y: 40 },

    // Real-time chart history (rolling 60 points)
    sensorHistory: [],

    // Mission events for timeline
    missionEvents: [],

    toasts: [],
  };
}

// =============================================
// Reducer
// =============================================
function mineReducer(state, action) {
  switch (action.type) {

    // ──────────────────────────────────────────
    // SIMULATION_TICK  — called every 500ms
    // ──────────────────────────────────────────
    case 'SIMULATION_TICK': {
      if (!state.simulation.isRunning || state.simulation.isPaused) return state;

      const newSimTime = state.simulation.simTime + 0.5; // 500ms ticks

      // Determine target profile from current tunnel
      const profile = TUNNEL_PROFILES[state.rover.currentTunnelId] || TUNNEL_PROFILES['T-MS'];

      // Smoothly lerp sensor values toward tunnel profile with small noise
      const sensors = {
        methane: addNoise(lerp(state.sensors.methane, profile.methane, 0.08), 0.08),
        co: addNoise(lerp(state.sensors.co, profile.co, 0.08), 0.5),
        co2: addNoise(lerp(state.sensors.co2, profile.co2, 0.06), 5),
        oxygen: addNoise(lerp(state.sensors.oxygen, profile.oxygen, 0.06), 0.06),
        h2s: addNoise(lerp(state.sensors.h2s, state.sensors.h2s, 0.05), 0.02),
        temperature: addNoise(lerp(state.sensors.temperature, profile.temperature, 0.05), 0.1),
        humidity: addNoise(lerp(state.sensors.humidity, profile.humidity, 0.05), 0.3),
        smoke: addNoise(lerp(state.sensors.smoke, profile.smoke, 0.07), 0.1),
        pressure: addNoise(lerp(state.sensors.pressure, profile.pressure, 0.04), 0.5),
        structural: addNoise(lerp(state.sensors.structural, profile.structural, 0.04), 0.2),
        airQuality:
          sensors.methane > 5.5 || sensors.oxygen < 18.5
            ? 'CRITICAL'
            : sensors.methane > 4.0 || sensors.oxygen < 19.5
            ? 'WARNING'
            : 'GOOD',
      };

      // Fix forward reference — calculate airQuality from new values
      sensors.airQuality =
        sensors.methane > 5.5 || sensors.oxygen < 18.5
          ? 'CRITICAL'
          : sensors.methane > 4.0 || sensors.oxygen < 19.5
          ? 'WARNING'
          : 'GOOD';

      // Battery drain while moving
      const batteryDelta = state.rover.speed > 0 ? (Math.random() < 0.15 ? -0.1 : 0) : 0;
      const battery = Math.max(0, +(state.rover.battery + batteryDelta).toFixed(1));

      // Signal based on depth + noise
      const signalBase = Math.max(10, 98 + state.rover.currentDepth * 0.08);
      const signal = Math.max(0, Math.min(100, Math.round(signalBase + (Math.random() - 0.5) * 4)));

      // Distance increases if moving
      const distanceDelta = state.rover.speed > 0 ? state.rover.speed * 0.5 / 1000 : 0;

      // Risk
      const riskLevel = calculateRisk(sensors, sensors.structural);
      const confidence = calculateConfidence(riskLevel);
      const aiText = buildAIText(
        riskLevel,
        state.workersDetected,
        sensors.methane,
        sensors.oxygen,
        sensors.structural,
        state.rover.currentTunnel,
        state.networkLost,
        state.gasLeakTunnel,
        state.altRouteLabel,
      );

      // Update history (keep last 60 points)
      const now = new Date();
      const timeLabel = `${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
      const newHistory = [
        ...state.sensorHistory.slice(-59),
        {
          time: timeLabel,
          methane: +sensors.methane.toFixed(1),
          temperature: +sensors.temperature.toFixed(1),
          oxygen: +sensors.oxygen.toFixed(1),
          humidity: +sensors.humidity.toFixed(0),
          co: +sensors.co.toFixed(0),
        },
      ];

      // Battery warning alert
      let extraAlerts = [];
      if (battery < 20 && battery > 19.5 && !state.alerts.find(a => a.type === 'LOW_BATTERY')) {
        extraAlerts.push({
          id: Date.now(),
          severity: 'warning',
          type: 'LOW_BATTERY',
          message: '⚠ Low battery — Rover-01 at 20%. Return to charging station recommended.',
          location: state.rover.currentTunnel,
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        });
      }

      return {
        ...state,
        simulation: { ...state.simulation, simTime: newSimTime },
        sensors,
        sensorHistory: newHistory,
        rover: {
          ...state.rover,
          battery,
          signal,
          distance: +(state.rover.distance + distanceDelta).toFixed(2),
        },
        aiAnalysis: {
          ...state.aiAnalysis,
          text: aiText,
          riskLevel,
          confidence,
        },
        hazardsDetected: state.hazards.filter(h => h.status === 'Active').length,
        criticalHazards: state.hazards.filter(h => h.severity === 'critical' && h.status === 'Active').length,
        alerts: extraAlerts.length > 0 ? [...extraAlerts, ...state.alerts] : state.alerts,
        toasts: extraAlerts.length > 0 ? [...state.toasts, { id: Date.now(), type: 'warning', message: '🔋 Battery low — 20%' }] : state.toasts,
      };
    }

    // ──────────────────────────────────────────
    // ADVANCE_STEP — move rover to next waypoint
    // ──────────────────────────────────────────
    case 'ADVANCE_STEP': {
      const step = action.step;
      if (step >= MISSION_WAYPOINTS.length) return state;
      const wp = MISSION_WAYPOINTS[step];
      const tunnelInfo = tunnelNetwork.find(t => t.id === wp.tunnelId);

      // Mark tunnel as explored
      const updatedTunnels = state.tunnels.map(t =>
        t.id === wp.tunnelId && t.status === 'unexplored'
          ? { ...t, status: 'explored' }
          : t
      );

      // Apply hazard conditions to tunnels
      const tunnelsWithConditions = updatedTunnels.map(t => {
        const hz = state.hazards.find(h => h.tunnelId === t.id && h.status === 'Active');
        if (hz) return { ...t, condition: hz.severity };
        return t;
      });

      const exploredCount = tunnelsWithConditions.filter(t => t.status === 'explored').length;
      const coverage = Math.round((exploredCount / tunnelsWithConditions.length) * 100);

      // Mission event
      const newEvent = {
        id: Date.now() + step,
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        text: wp.label,
        type: wp.progress === 100 ? 'active' : wp.tunnelId === 'T-B' ? 'critical' : 'safe',
      };

      return {
        ...state,
        roverPosition: { x: wp.x, y: wp.y },
        missionProgress: wp.progress,
        mineCoverage: coverage,
        tunnels: tunnelsWithConditions,
        rover: {
          ...state.rover,
          currentTunnelId: wp.tunnelId,
          currentTunnel: tunnelInfo ? tunnelInfo.name : state.rover.currentTunnel,
          currentDepth: wp.depth,
          speed: step === MISSION_WAYPOINTS.length - 1 ? 0 : 1.8,
          status: step === MISSION_WAYPOINTS.length - 1 ? 'Mission Complete' : 'Moving',
        },
        simulation: { ...state.simulation, currentStep: step },
        missionEvents: [newEvent, ...state.missionEvents].slice(0, 30),
      };
    }

    // ──────────────────────────────────────────
    // SIMULATE_GAS_LEAK
    // ──────────────────────────────────────────
    case 'SIMULATE_GAS_LEAK': {
      const tunnelId = action.tunnelId || 'T-B';
      const tunnelInfo = tunnelNetwork.find(t => t.id === tunnelId);
      const tunnelName = tunnelInfo ? tunnelInfo.name : tunnelId;
      const now = new Date().toLocaleTimeString('en-US', { hour12: false });

      const newHazard = {
        id: `HZ-GAS-${Date.now()}`,
        type: 'Methane Leak',
        icon: '☣',
        tunnelId,
        location: tunnelName,
        severity: 'critical',
        status: 'Active',
        time: 'Just now',
        detected: now,
      };

      const newAlert = {
        id: Date.now(),
        severity: 'critical',
        type: 'GAS_LEAK',
        message: `☣ Critical methane concentration detected — ${tunnelName} is unsafe`,
        location: tunnelName,
        time: now,
      };

      const newEvent = {
        id: Date.now(),
        time: now,
        text: `⚠ Methane spike detected in ${tunnelName} — Route recalculated`,
        type: 'critical',
      };

      const updatedTunnels = state.tunnels.map(t =>
        t.id === tunnelId ? { ...t, condition: 'critical' } : t
      );

      return {
        ...state,
        sensors: { ...state.sensors, methane: 6.8, co: 52, oxygen: 18.6 },
        hazards: [newHazard, ...state.hazards],
        alerts: [newAlert, ...state.alerts],
        missionEvents: [newEvent, ...state.missionEvents],
        tunnels: updatedTunnels,
        gasLeakTunnel: tunnelName,
        altRouteLabel: 'Tunnel A → Tunnel E → Tunnel F',
        aiRoute: ['T-A', 'T-E', 'T-F'],
        aiAnalysis: {
          text: `CRITICAL: Methane at 6.8% in ${tunnelName}. Human entry prohibited. AI rerouting Rover-01 via Tunnel E to avoid contaminated zone.`,
          riskLevel: 'CRITICAL',
          confidence: 96,
          recommendation: `Avoid ${tunnelName}. Rerouting via Tunnel E.`,
        },
        toasts: [...state.toasts, { id: Date.now(), type: 'critical', message: `☣ Gas Leak in ${tunnelName} — Methane 6.8%` }],
      };
    }

    // ──────────────────────────────────────────
    // SIMULATE_WORKER_DETECTION
    // ──────────────────────────────────────────
    case 'SIMULATE_WORKER_DETECTION': {
      const workerNum = state.workersDetected + 1;
      const confidence = workerNum === 1 ? 94 : 89;
      const tunnelId = action.tunnelId || 'T-F';
      const tunnelInfo = tunnelNetwork.find(t => t.id === tunnelId);
      const tunnelName = tunnelInfo ? tunnelInfo.name : 'Tunnel F';
      const now = new Date().toLocaleTimeString('en-US', { hour12: false });

      const newWorker = {
        id: `W-0${workerNum}`,
        tunnelId,
        location: tunnelName,
        status: 'Possible Survivor',
        confidence,
        thermal: true,
      };

      const newAlert = {
        id: Date.now(),
        severity: 'critical',
        type: 'WORKER_DETECTED',
        message: `👷 Thermal signature detected — Worker #${workerNum} located in ${tunnelName}`,
        location: tunnelName,
        time: now,
      };

      const newEvent = {
        id: Date.now(),
        time: now,
        text: `👷 Worker #${workerNum} detected via thermal imaging — ${confidence}% confidence`,
        type: 'critical',
      };

      return {
        ...state,
        workers: [...state.workers, newWorker],
        workersDetected: workerNum,
        alerts: [newAlert, ...state.alerts],
        missionEvents: [newEvent, ...state.missionEvents],
        aiAnalysis: {
          text: `${workerNum} possible survivor${workerNum > 1 ? 's' : ''} detected via thermal imaging in ${tunnelName}. Rescue approach route active. Standby for rescue team deployment.`,
          riskLevel: 'HIGH',
          confidence: 93,
          recommendation: 'Deploy rescue team. Rover maintaining position for guidance.',
        },
        toasts: [...state.toasts, { id: Date.now(), type: 'warning', message: `👷 Worker #${workerNum} detected — ${confidence}% confidence` }],
      };
    }

    // ──────────────────────────────────────────
    // SIMULATE_COLLAPSE
    // ──────────────────────────────────────────
    case 'SIMULATE_COLLAPSE': {
      const tunnelId = action.tunnelId || 'T-D';
      const tunnelInfo = tunnelNetwork.find(t => t.id === tunnelId);
      const tunnelName = tunnelInfo ? tunnelInfo.name : tunnelId;
      const now = new Date().toLocaleTimeString('en-US', { hour12: false });

      const newHazard = {
        id: `HZ-COLLAPSE-${Date.now()}`,
        type: 'Tunnel Collapse',
        icon: '🧱',
        tunnelId,
        location: tunnelName,
        severity: 'critical',
        status: 'Active',
        time: 'Just now',
        detected: now,
      };

      const newAlert = {
        id: Date.now(),
        severity: 'critical',
        type: 'COLLAPSE',
        message: `🧱 Tunnel collapse detected — ${tunnelName} is blocked`,
        location: tunnelName,
        time: now,
      };

      const newEvent = {
        id: Date.now(),
        time: now,
        text: `🧱 Tunnel collapse — ${tunnelName} blocked. AI calculating alternate path.`,
        type: 'critical',
      };

      const updatedTunnels = state.tunnels.map(t =>
        t.id === tunnelId ? { ...t, condition: 'critical', status: t.status === 'unexplored' ? 'blocked' : t.status } : t
      );

      return {
        ...state,
        sensors: { ...state.sensors, structural: Math.min(state.sensors.structural, 42) },
        hazards: [newHazard, ...state.hazards],
        alerts: [newAlert, ...state.alerts],
        missionEvents: [newEvent, ...state.missionEvents],
        tunnels: updatedTunnels,
        rover: { ...state.rover, speed: state.rover.currentTunnelId === tunnelId ? 0 : state.rover.speed },
        toasts: [...state.toasts, { id: Date.now(), type: 'critical', message: `🧱 Collapse — ${tunnelName} blocked` }],
      };
    }

    // ──────────────────────────────────────────
    // SIMULATE_FLOODING
    // ──────────────────────────────────────────
    case 'SIMULATE_FLOODING': {
      const tunnelId = action.tunnelId || 'T-H';
      const tunnelInfo = tunnelNetwork.find(t => t.id === tunnelId);
      const tunnelName = tunnelInfo ? tunnelInfo.name : tunnelId;
      const now = new Date().toLocaleTimeString('en-US', { hour12: false });

      const newHazard = {
        id: `HZ-FLOOD-${Date.now()}`,
        type: 'Flooding',
        icon: '🌊',
        tunnelId,
        location: tunnelName,
        severity: 'warning',
        status: 'Active',
        time: 'Just now',
        detected: now,
      };

      const newAlert = {
        id: Date.now(),
        severity: 'warning',
        type: 'FLOODING',
        message: `🌊 Rising water levels detected in ${tunnelName}`,
        location: tunnelName,
        time: now,
      };

      const updatedTunnels = state.tunnels.map(t =>
        t.id === tunnelId ? { ...t, condition: 'warning' } : t
      );

      return {
        ...state,
        hazards: [newHazard, ...state.hazards],
        alerts: [newAlert, ...state.alerts],
        tunnels: updatedTunnels,
        toasts: [...state.toasts, { id: Date.now(), type: 'warning', message: `🌊 Flooding detected in ${tunnelName}` }],
      };
    }

    // ──────────────────────────────────────────
    // SIMULATE_NETWORK_LOSS
    // ──────────────────────────────────────────
    case 'SIMULATE_NETWORK_LOSS': {
      const now = new Date().toLocaleTimeString('en-US', { hour12: false });
      const newAlert = {
        id: Date.now(),
        severity: 'warning',
        type: 'NETWORK_LOSS',
        message: '📡 Communication link lost — Rover in autonomous failsafe mode',
        location: state.rover.currentTunnel,
        time: now,
      };
      return {
        ...state,
        networkLost: true,
        rover: { ...state.rover, connection: 'DISCONNECTED', signal: 0, speed: 0 },
        alerts: [newAlert, ...state.alerts],
        aiAnalysis: {
          ...state.aiAnalysis,
          text: 'Communication link lost. Last known position recorded. Rover in autonomous failsafe. Awaiting signal recovery.',
          riskLevel: 'HIGH',
        },
        toasts: [...state.toasts, { id: Date.now(), type: 'warning', message: '📡 Network lost — Rover offline' }],
      };
    }

    case 'SIMULATE_NETWORK_RESTORE': {
      return {
        ...state,
        networkLost: false,
        rover: { ...state.rover, connection: 'Connected', signal: 85 },
        toasts: [...state.toasts, { id: Date.now(), type: 'info', message: '📡 Network restored — Telemetry resumed' }],
      };
    }

    // ──────────────────────────────────────────
    // SIMULATE_LOW_BATTERY
    // ──────────────────────────────────────────
    case 'SIMULATE_LOW_BATTERY': {
      const now = new Date().toLocaleTimeString('en-US', { hour12: false });
      return {
        ...state,
        rover: { ...state.rover, battery: 18 },
        aiAnalysis: {
          ...state.aiAnalysis,
          text: 'Low battery alert — Rover-01 at 18%. Calculating shortest path to nearest charging station. Current mission data is being preserved.',
          riskLevel: 'HIGH',
          recommendation: 'Return to nearest charging station immediately.',
        },
        alerts: [
          { id: Date.now(), severity: 'warning', type: 'LOW_BATTERY', message: '🔋 Critical battery level — 18%. Return to charging point.', location: state.rover.currentTunnel, time: now },
          ...state.alerts,
        ],
        toasts: [...state.toasts, { id: Date.now(), type: 'warning', message: '🔋 Critical battery — 18%' }],
      };
    }

    // ──────────────────────────────────────────
    // START / STOP / RESET
    // ──────────────────────────────────────────
    case 'START_SIMULATION': {
      const now = new Date().toLocaleTimeString('en-US', { hour12: false });
      const startEvent = {
        id: Date.now(),
        time: now,
        text: '🚀 Mission Started — Rover-01 deploying',
        type: 'active',
      };
      return {
        ...state,
        mission: { ...state.mission, systemStatus: 'ACTIVE', startTime: now },
        simulation: { isRunning: true, isPaused: false, currentStep: 0, simTime: 0 },
        rover: { ...state.rover, status: 'Moving', speed: 1.8 },
        missionEvents: [startEvent, ...state.missionEvents],
        toasts: [...state.toasts, { id: Date.now(), type: 'info', message: '▶ Mission started — Rover-01 deploying' }],
      };
    }

    case 'STOP_SIMULATION': {
      return {
        ...state,
        simulation: { ...state.simulation, isRunning: false },
        mission: { ...state.mission, systemStatus: 'STOPPED' },
        rover: { ...state.rover, status: 'Standby', speed: 0 },
        toasts: [...state.toasts, { id: Date.now(), type: 'info', message: '⏹ Mission stopped' }],
      };
    }

    case 'RESET': {
      return {
        ...createInitialState(),
        toasts: [{ id: Date.now(), type: 'info', message: '↻ System reset — Ready for new mission' }],
      };
    }

    case 'REMOVE_TOAST': {
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) };
    }

    default:
      return state;
  }
}

// =============================================
// Context
// =============================================
const MineContext = createContext(null);

export function MineProvider({ children }) {
  const [state, dispatch] = useReducer(mineReducer, createInitialState());

  const tickRef = useRef(null);
  const stepRef = useRef(null);
  const stepCountRef = useRef(0);

  // ── Simulation Tick (500ms) ──────────────
  useEffect(() => {
    if (state.simulation.isRunning) {
      tickRef.current = setInterval(() => {
        dispatch({ type: 'SIMULATION_TICK' });
      }, 500);
    }
    return () => clearInterval(tickRef.current);
  }, [state.simulation.isRunning]);

  // ── Rover Step Advance (5 seconds per step) ──
  useEffect(() => {
    if (state.simulation.isRunning) {
      stepCountRef.current = state.simulation.currentStep;

      stepRef.current = setInterval(() => {
        const nextStep = stepCountRef.current + 1;
        stepCountRef.current = nextStep;

        if (nextStep >= MISSION_WAYPOINTS.length) {
          clearInterval(stepRef.current);
          dispatch({ type: 'STOP_SIMULATION' });
          return;
        }

        dispatch({ type: 'ADVANCE_STEP', step: nextStep });

        // Fire events at specific steps
        if (nextStep === 4) {
          setTimeout(() => dispatch({ type: 'SIMULATE_GAS_LEAK', tunnelId: 'T-B' }), 1500);
        }
        if (nextStep === 7) {
          setTimeout(() => dispatch({ type: 'SIMULATE_WORKER_DETECTION', tunnelId: 'T-F' }), 800);
        }
        if (nextStep === 8) {
          setTimeout(() => dispatch({ type: 'SIMULATE_WORKER_DETECTION', tunnelId: 'T-F' }), 1200);
        }
      }, 5000);
    }
    return () => clearInterval(stepRef.current);
  }, [state.simulation.isRunning]);

  // ── Toast auto-remove ──────────────────────
  useEffect(() => {
    if (state.toasts.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', id: state.toasts[0].id });
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [state.toasts]);

  const simulateEvent = useCallback((eventType, payload = {}) => {
    dispatch({ type: eventType, ...payload });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return (
    <MineContext.Provider value={{ state, dispatch, simulateEvent, resetState }}>
      {children}
    </MineContext.Provider>
  );
}

export function useMine() {
  const ctx = useContext(MineContext);
  if (!ctx) throw new Error('useMine must be used within MineProvider');
  return ctx;
}

// =============================================
// Backwards-compat accessors used by other pages
// =============================================

// Adapts new sensor state to old { gases, environment } shape for existing components
export function useSensorCompat(state) {
  const s = state.sensors;
  return {
    gases: {
      methane: { value: +s.methane.toFixed(1), unit: '%', status: s.methane >= 5.5 ? 'critical' : s.methane >= 4.0 ? 'warning' : 'safe', label: 'Methane', formula: 'CH₄', threshold: { warning: 4.0, critical: 5.5 } },
      co: { value: +s.co.toFixed(0), unit: 'ppm', status: s.co >= 50 ? 'critical' : s.co >= 25 ? 'warning' : 'safe', label: 'Carbon Monoxide', formula: 'CO', threshold: { warning: 25, critical: 50 } },
      co2: { value: +s.co2.toFixed(0), unit: 'ppm', status: s.co2 >= 5000 ? 'critical' : s.co2 >= 2000 ? 'warning' : 'safe', label: 'Carbon Dioxide', formula: 'CO₂', threshold: { warning: 2000, critical: 5000 } },
      oxygen: { value: +s.oxygen.toFixed(1), unit: '%', status: s.oxygen <= 18.0 ? 'critical' : s.oxygen <= 19.5 ? 'warning' : 'safe', label: 'Oxygen', formula: 'O₂', threshold: { warning: 19.5, critical: 18.0 }, invertWarning: true },
      h2s: { value: +s.h2s.toFixed(1), unit: 'ppm', status: s.h2s >= 10 ? 'critical' : s.h2s >= 5 ? 'warning' : 'safe', label: 'Hydrogen Sulfide', formula: 'H₂S', threshold: { warning: 5, critical: 10 } },
    },
    environment: {
      temperature: { value: +s.temperature.toFixed(1), unit: '°C', status: s.temperature > 40 ? 'critical' : s.temperature > 35 ? 'warning' : 'safe', trend: 'up' },
      humidity: { value: +s.humidity.toFixed(0), unit: '%', status: s.humidity > 80 ? 'critical' : s.humidity > 70 ? 'warning' : 'safe', trend: 'stable' },
      smoke: { value: +s.smoke.toFixed(0), unit: 'ppm', status: s.smoke > 30 ? 'critical' : s.smoke > 15 ? 'warning' : 'safe', trend: 'stable' },
      pressure: { value: +s.pressure.toFixed(0), unit: 'hPa', status: 'safe', trend: 'stable' },
      airQuality: { value: s.airQuality, status: s.airQuality === 'CRITICAL' ? 'critical' : s.airQuality === 'WARNING' ? 'warning' : 'safe', trend: 'stable' },
      structural: { value: +s.structural.toFixed(0), unit: '%', status: s.structural < 50 ? 'critical' : s.structural < 70 ? 'warning' : 'safe', trend: 'down' },
    },
  };
}

// Legacy compatibility — mission timeline now comes from state.missionEvents
export const missionTimeline = [];

// Legacy simulation waypoints — now handled internally
export const simulationWaypoints = MISSION_WAYPOINTS;
