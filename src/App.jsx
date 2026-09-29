import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MineProvider } from './store/MineContext';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/ToastContainer';
import Dashboard from './pages/Dashboard';
import RescueSimulation from './pages/RescueSimulation';
import SurveyReport from './pages/SurveyReport';

export default function App() {
  return (
    <MineProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Sidebar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/simulation" element={<RescueSimulation />} />
              <Route path="/report" element={<SurveyReport />} />
            </Routes>
          </div>
          <ToastContainer />
        </div>
      </BrowserRouter>
    </MineProvider>
  );
}
