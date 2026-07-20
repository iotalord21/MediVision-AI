import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import History from './pages/History';

import DiabetesPredict from './pages/predict/DiabetesPredict';
import HeartPredict from './pages/predict/HeartPredict';
import KidneyPredict from './pages/predict/KidneyPredict';
import LiverPredict from './pages/predict/LiverPredict';
import ParkinsonsPredict from './pages/predict/ParkinsonsPredict';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-cyan-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/predict/diabetes"
                element={
                  <ProtectedRoute>
                    <DiabetesPredict />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/predict/heart"
                element={
                  <ProtectedRoute>
                    <HeartPredict />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/predict/kidney"
                element={
                  <ProtectedRoute>
                    <KidneyPredict />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/predict/liver"
                element={
                  <ProtectedRoute>
                    <LiverPredict />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/predict/parkinsons"
                element={
                  <ProtectedRoute>
                    <ParkinsonsPredict />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
