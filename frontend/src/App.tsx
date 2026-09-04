// App.tsx — Router and layout shell (no Tailwind)
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Wind, User, History } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import HistoryPage from './pages/History';

const NAV = [
  { to: '/',         icon: <Wind size={18} />,    label: 'Dashboard' },
  { to: '/profile',  icon: <User size={18} />,    label: 'Profile'   },
  { to: '/history',  icon: <History size={18} />, label: 'History'   },
];

export default function App() {
  return (
    <BrowserRouter>
      <nav className="topnav">
        <div className="nav-logo">
          <span style={{ fontSize: 22 }}>🌫️</span>
          <span className="font-bold text-xl tracking-tight text-white">
            AeroSmog<span className="text-accent">.AI</span>
          </span>
          <span className="badge badge-green" style={{ marginLeft: 4 }}>
            <span className="pulse" style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#00e400' }} />
            Live
          </span>
        </div>
        <div className="nav-links">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {n.icon}
              <span>{n.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <main style={{ minHeight: 'calc(100vh - 56px)' }}>
        <Routes>
          <Route path="/"        element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
