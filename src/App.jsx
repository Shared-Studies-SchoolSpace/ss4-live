import React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { DirectAdmissions } from './components/DirectAdmissions';
import { DiscoveryGrid } from './components/DiscoveryGrid';
import { NicheStories } from './components/NicheStories';
import { StayOnTrack } from './components/StayOnTrack';
import { ChooseYourSchool } from './components/ChooseYourSchool';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white selection:bg-brand-primary-green selection:text-white">
      <Header />
      <main>
        <Hero />
        <DirectAdmissions />
        <DiscoveryGrid />
        <NicheStories />
        <StayOnTrack />
        <ChooseYourSchool />
        
        {/* Rankings Section Placeholder with Dark Green BG */}
        <section className="bg-brand-dark-green py-32 px-4 text-center">
            <div className="container mx-auto">
                <p className="text-xs font-bold tracking-[0.2em] text-white opacity-60 uppercase mb-4">2026 Rankings</p>
                <h2 className="text-4xl lg:text-5xl font-black text-white mb-8">
                    Browse schools & colleges by “best of” lists.
                </h2>
                <div className="w-32 h-1.5 bg-brand-primary-green mx-auto mb-12 rounded-full" />
                <p className="max-w-2xl mx-auto text-lg text-white/80 font-medium mb-12 text-center">
                    We combine the reviews and the data to put together these comprehensive lists to get you started.
                </p>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App;