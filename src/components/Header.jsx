import React from 'react';
import { NicheLogo, SearchIcon } from './icons';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 lg:h-20 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <a href="/" className="flex items-center">
            <img src="/Niche-N-Green-900.svg" alt="Niche" className="h-8 lg:h-10" />
            <span className="hidden lg:block ml-2 text-2xl font-bold tracking-tighter text-brand-dark-green">NICHE</span>
          </a>
          
          <nav className="hidden lg:flex items-center gap-6">
            <a href="/universities" className="text-[14px] font-bold text-gray-700 hover:text-[#26844D] transition-colors">Schools Directory</a>
            <a href="/sas" className="text-[14px] font-bold text-gray-700 hover:text-[#26844D] transition-colors">SAS</a>
            <a href="/award" className="text-[14px] font-bold text-gray-700 hover:text-[#26844D] transition-colors">Aspirants Award</a>
            <a href="/news" className="text-[14px] font-bold text-gray-700 hover:text-[#26844D] transition-colors">News</a>
            <a href="/about" className="text-[14px] font-bold text-gray-700 hover:text-[#26844D] transition-colors">About Us</a>
            <button className="text-gray-400 hover:text-[#26844D]">
              <span className="text-xl">•••</span>
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:block px-6 py-2 border border-[#111111] text-[#111111] font-bold rounded-full hover:bg-gray-100 transition-colors" onClick={() => window.location.href='/about'}>
            Our Story
          </button>
          
          <button className="px-6 py-2 bg-[#26844D] text-white font-bold rounded-full hover:bg-[#1a5b35] transition-colors" onClick={() => window.location.href='/partner'}>
            Partner With Us
          </button>
        </div>
      </div>
    </header>
  );
};
