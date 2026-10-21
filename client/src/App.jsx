/* eslint-disable no-unused-vars */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Page Components
import HomePage from './pages/Homepage';
import AboutUs from './pages/AboutUs';
import Login from './pages/Login';
import Register from './pages/Register';
import StartCampaign from './pages/StartCampaign';
import UserGuide from './pages/UserGuide';

import Discover from './pages/Discover'; 
import CampaignDetails from './pages/CampaignDetails';

import Testimonials from './pages/Testimonials';

// Dashboard Components
import BeneficiaryDashboard from './pages/dashboards/BeneficiaryDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import DonorDashboard from './pages/dashboards/DonorDashboard';

// --- LIVE RENDER BACKEND API CONFIGURATION ---
export const API = process.env.NODE_ENV === 'production' 
  ? 'https://aidbridge-itsz.onrender.com/api' 
  : 'http://localhost:5000/api';


const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    // Redirect to home if user tries to access a dashboard not meant for their role
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div style={appStyles.appWrapper}>
        <Navbar />

        {/* AnimatePresence for smooth page transitions (SDS UI/UX Goal) */}
        <main style={appStyles.mainContent}>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/campaign/:id" element={<CampaignDetails />} />
              <Route path="/user-guide" element={<UserGuide />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/testimonials" element={<Testimonials />} />

              
              {/* --- PROTECTED DASHBOARDS --- */}
              {/* Admin: Manage Users & Campaigns */}
              <Route 
                path="/AdminDashboard" 
                element={
                  <ProtectedRoute allowedRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Beneficiary: Create & Track Aid Requests */}
              <Route 
                path="/BeneficiaryDashboard" 
                element={
                  <ProtectedRoute allowedRole="beneficiary">
                    <BeneficiaryDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Donor: The High-Impact Dashboard with AI Trust Metrics */}
              <Route 
                path="/DonorDashboard" 
                element={
                  <ProtectedRoute allowedRole="donor">
                    <DonorDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Campaign Management (Requires Authentication) */}
              <Route 
                path="/StartCampaign" 
                element={
                  <ProtectedRoute allowedRole="beneficiary">
                    <StartCampaign />
                  </ProtectedRoute>
                } 
              />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

const NotFound = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    style={appStyles.notFoundContainer}
  >
    <div style={appStyles.errorBox}>
      <h1 style={appStyles.errorTitle}>404</h1>
      <div style={appStyles.errorDivider}></div>
      <p style={appStyles.errorText}>The page you are looking for has been moved or doesn't exist.</p>
      <a href="/" style={appStyles.backBtn}>Return to Mission</a>
    </div>
  </motion.div>
);
// Good structure for scrolling:

const appStyles = {
  appWrapper: { 
    display: 'flex', 
    flexDirection: 'column', 
    // CHANGE: Use minHeight to allow growth, remove fixed height constraints
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#F8FAFC',
    overflowX: 'hidden', // Prevents horizontal scroll glitches
    position: 'relative'
  },
  mainContent: { 
    flex: '1 0 auto', // CHANGE: This allows the main section to grow with content
    width: '100%',
    position: 'relative',
    display: 'block' // Ensures block-level scrolling behavior
  },
  // ... rest of your styles stay the same
  notFoundContainer: {
    padding: '100px 20px',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '70vh'
  },
  errorBox: {
    maxWidth: '500px'
  },
  errorTitle: { 
    fontSize: '6rem', 
    fontWeight: '900', 
    color: '#0F172A', 
    lineHeight: 1,
    margin: 0
  },
  errorDivider: {
    width: '50px',
    height: '6px',
    backgroundColor: '#26C2B9',
    margin: '20px auto',
    borderRadius: '10px'
  },
  errorText: { 
    color: '#64748B', 
    marginBottom: '30px',
    fontWeight: '500',
    fontSize: '1.1rem'
  },
  backBtn: {
    display: 'inline-block',
    padding: '16px 32px',
    backgroundColor: '#26C2B9',
    color: 'white',
    borderRadius: '16px',
    textDecoration: 'none',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontSize: '0.8rem',
    boxShadow: '0 10px 15px -3px rgba(38, 194, 185, 0.3)',
    transition: 'transform 0.2s'
  }
};

export default App;