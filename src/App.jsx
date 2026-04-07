import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Pages
import LandingPage from './pages/Landing';
import UniversitiesPage from './pages/UniversitiesPage';
import UniversityPage from './pages/UniversityPage';
import CreateUniversityPage from './pages/CreateUniversityPage';
import SasPage from './pages/SasPage';
import AspirantsAwardPage from './pages/AspirantsAwardPage';
import NewsPage from './pages/NewsPage';
import AboutPage from './pages/AboutPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-brand-bg-cream text-brand-text-dark selection:bg-brand-primary selection:text-white">
        <Header />
        <main className="min-h-[70vh]">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/universities" element={<UniversitiesPage />} />
            <Route path="/school/:id" element={<UniversityPage />} />
            <Route path="/partner" element={<CreateUniversityPage />} />
            <Route path="/sas" element={<SasPage />} />
            <Route path="/award" element={<AspirantsAwardPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;