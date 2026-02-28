import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Settings from './pages/Settings';
import OriginStory from './pages/OriginStory';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import AuroraBackground from './components/ModernBackground';
import AutoLogout from './components/AutoLogout';

function App() {
  return (
    <div className="relative min-h-screen text-white overflow-hidden font-sans antialiased selection:bg-purple-500/30">
      <AuroraBackground />
      <Router>
        <AutoLogout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Helper to redirect users who try to access root */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Protected Routes wrapped in Layout (Sidebar) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/origin" element={<OriginStory />} />
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AutoLogout>
      </Router>
    </div>
  );
}

export default App;
