import React from 'react';

export const Hero = () => {
  return (
    <section className="relative flex flex-col lg:flex-row min-h-[600px] bg-brand-dark-green overflow-hidden">
      {/* Left Side: Image */}
      <div className="relative w-full lg:w-1/2 h-[300px] lg:h-auto">
        <img 
          src="/home/hero-lg.webp" 
          alt="Students learning" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Wave Overlay */}
        <div className="absolute bottom-0 left-0 w-full h-12 lg:hidden bg-brand-dark-green wave-top transform rotate-180" />
      </div>

      {/* Right Side: Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-20 text-white">
        <div className="max-w-lg">
          <h2 className="text-xs lg:text-sm font-bold tracking-[0.2em] mb-6 opacity-80 uppercase">
            Find the school
          </h2>
          <h1 className="text-4xl lg:text-6xl font-black leading-tight mb-8">
            THAT FITS YOU BEST
          </h1>
          
          <div className="w-24 h-1 bg-brand-primary-green mb-8 rounded-full" />
          
          <p className="text-lg lg:text-xl mb-12 font-medium opacity-90 leading-relaxed">
            Finding the right school shouldn't be hard. From K-12 to college to grad school, we make it easy to discover and connect with the best ones for you.
          </p>

          <div className="space-y-6">
            <h3 className="text-xs font-bold tracking-widest uppercase opacity-80">
              Start your search
            </h3>
            <div className="flex flex-wrap gap-4">
              {['K-12 Schools', 'Colleges', 'Grad Schools'].map((cat) => (
                <button 
                  key={cat}
                  className="px-8 py-4 bg-brand-primary-green hover:bg-emerald-700 text-white font-bold rounded shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave bottom decoration */}
      <div className="absolute -bottom-1 left-0 w-full h-16 text-brand-bg-cream fill-current">
        <svg viewBox="0 0 1440 320" className="w-full h-full preserve-3d">
            <path d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,186.7C960,192,1056,160,1152,144C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
};
