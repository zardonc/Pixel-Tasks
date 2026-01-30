import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { Layout } from './components/Layout';
import { CharacterCreation } from './pages/CharacterCreation';
import { Dashboard } from './pages/Dashboard';
import { GameHub } from './pages/GameHub';
import { Shop } from './pages/Shop';
import { Achievements } from './pages/Achievements';
import { NotFound } from './pages/NotFound';

const App: React.FC = () => {
  const user = useStore(state => state.user);
  const [isEditorOpen, setEditorOpen] = useState(false);

  return (
    <Router>
      <div className="font-pixel antialiased text-gray-900 dark:text-gray-100 min-h-screen">
        <Routes>
          {/* Public Route: Character Creation */}
          <Route 
            path="/login" 
            element={!user ? <CharacterCreation /> : <Navigate to="/" replace />} 
          />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              user ? (
                <Layout onAddTask={() => setEditorOpen(true)}>
                  <Routes>
                    <Route path="/" element={<Dashboard isEditorOpen={isEditorOpen} onCloseEditor={() => setEditorOpen(false)} />} />
                    <Route path="/gamehub" element={<GameHub />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/achievements" element={<Achievements />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
