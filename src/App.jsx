import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Pages
import LandingPage from './pages/Landing';
import SchoolsPage from './pages/SchoolsPage';
import UniversityPage from './pages/UniversityPage';
import CreateUniversityPage from './pages/CreateUniversityPage';
import SasPage from './pages/SasPage';
import AspirantsAwardPage from './pages/AspirantsAwardPage';
import NewsPage from './pages/NewsPage';
import AboutPage from './pages/AboutPage';
import ChessLeaguePage from './pages/ChessLeaguePage';
import ChessTournamentPage from './pages/ChessTournamentPage';
import TertiaryPage from './pages/TertiaryPage';
import TertiaryDetailPage from './pages/TertiaryDetailPage';

import BackToTop from './components/BackToTop';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
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
            <Route path="/tertiary" element={<TertiaryPage />} />
            <Route path="/tertiary/:id" element={<TertiaryDetailPage />} />
          </Routes>
        </main>
        <Footer />
        <BackToTop />
      </div>
    </Router>
  );
}

export default App;