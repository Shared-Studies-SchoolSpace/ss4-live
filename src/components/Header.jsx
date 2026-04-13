import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon } from './icons';

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
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
      <div className="container mx-auto px-4 h-16 lg:h-20 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <a href="/" className="flex items-center">
            <img src="/ss4_logo.jpg" alt="SS4" className="h-10 lg:h-10" />
          </a>
          
          <nav className="hidden lg:flex items-center gap-6">
            <a href="/universities" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors">Network</a>
            <a href="/sas" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors">SAS</a>
            <a href="/award" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors">Aspirants Award</a>
            <a href="/news" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors">News</a>
            <a href="/about" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors">About Us</a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:block px-6 py-2 border border-[#E8640A] text-[#E8640A] font-bold rounded-full hover:bg-gray-100 transition-colors" onClick={() => window.location.href='/about'}>
            Our Vision
          </button>
          
          {/* Mobile menu toggle */}
          <button 
            className="lg:hidden p-2 text-brand-primary focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
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
            className="lg:hidden absolute top-[100%] left-0 w-full bg-white border-b border-gray-100 shadow-xl p-6 flex flex-col gap-4 z-40"
          >
            <a href="/universities" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary" onClick={() => setIsMobileMenuOpen(false)}>Network</a>
            <a href="/sas" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary" onClick={() => setIsMobileMenuOpen(false)}>SAS</a>
            <a href="/award" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary" onClick={() => setIsMobileMenuOpen(false)}>Aspirants Award</a>
            <a href="/news" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary" onClick={() => setIsMobileMenuOpen(false)}>News</a>
            <a href="/about" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary" onClick={() => setIsMobileMenuOpen(false)}>About Us</a>
            <hr className="my-2 border-gray-100" />
            <button className="py-3 border border-[#E8640A] text-[#E8640A] font-bold rounded-full hover:bg-gray-50 w-full" onClick={() => window.location.href='/about'}>
              Our Vision
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
