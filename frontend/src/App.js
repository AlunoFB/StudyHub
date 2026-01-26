import React, { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import QuestionBank from '@/pages/QuestionBank';
import QuestionSolve from '@/pages/QuestionSolve';
import Ranking from '@/pages/Ranking';
import Profile from '@/pages/Profile';
import { ThemeProvider } from '@/components/ThemeProvider';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="studyhub-theme">
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
            <Route 
              path="/auth" 
              element={user ? <Navigate to="/dashboard" /> : <AuthPage onLogin={handleLogin} />} 
            />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/questions" 
              element={user ? <QuestionBank user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/questions/:questionId" 
              element={user ? <QuestionSolve user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/ranking" 
              element={user ? <Ranking user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/profile" 
              element={user ? <Profile user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />} 
            />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </ThemeProvider>
  );
}

export default App;