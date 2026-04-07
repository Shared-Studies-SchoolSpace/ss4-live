import React, { useState } from 'react';

const Card = ({ title, children, className = "" }) => (
  <div className={`bg-white p-6 shadow-xl rounded-xl border border-gray-100 ${className}`}>
    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">{title}</h4>
    {children}
  </div>
);

export const StayOnTrack = () => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section className="relative bg-brand-dark-green py-24 px-4 overflow-hidden">
      <div className="container mx-auto flex flex-col lg:flex-row items-center gap-20">
        {/* Mockup Animation Area */}
        <div className="w-full lg:w-1/2 relative min-h-[400px] bg-emerald-900/40 rounded-[3rem] p-8">
          <div className={`space-y-6 max-w-sm mx-auto ${isPaused ? '' : 'animate-pulse'}`}>
             <Card title="Location">
                <div className="w-full p-3 bg-gray-50 rounded-lg flex items-center gap-3 border border-gray-200">
                    <div className="w-4 h-4 rounded-full border-2 border-brand-primary-green" />
                    <div className="w-full h-2 bg-gray-200 rounded" />
                </div>
             </Card>
             <Card title="School Cost (Net Price)">
                <div className="relative pt-6">
                    <div className="w-full h-1.5 bg-brand-bg-cream rounded-full overflow-hidden">
                        <div className="w-1/2 h-full bg-brand-primary-green" />
                    </div>
                    <div className="absolute top-4 left-1/2 w-4 h-4 bg-brand-primary-green rounded-full shadow-lg -translate-x-1/2" />
                </div>
             </Card>
             <Card title="School Size">
                <div className="flex gap-3">
                    {['Small', 'Medium', 'Large'].map((size) => (
                        <div key={size} className={`flex-1 p-2 text-center text-[10px] font-bold rounded border ${size === 'Medium' ? 'bg-brand-primary-green text-white border-brand-primary-green' : 'border-gray-200 text-gray-400'}`}>
                            {size}
                        </div>
                    ))}
                </div>
             </Card>
          </div>

          <button 
            onClick={() => setIsPaused(!isPaused)}
            className="absolute bottom-8 left-8 flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold transition-all"
          >
            {isPaused ? '▶ Play' : '‖ Pause'}
          </button>
          
          <div className="absolute top-10 right-10 w-24 h-24 bg-brand-primary-green rounded-full blur-3xl opacity-30" />
        </div>

        {/* Content Side */}
        <div className="w-full lg:w-1/2 text-white space-y-8">
            <p className="text-xs font-bold tracking-[0.2em] opacity-60 uppercase">Stay on track</p>
            <h2 className="text-4xl lg:text-6xl font-black leading-[1.1]">
                Tools to organize your school search.
            </h2>
            <div className="w-24 h-1.5 bg-brand-primary-green rounded-full" />
            <p className="text-lg lg:text-xl font-medium opacity-80 leading-relaxed max-w-xl">
                We'll help you build your list, track your progress and get new recommendations as your search narrows.
            </p>
            <a 
                href="#" 
                className="inline-block text-xl font-black border-b-4 border-brand-primary-green pb-1 shadow-none hover:text-brand-primary-green hover:border-white transition-all"
            >
                Start Exploring
            </a>
        </div>
      </div>

       {/* Top Wave transition */}
       <div className="absolute top-0 left-0 w-full h-12 text-brand-bg-cream fill-current transform rotate-180">
        <svg viewBox="0 0 1440 320" className="w-full h-full">
            <path d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,186.7C960,192,1056,160,1152,144C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
};
