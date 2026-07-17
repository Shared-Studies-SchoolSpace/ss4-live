import React from 'react';

export const SearchResults = ({ results, onPlayerSelect, onClose }) => {
  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl font-black font-space text-[#111111]">Search Results ({results.length})</h2>
        <button 
          className="self-start text-sm font-bold text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-1 cursor-pointer" 
          onClick={onClose}
        >
          &larr; Back to League
        </button>
      </div>

      {results.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
          <p className="text-gray-500 font-medium">No players found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((p, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex items-center gap-4" 
              onClick={() => onPlayerSelect(p)}
            >
              <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary font-black flex items-center justify-center text-lg select-none">
                {p.name.charAt(0)}
              </div>
              <div className="flex-grow">
                <h3 className="text-base font-bold text-[#111111] leading-tight mb-1">{p.name}</h3>
                <a 
                  href={`https://www.chess.com/member/${p.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-brand-primary hover:text-brand-accent transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  @{p.username}
                </a>
              </div>
              <div className="text-right">
                <span className="block text-sm font-black text-brand-accent">{p.Pts} Pts</span>
                <span className="text-xs font-bold text-gray-400">{p.W}W / {p.L}L</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
