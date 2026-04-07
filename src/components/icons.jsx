import React from 'react';

export const NicheLogo = ({ className }) => (
  <img src="/Niche-N-Green-900.svg" alt="Niche Logo" className={className} />
);

export const SearchIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const MenuIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const WhyIcon1 = () => <img src="/home/why-icon-1.svg" alt="No Heavy Lifting" />;
export const WhyIcon2 = () => <img src="/home/why-icon-2.svg" alt="The Good, The Bad, & The Honest" />;
export const WhyIcon3 = () => <img src="/home/why-icon-3.svg" alt="Like a Glove" />;
