import React, { useState } from 'react';
import { SearchIcon } from './icons';

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 lg:h-20 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <a href="/" className="flex items-center">
            <img src="/ss4_logo.jpg" alt="SS4" className="h-12 lg:h-16" />
          </a>
          
          <nav className="hidden lg:flex items-center gap-6">
            <a href="/universities" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors">Schools Directory</a>
            <a href="/sas" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors">SAS</a>
            <a href="/award" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors">Aspirants Award</a>
            <a href="/news" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors">News</a>
            <a href="/about" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors">About Us</a>
            <button className="text-gray-400 hover:text-brand-primary">
              <span className="text-xl">•••</span>
            </button>
          </nav>
        </div>

        {/* Mobile menu toggle */}
        <button 
          className="lg:hidden ml-auto mr-4 text-brand-primary"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>

        <div className="flex items-center gap-4">
          <button className="hidden sm:block px-6 py-2 border border-[#111111] text-[#111111] font-bold rounded-full hover:bg-gray-100 transition-colors" onClick={() => window.location.href='/about'}>
            Our Story
          </button>
          
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-[100%] left-0 w-full bg-white border-b border-gray-100 shadow-md p-6 flex flex-col gap-4">
          <a href="/universities" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary">Schools Directory</a>
          <a href="/sas" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary">SAS</a>
          <a href="/award" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary">Aspirants Award</a>
          <a href="/news" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary">News</a>
          <a href="/about" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary">About Us</a>
          <hr className="my-2 border-gray-100" />
          <button className="py-3 border border-[#111111] text-[#111111] font-bold rounded-full hover:bg-gray-100 w-full" onClick={() => window.location.href='/about'}>
            Our Story
          </button>
        </div>
      )}
    </header>
  );
};
