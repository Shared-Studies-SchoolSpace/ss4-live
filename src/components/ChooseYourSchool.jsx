import React from 'react';

export const ChooseYourSchool = () => {
  return (
    <section className="bg-white py-24 px-4 overflow-hidden relative">
      <div className="container mx-auto flex flex-col lg:flex-row items-center gap-16">
        {/* Left Side: Content */}
        <div className="w-full lg:w-1/2 space-y-8">
            <p className="text-xs font-bold tracking-[0.2em] text-brand-primary-green uppercase">Choose your school</p>
            <h2 className="text-4xl lg:text-5xl font-black text-brand-dark-green leading-tight">
                Everything you need to make your decision.
            </h2>
            <div className="w-32 h-1.5 bg-brand-primary-green rounded-full" />
            <p className="text-lg lg:text-xl text-gray-600 font-medium leading-relaxed max-w-lg">
                With the information you care about on every school in Nigeria, we make it easy for you to compare schools and Secondary Schools to make your decision.
            </p>
            
            <div className="flex flex-col gap-4 pt-4">
                <a href="#" className="inline-block text-xl font-black text-brand-primary-green hover:text-brand-dark-green transition-colors border-b-4 border-brand-primary-green/20 hover:border-brand-primary-green pb-1">
                    Compare K-12 Schools
                </a>
                <a href="#" className="inline-block text-xl font-black text-brand-primary-green hover:text-brand-dark-green transition-colors border-b-4 border-brand-primary-green/20 hover:border-brand-primary-green pb-1">
                    Compare Secondary Schools
                </a>
            </div>
        </div>

        {/* Right Side: Interactive Placeholders */}
        <div className="w-full lg:w-1/2 flex gap-4">
            <div className="flex-1 aspect-[3/4] bg-blue-100/50 rounded-2xl border-4 border-dashed border-blue-200 flex flex-col items-center justify-center p-8 text-center group cursor-pointer hover:bg-blue-100 transition-all">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-blue-400 text-2xl font-bold">+</span>
                </div>
                <p className="text-sm font-bold text-blue-400 uppercase tracking-widest">Add a School</p>
            </div>
            <div className="flex-1 aspect-[3/4] bg-blue-100/30 rounded-2xl border-4 border-dashed border-blue-100 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center mb-4">
                    <span className="text-blue-200 text-2xl font-bold">+</span>
                </div>
                <p className="text-sm font-bold text-blue-200 uppercase tracking-widest">Add a School</p>
            </div>
        </div>
      </div>
      
      {/* Decorative Stamp */}
      <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 w-48 h-48 lg:w-64 lg:h-64 opacity-10 pointer-events-none">
          <img src="/home/stamp-everything.svg" className="w-full h-full rotate-12" />
      </div>

      {/* Bottom Wave transition */}
      <div className="absolute -bottom-1 left-0 w-full h-16 text-brand-dark-green fill-current">
        <svg viewBox="0 0 1440 320" className="w-full h-full">
            <path d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,186.7C960,192,1056,160,1152,144C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
};
