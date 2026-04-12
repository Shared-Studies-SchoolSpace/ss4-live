import React from 'react';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import XIcon from '@mui/icons-material/X';
import YouTubeIcon from '@mui/icons-material/YouTube';

const TikTokIcon = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.28-3.99 3.5-7.52 7.42-7.03.3.03.59.08.88.17v4.47c-.46-.15-.95-.26-1.44-.26-1.53-.14-3.15.75-3.69 2.19-.31.84-.13 1.81.46 2.45.61.58 1.41.86 2.22.84 1.25-.01 2.4-.92 2.74-2.12.18-.57.17-1.17.17-1.75V.02z" />
  </svg>
);

const FooterColumn = ({ title, links }) => (
  <div className="space-y-6">
    <h3 className="text-[10px] font-black text-gray-400 tracking-[0.25em] uppercase">{title}</h3>
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link}>
          <a href="#" className="text-[13px] font-bold text-gray-600 hover:text-brand-accent transition-colors">{link}</a>
        </li>
      ))}
    </ul>
  </div>
);

export const Footer = () => {
  return (
    <footer className="bg-white pt-24 pb-12 px-4 border-t border-gray-100">
      <div className="container mx-auto">
        {/* Main Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-24">
          <div className="space-y-8 sm:col-span-2 lg:col-span-1">
             <div className="flex items-center gap-2 opacity-100 transition-all cursor-pointer">
                <img src="/ss4_logo.jpg" alt="SS4" className="h-6" />
             </div>
             <ul className="space-y-4">
                {['About Us', 'SS4 For Schools', 'SS4 For Sponsors', 'Blog', 'Contact SS4'].map(l => (
                    <li key={l}><a href="#" className="text-sm font-bold text-gray-500 hover:text-brand-accent">{l}</a></li>
                ))}
             </ul>
          </div>

          <FooterColumn 
            title="Search Categories"
            links={['Secondary Schools', 'Scholarships', 'Study Resources']}
          />
        </div>

        <hr className="border-gray-100 mb-12" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-6 text-gray-400">
            {[
              { icon: <InstagramIcon fontSize="small" />, link: '#' },
              { icon: <FacebookIcon fontSize="small" />, link: '#' },
              { icon: <XIcon fontSize="small" />, link: '#' },
              { icon: <TikTokIcon />, link: '#' },
              { icon: <YouTubeIcon fontSize="small" />, link: '#' }
            ].map((social, i) => (
                <a key={i} href={social.link} className="hover:text-brand-accent transition-all duration-300">
                    {social.icon}
                </a>
            ))}
          </div>

          <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">
            © 2026 SS4 Inc.
          </p>

        </div>
      </div>
    </footer>
  );
};
