import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AuthGate from './auth/AuthGate';
import Button from './Button';

const IMAGES = ['/scholastic_chess_hero.jpg', '/bglg.png'];

export const Hero = () => {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative flex flex-col lg:flex-row min-h-[600px] bg-brand-primary overflow-hidden mb-8 lg:mb-12">
      {/* Left Side: Image Carousel Container */}
      <div className="relative w-full lg:w-1/2 h-[350px] lg:h-auto overflow-hidden">
        <AnimatePresence initial={false}>
          <Motion.img
            key={currentIdx}
            src={IMAGES[currentIdx]}
            alt="Scholastic Chess & League"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-30 bg-black/30 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10">
          {IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                currentIdx === idx ? 'bg-white scale-125 shadow' : 'bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Show slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Wave Overlay */}
        <div className="absolute bottom-0 left-0 w-full h-12 lg:hidden bg-brand-primary wave-top transform rotate-180 z-20 pointer-events-none" />
      </div>

      {/* Right Side: Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-20 text-white">
        <Motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-lg"
        >
          <h2 className="text-xs lg:text-sm font-space font-bold tracking-[0.2em] mb-6 opacity-90 uppercase">
            An Institution for Secondary Education Excellence
          </h2>
          <h1 className="text-4xl lg:text-6xl font-space font-black leading-tight mb-8 uppercase">
            A Haven for Institutions
          </h1>
          
          <div className="w-24 h-1 bg-brand-accent mb-8 rounded-full" />
          
          <p className="text-white text-lg lg:text-xl font-medium mb-10 max-w-lg drop-shadow-md leading-relaxed">
            SS4 connects schools, tertiary institutions, departments, and students into one shared space where they compete, collaborate , and build together. Before SS4, institutions were islands. Now they are one continent.
          </p>

          <div className="space-y-6">
            <h3 className="text-xs font-bold tracking-widest uppercase opacity-80">
              Get Started
            </h3>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <AuthGate reason="join the SS4 League" onAction={() => navigate('/dashboard')}>
                <Button 
                  variant="primary" 
                  className="px-8 py-3 uppercase tracking-wider text-[11px] font-black shadow-md rounded-full border-none text-white"
                  style={{ backgroundColor: '#E8640A' }}
                >
                  Join League Arena
                </Button>
              </AuthGate>
              
              <Button 
                onClick={() => navigate("/schools")} 
                variant="secondary" 
                className="px-8 py-3 uppercase tracking-wider text-[11px] font-black rounded-full bg-white text-[#111111] hover:bg-gray-100 border-none"
              >
                Explore Schools
              </Button>
            </div>
          </div>
        </Motion.div>
      </div>
      
      {/* Wave bottom decoration */}
      <div className="absolute -bottom-1 left-0 w-full h-16 text-brand-bg-cream fill-current pointer-events-none z-10">
        <svg viewBox="0 0 1440 320" className="w-full h-full preserve-3d">
            <path d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,186.7C960,192,1056,160,1152,144C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
};
