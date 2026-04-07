import React from 'react';

export const Hero = () => {
  return (
    <section className="relative flex flex-col lg:flex-row min-h-[600px] bg-brand-primary overflow-hidden">
      {/* Left Side: Image */}
      <div className="relative w-full lg:w-1/2 h-[300px] lg:h-auto">
        <img 
          src="/home/hero-lg.webp" 
          alt="Students learning" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Wave Overlay */}
        <div className="absolute bottom-0 left-0 w-full h-12 lg:hidden bg-brand-primary wave-top transform rotate-180" />
      </div>

      {/* Right Side: Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-20 text-white">
        <div className="max-w-lg">
          <h2 className="text-xs lg:text-sm font-space font-bold tracking-[0.2em] mb-6 opacity-90 uppercase">
            An Institution for Assessment, Recognition, and Reward
          </h2>
          <h1 className="text-4xl lg:text-6xl font-space font-black leading-tight mb-8">
            RAISING THE STANDARD OF ACADEMIC EXCELLENCE
          </h1>
          
          <div className="w-24 h-1 bg-brand-accent mb-8 rounded-full" />
          
          <p className="text-white text-lg lg:text-xl font-medium mb-10 max-w-sm drop-shadow-md leading-snug">
            SS4 sets the benchmark for assessment, recognition, and reward. We connect the next generation of secondary school students with sponsors who invest in excellence.
          </p>

          <div className="space-y-6">
            <h3 className="text-xs font-bold tracking-widest uppercase opacity-80">
              Get Started
            </h3>
            <div className="flex gap-4 mb-6">
              <a
                href="/sas"
                className="px-8 py-3 rounded-full font-bold text-sm transition shadow-lg bg-brand-accent text-white hover:bg-[#c45608]"
              >
                Explore SAS
              </a>
              <a
                href="/partner"
                className="px-8 py-3 rounded-full font-bold text-sm transition shadow-sm bg-white text-[#111111] hover:bg-gray-100"
              >
                Partner With Us
              </a>
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
