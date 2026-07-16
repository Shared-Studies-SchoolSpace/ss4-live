import React from 'react';

export default function NewsCard({ 
  tag, 
  title, 
  desc, 
  date, 
  author = "Administrator",
  image, 
  gradient, 
  colSpan = "col-span-1",
  isHero = false
}) {
  const backdropStyle = image 
    ? { backgroundImage: `url(${image})` } 
    : {};

  return (
    <div className={`relative overflow-hidden rounded-3xl varsity-card group cursor-pointer flex flex-col justify-end min-h-[360px] ${colSpan} transition-all duration-300`}>
      {image ? (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
            style={backdropStyle}
          />
          {/* Rich overlay for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/95 via-[#111111]/40 to-transparent"></div>
        </>
      ) : (
        <>
          {/* Solid/gradient colored background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${
            gradient === "orange" 
              ? "from-[#E8640A] to-[#E8640A]/70" 
              : "from-[#1A56C4] to-[#1A56C4]/70"
          }`} />
          {/* Subtle vector grid overlay */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,50 C30,80 70,20 100,50 L100,100 L0,100 Z" fill="#FFFFFF"></path>
            </svg>
          </div>
        </>
      )}

      {/* Card Content */}
      <div className="relative p-6 sm:p-8 z-10 text-white flex flex-col justify-end">
        <div>
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
            image 
              ? "bg-[#E8640A] text-white" 
              : "bg-white text-[#1A56C4]"
          }`}>
            {tag}
          </span>
        </div>
        
        <h3 className={`font-space font-black mt-4 leading-tight text-white ${
          isHero ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"
        }`}>
          {title}
        </h3>
        
        <p className={`text-gray-300 mt-2 font-medium leading-relaxed line-clamp-3 ${
          isHero ? "text-sm max-w-xl" : "text-xs"
        }`}>
          {desc}
        </p>

        <div className={`flex items-center gap-2.5 mt-5 pt-4 border-t ${
          image ? "border-white/10 text-gray-400" : "border-white/15 text-blue-200"
        } text-[10px] font-bold uppercase tracking-wider`}>
          <span>{author}</span>
          <span>&bull;</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
}
