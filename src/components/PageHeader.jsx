import { useMine } from '../store/MineContext';

export default function PageHeader({ title, subtitle }) {
  const { state } = useMine();

  return (
    <header className="page-header">
      <div className="page-header-left">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <div className="page-header-right">
        <div className="header-info">
          <label>Mission ID</label>
          <span>{state.mission.id}</span>
        </div>
        <div className="header-info">
          <label>Mine Area</label>
          <span>{state.mission.area}</span>
        </div>
        <div className="header-info">
          <label>System Status</label>
          <span className="status-online">{state.mission.systemStatus}</span>
        </div>
      </div>
    </header>
  );
}
