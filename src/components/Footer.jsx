import React from 'react';

const FooterColumn = ({ title, links }) => (
  <div className="space-y-6">
    <h3 className="text-[10px] font-black text-gray-400 tracking-[0.25em] uppercase">{title}</h3>
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link}>
          <a href="#" className="text-[13px] font-bold text-gray-600 hover:text-brand-primary-green transition-colors">{link}</a>
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
             <div className="flex items-center gap-2 opacity-40 grayscale hover:grayscale-0 transition-all cursor-pointer">
                <img src="/ss4_logo.jpg" alt="SS4" className="h-6" />
             </div>
             <ul className="space-y-4">
                {['About Us', 'SS4 For Schools', 'SS4 For Sponsors', 'Blog', 'Contact SS4', 'Careers', 'Press'].map(l => (
                    <li key={l}><a href="#" className="text-sm font-bold text-gray-500 hover:text-brand-primary-green">{l}</a></li>
                ))}
             </ul>
          </div>

          <FooterColumn 
            title="Secondary Schools"
            links={['School Rankings', 'Best Schools', 'Best Value Schools', 'Scholarships', 'Financial Aid']}
          />
          <FooterColumn 
            title="Junior Secondary"
            links={['JSS Rankings', 'Best Public Schools', 'Best Private Schools', 'Best Boarding Schools']}
          />

          <FooterColumn 
            title="Search Categories"
            links={['JSS', 'SSS', 'A-Levels', 'Scholarships', 'Study Resources']}
          />
        </div>

        <hr className="border-gray-100 mb-12" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex gap-6 text-gray-400">
            {/* Social Icons would go here */}
            {['Instagram', 'Facebook', 'Twitter', 'TikTok', 'YouTube'].map(s => (
                <a key={s} href="#" className="hover:text-brand-primary-green transition-colors">
                    <span className="text-xs font-bold uppercase">{s[0]}</span>
                </a>
            ))}
          </div>

          <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">
            © 2026 Niche.com Inc.
          </p>

          <div className="flex gap-4">
            <div className="h-10 w-32 bg-black rounded-lg flex items-center justify-center text-white text-[10px] font-bold">App Store</div>
            <div className="h-10 w-32 bg-black rounded-lg flex items-center justify-center text-white text-[10px] font-bold">Google Play</div>
          </div>
        </div>
      </div>
    </footer>
  );
};
