import React from 'react';

export const DirectAdmissions = () => {
  return (
    <section className="bg-brand-bg-cream py-20 px-4">
      <div className="container mx-auto flex flex-col lg:flex-row items-center gap-16">
        {/* Text Content */}
        <div className="w-full lg:w-1/2 space-y-8">
          <img src="/direct-admissions-logo.webp" alt="Niche Direct Admissions" className="h-16" />
          
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-brand-dark-green">
            Get accepted without an application.
          </h2>
          
          <p className="text-lg text-brand-dark-green/80 max-w-lg leading-relaxed">
            No application. No waiting. With Direct Admissions, colleges can accept you based on the information in your Niche Profile.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button className="px-8 py-4 bg-brand-dark-green text-white font-bold rounded shadow-lg hover:bg-brand-primary-green transition-colors">
              Create a Niche Profile
            </button>
            <button className="px-8 py-4 border-2 border-brand-dark-green text-brand-dark-green font-bold rounded hover:bg-brand-dark-green hover:text-white transition-all">
              Learn more
            </button>
          </div>
        </div>

        {/* Graphic Area */}
        <div className="w-full lg:w-1/2 relative bg-white/50 rounded-3xl p-8 shadow-inner border border-white">
          <div className="relative z-10">
            {/* Minimal Phone Mockup wrapper */}
            <div className="max-w-[300px] mx-auto bg-white rounded-[3rem] border-8 border-gray-100 shadow-2xl p-6 space-y-4">
               <div className="flex items-center gap-4 border-b pb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                  <div className="space-y-2">
                    <div className="w-24 h-3 bg-gray-200 rounded" />
                    <div className="w-16 h-2 bg-gray-100 rounded" />
                  </div>
               </div>
               <div className="space-y-3">
                  {['INTERESTED IN ENGINEERING', 'DETROIT, MICHIGAN', '2.75 GPA'].map((tag) => (
                    <div key={tag} className="px-4 py-2 bg-yellow-700/80 text-white text-[10px] font-bold rounded-lg tracking-widest text-center shadow-sm">
                      {tag}
                    </div>
                  ))}
               </div>
            </div>
            
            {/* Circular images decoration */}
            <div className="absolute -top-10 -right-10 w-24 h-24 lg:w-32 lg:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden hidden lg:block">
              <img src="/home/logo-phillips-andover.png" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-20 -right-16 w-24 h-24 lg:w-32 lg:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden hidden lg:block">
              <img src="/home/logo-oregon.png" className="w-full h-full object-cover" />
            </div>
             <div className="absolute bottom-10 -right-4 w-24 h-24 lg:w-32 lg:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden hidden lg:block">
              <img src="/home/logo-marquette.png" className="w-full h-full object-cover" />
            </div>

            {/* Decorative arrows would go here in CSS/SVG */}
          </div>
        </div>
      </div>
    </section>
  );
};
