import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Bot, FileText, Settings, LogOut, Shield } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>
          <span className="brand-icon"><Shield size={16} /></span>
          BHUMI-R
        </h1>
        <p>Mine Safety &amp; Rescue Command Center</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
          <LayoutDashboard className="nav-icon" />
          Dashboard
        </NavLink>
        <NavLink to="/simulation" className={({ isActive }) => isActive ? 'active' : ''}>
          <Bot className="nav-icon" />
          Rescue Simulation
        </NavLink>
        <NavLink to="/report" className={({ isActive }) => isActive ? 'active' : ''}>
          <FileText className="nav-icon" />
          Survey Report
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <a href="#settings">
          <Settings size={18} />
          Settings
        </a>
        <a href="#logout">
          <LogOut size={18} />
          Logout
        </a>
      </div>
    </aside>
  );
}
