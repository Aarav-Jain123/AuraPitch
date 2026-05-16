/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import NewSessionPage from './pages/NewSessionPage';
import PracticeSessionPage from './pages/PracticeSessionPage';
import SessionReportPage from './pages/SessionReportPage';

export default function App() {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'system';
    const root = window.document.documentElement;
    let effectiveTheme = theme;
    
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
    document.body.style.backgroundColor = effectiveTheme === 'dark' ? '#020617' : '#f8fafc';
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing-page" element={<LandingPage />} />
        
        <Route path="/home" element={<HomePage />} />
          <Route path="/new-session" element={<NewSessionPage />} />
        <Route path="/practice-session" element={<PracticeSessionPage />} />
        <Route path="/session-report" element={<SessionReportPage />} />

        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
