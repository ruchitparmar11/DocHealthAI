import { useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import FileUpload from './components/FileUpload'
import History from './components/History'
import AppealEditor from './components/AppealEditor'
import DashboardLayout from './components/DashboardLayout'
import DashboardHome from './components/DashboardHome'
import Login from './components/Login'
import Register from './components/Register'
import Profile from './components/Profile'
import { AuthProvider } from './context/AuthContext'
import AuthContext from './context/AuthContext'

const PrivateRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return token ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return !token ? children : <Navigate to="/" />;
};

import { ThemeProvider } from './context/ThemeContext'
import { AIProvider } from './context/AIContext'

// ... existing imports

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AIProvider>
          <Router>
            {/* ... existing routes ... */}
            <Routes>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

              <Route path="/*" element={
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={
                      <DashboardHome>
                        <FileUpload />
                      </DashboardHome>
                    } />
                    <Route path="/history" element={
                      <PrivateRoute>
                        <History />
                      </PrivateRoute>
                    } />
                    <Route path="/appeal/:id" element={
                      <PrivateRoute>
                        <AppealEditor />
                      </PrivateRoute>
                    } />
                    <Route path="/profile" element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    } />
                  </Routes>
                </DashboardLayout>
              } />
            </Routes>
          </Router>
        </AIProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
