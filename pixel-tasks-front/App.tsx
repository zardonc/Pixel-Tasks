import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { Layout } from './components/Layout';
import { CharacterCreation } from './pages/CharacterCreation';
import { Dashboard } from './pages/Dashboard';
import { GameHub } from './pages/GameHub';
import { Shop } from './pages/Shop';
import { Achievements } from './pages/Achievements';
import { Profile } from './pages/Profile';
import { NotFound } from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard'; // Import AdminDashboard
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useStore(state => state.user);
  const { isLoading } = useAuth(); // Use isLoading from AuthContext for initial loading state
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />; // Changed to /login to match existing app
  return <>{children}</>;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const user = useStore(state => state.user);
    const { isLoading } = useAuth(); // Use isLoading from AuthContext for initial loading state
    if (isLoading) return <div>Loading...</div>;
    if (!user || user.role !== 'ADMIN') return <Navigate to="/" replace />; // Redirect to home if not admin
    return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user: authUser, isLoading } = useAuth();
  const setStoreUser = useStore(state => state.setUser);
  const user = useStore(state => state.user);
  const [isEditorOpen, setEditorOpen] = useState(false);

  // Sync AuthContext user to Zustand Store
  useEffect(() => {
    if (!isLoading) {
      setStoreUser(authUser);
    }
  }, [authUser, isLoading, setStoreUser]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading Pixel World...</div>;
  }

  return (
    <Router>
      <div className="font-pixel antialiased text-gray-900 dark:text-gray-100 min-h-screen">
        <Routes>
          {/* Public Route: Character Creation / Login */}
          <Route
            path="/login"
            element={!user ? <CharacterCreation /> : <Navigate to="/" replace />}
          />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><Layout onAddTask={() => setEditorOpen(true)}><Dashboard isEditorOpen={isEditorOpen} onCloseEditor={() => setEditorOpen(false)} /></Layout></ProtectedRoute>} />
          <Route path="/shop" element={<ProtectedRoute><Layout onAddTask={() => {}}><Shop /></Layout></ProtectedRoute>} />
          <Route path="/gamehub" element={<ProtectedRoute><Layout onAddTask={() => {}}><GameHub /></Layout></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><Layout onAddTask={() => {}}><Achievements /></Layout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Layout onAddTask={() => {}}><Profile /></Layout></ProtectedRoute>} />

          {/* Admin Route */}
          <Route path="/admin" element={<AdminRoute><Layout onAddTask={() => {}}><AdminDashboard /></Layout></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
