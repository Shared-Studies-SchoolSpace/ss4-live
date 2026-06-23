import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon } from './icons';

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on the toggle button itself (to let the onClick handle it)
      const toggleButton = document.getElementById('mobile-menu-toggle');
      if (toggleButton && toggleButton.contains(event.target)) {
        return;
      }
      
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 h-16 lg:h-20 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <a href="/" className="flex items-center">
            <img src="/ss4_logo.jpg" alt="SS4" className="h-10 lg:h-12" />
          </a>
          
          <nav className="hidden lg:flex items-center gap-8">
            <div className="relative group py-2">
              <button className="text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors flex items-center gap-1 focus:outline-none cursor-pointer">
                Schools
                <svg className="w-3.5 h-3.5 transition-transform duration-250 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {/* Dropdown Card */}
              <div className="absolute top-[100%] left-0 mt-1 w-48 bg-white border border-gray-150 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
                <a href="/schools" className="block px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-[#F6F4F0] hover:text-brand-primary transition-colors">Secondary Schools</a>
                <a href="/tertiary" className="block px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-[#F6F4F0] hover:text-brand-primary transition-colors">Tertiary Institutions</a>
              </div>
            </div>
            <div className="relative group py-2">
              <button className="text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors flex items-center gap-1 focus:outline-none cursor-pointer">
                Chess League
                <svg className="w-3.5 h-3.5 transition-transform duration-250 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {/* Dropdown Card */}
              <div className="absolute top-[100%] left-0 mt-1 w-48 bg-white border border-gray-150 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
                <a href="/chess-league" className="block px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-[#F6F4F0] hover:text-brand-primary transition-colors">League Divisions</a>
                <a href="/chess-league/tournament" className="block px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-[#F6F4F0] hover:text-brand-primary transition-colors">Monthly Tournament</a>
              </div>
            </div>
            <a href="/sas" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors">Assessment Series</a>
            <a href="/award" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors">Aspirants Award</a>
            <a href="/news" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors">News</a>
            <a href="/about" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors">About</a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:block px-6 py-2 border border-[#E8640A] text-[#E8640A] font-bold rounded-full hover:bg-gray-100 transition-colors" onClick={() => window.location.href='/partner'}>
            Partner With Us
          </button>
          
          {/* Mobile menu toggle */}
          <button 
            id="mobile-menu-toggle"
            className="lg:hidden p-2 text-brand-primary focus:outline-none"
            onClick={(e) => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <motion.span
                animate={isMobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-current rounded-full origin-center"
              />
              <motion.span
                animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-full h-0.5 bg-current rounded-full"
              />
              <motion.span
                animate={isMobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-current rounded-full origin-center"
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            ref={menuRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-[100%] left-0 w-full bg-white border-b border-gray-100 shadow-xl p-6 flex flex-col gap-4 z-40 text-left"
          >
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Schools Directory</span>
              <a href="/schools" className="pl-4 text-[14px] font-bold text-gray-700 hover:text-brand-primary" onClick={() => setIsMobileMenuOpen(false)}>Secondary Schools</a>
              <a href="/tertiary" className="pl-4 text-[14px] font-bold text-gray-700 hover:text-brand-primary" onClick={() => setIsMobileMenuOpen(false)}>Tertiary Institutions</a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Chess League</span>
              <a href="/chess-league" className="pl-4 text-[14px] font-bold text-gray-700 hover:text-brand-primary" onClick={() => setIsMobileMenuOpen(false)}>League Divisions</a>
              <a href="/chess-league/tournament" className="pl-4 text-[14px] font-bold text-gray-700 hover:text-brand-primary" onClick={() => setIsMobileMenuOpen(false)}>Monthly Tournament</a>
            </div>
            <a href="/sas" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary" onClick={() => setIsMobileMenuOpen(false)}>Assessment Series</a>
            <a href="/award" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary" onClick={() => setIsMobileMenuOpen(false)}>Aspirants Award</a>
            <a href="/news" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary" onClick={() => setIsMobileMenuOpen(false)}>News</a>
            <a href="/about" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary" onClick={() => setIsMobileMenuOpen(false)}>About</a>
            <hr className="my-2 border-gray-100" />
            <button className="py-3 border border-[#E8640A] text-[#E8640A] font-bold rounded-full hover:bg-gray-50 w-full" onClick={() => window.location.href='/partner'}>
              Partner With Us
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
