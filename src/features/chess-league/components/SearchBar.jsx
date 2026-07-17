import React, { useState, useEffect, useRef } from 'react';

export const SearchBar = ({ allPlayers, onPlayerSelect, onFullSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = allPlayers.filter(p => 
        p.name.toLowerCase().startsWith(query.toLowerCase()) || 
        p.username.toLowerCase().startsWith(query.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, allPlayers]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchClick = () => {
    const results = allPlayers.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.username.toLowerCase().includes(query.toLowerCase())
    );
    onFullSearch(results);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="flex items-center bg-white rounded-full border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <input
          type="text"
          placeholder="Search players..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 0 && setShowSuggestions(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
          className="flex-grow px-5 py-2.5 text-sm text-[#111111] bg-transparent outline-none placeholder-gray-400"
        />
        <button 
          className="p-3 mr-1 text-gray-400 hover:text-brand-primary transition-colors cursor-pointer"
          onClick={handleSearchClick}
          aria-label="Submit search"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-[105%] left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden mt-1 max-h-60 overflow-y-auto">
          {suggestions.map((p, idx) => (
            <div 
              key={idx} 
              className="px-5 py-3 hover:bg-brand-bg-cream transition-colors cursor-pointer flex flex-col border-b border-gray-50 last:border-0"
              onClick={() => {
                onPlayerSelect(p);
                setQuery('');
                setShowSuggestions(false);
              }}
            >
              <span className="text-sm font-bold text-[#111111]">{p.name}</span>
              <span className="text-xs font-semibold text-brand-primary">@{p.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
