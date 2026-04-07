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
            {['Junior Secondary', 'Senior Secondary', 'A-Levels', 'Scholarships & Financial Aid', 'Resources'].map((item) => (
              <a 
                key={item} 
                href="#" 
                className="text-[14px] font-bold text-gray-700 hover:text-brand-primary-green transition-colors"
              >
                {item}
              </a>
            ))}
            <button className="text-gray-400 hover:text-brand-primary-green">
              <span className="text-xl">•••</span>
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-500 hover:text-brand-primary-green">
            <SearchIcon className="w-6 h-6" />
          </button>
          
          <button className="hidden sm:block px-6 py-2 border border-brand-dark-green text-brand-dark-green font-bold rounded-full hover:bg-green-50 transition-colors">
            Log In
          </button>
          
          <button className="px-6 py-2 bg-brand-dark-green text-white font-bold rounded-full hover:bg-brand-primary-green transition-colors">
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
};
