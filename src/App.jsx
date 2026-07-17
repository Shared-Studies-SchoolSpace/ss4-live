import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import LandingPage from './pages/Landing';
import SchoolsPage from './features/schools/pages/SchoolsPage';
import UniversityPage from './features/tertiary-admissions/pages/UniversityPage';
import CreateUniversityPage from './features/tertiary-admissions/pages/CreateUniversityPage';
import SasPage from './pages/SasPage';
import AspirantsAwardPage from './pages/AspirantsAwardPage';
import NewsPage from './pages/NewsPage';
import AboutPage from './pages/AboutPage';
import ChessLeaguePage from './features/chess-league/pages/ChessLeaguePage';
import ChessTournamentPage from './features/chess-league/pages/ChessTournamentPage';
import TertiaryPage from './features/tertiary-admissions/pages/TertiaryPage';
import TertiaryDetailPage from './features/tertiary-admissions/pages/TertiaryDetailPage';
import DashboardPage from './features/auth-portal/pages/DashboardPage';

import BackToTop from './components/BackToTop';
import ScrollToTop from './components/ScrollToTop';
import { AuthModalProvider } from './features/auth-portal/context/AuthModalContext';


function App() {
  return (
    <AuthModalProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-brand-bg-cream text-brand-text-dark selection:bg-brand-primary selection:text-white flex flex-col">
          <Header />
          <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/schools" element={<SchoolsPage />} />
            <Route path="/school/:id" element={<UniversityPage />} />
            <Route path="/partner" element={<CreateUniversityPage />} />
            <Route path="/sas" element={<SasPage />} />
            <Route path="/award" element={<AspirantsAwardPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/chess-league" element={<ChessLeaguePage />} />
            <Route path="/chess-league/tournament" element={<ChessTournamentPage />} />
            <Route path="/tournaments/register" element={<Navigate to="/chess-league/tournament" replace />} />
            <Route path="/tournament/register" element={<Navigate to="/chess-league/tournament" replace />} />
            <Route path="/tertiary" element={<TertiaryPage />} />
            <Route path="/tertiary/:id" element={<TertiaryDetailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>

        <Footer />
        <BackToTop />
        <ToastContainer position="bottom-right" autoClose={4000} hideProgressBar={false} />
        </div>
      </Router>
    </AuthModalProvider>
  );
}

export default App;