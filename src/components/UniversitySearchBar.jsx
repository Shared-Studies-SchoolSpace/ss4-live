import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useState, useEffect, useRef } from 'react';
import Button from './Button';
import { nigeriaStates, nigeriaLgas } from '../data/nigeria-states-lga';

export default function UniversitySearchBar({ onSearch, onClear }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedLga, setSelectedLga] = useState([]);
  const [availableLgas, setAvailableLgas] = useState([]);
  const [isLgaDropdownOpen, setIsLgaDropdownOpen] = useState(false);
  
  const lgaDropdownRef = useRef(null);

  useEffect(() => {
    if (selectedState) {
      setAvailableLgas(nigeriaLgas[selectedState] || []);
    } else {
      setAvailableLgas([]);
    }
    setSelectedLga([]);
    setIsLgaDropdownOpen(false);
  }, [selectedState]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (lgaDropdownRef.current && !lgaDropdownRef.current.contains(event.target)) {
        setIsLgaDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleApply = () => {
    onSearch({
      name: searchTerm,
      state: selectedState,
      lga: selectedLga
    });
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedState('');
    setSelectedLga([]);
    onClear();
  };

  return (
    <div className="w-full mb-8 space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white border border-gray-200 shadow-sm rounded-2xl px-6 py-4 focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all">
        <span className="text-brand-primary flex items-center">
          <SearchIcon sx={{ fontSize: 24 }} />
        </span>
        <input
          type="text"
          placeholder="Search schools by name..."
          className="bg-transparent text-[#111111] font-medium placeholder:text-gray-400 w-full outline-none text-sm md:text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* State Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 bg-white border border-gray-400 rounded-2xl px-4 sm:px-6 py-3 focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all">
          <span className="text-brand-accent hidden sm:flex items-center">
            <LocationOnIcon sx={{ fontSize: 20 }} />
          </span>
          <select
            className="bg-transparent text-[#111111] font-medium w-full outline-none text-sm appearance-none cursor-pointer"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            <option value="">Select State</option>
            {nigeriaStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* LGA Dropdown */}
        <div 
          ref={lgaDropdownRef}
          className={`relative flex items-center gap-2 sm:gap-3 bg-white border border-gray-400 rounded-2xl px-4 sm:px-6 py-3 transition-all ${selectedState ? 'cursor-pointer hover:border-brand-primary/50' : 'opacity-70 cursor-not-allowed'}`}
          onClick={() => { if (selectedState) setIsLgaDropdownOpen(!isLgaDropdownOpen); }}
        >
          <span className="text-brand-accent hidden sm:flex items-center">
            <LocationOnIcon sx={{ fontSize: 20 }} />
          </span>
          <div className="flex-1 text-[#111111] font-medium text-sm truncate select-none">
            {selectedLga.length === 0 ? 'Select LGA' : selectedLga.join(', ')}
          </div>
          
          {/* Dropdown Menu */}
          {isLgaDropdownOpen && selectedState && (
            <div 
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 shadow-xl rounded-xl z-50 max-h-60 overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              {availableLgas.map((lga) => (
                <label key={lga} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                    checked={selectedLga.includes(lga)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedLga([...selectedLga, lga]);
                      } else {
                        setSelectedLga(selectedLga.filter(item => item !== lga));
                      }
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700 truncate">{lga}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-row items-center gap-3 pt-2">
        <Button 
          variant="primary" 
          className="flex-1 md:flex-none md:w-auto px-6 py-3 rounded-xl shadow-md font-bold text-sm md:text-base"
          onClick={handleApply}
        >
          Apply Filters
        </Button>
        <button 
          className="text-sm font-bold text-gray-500 hover:text-brand-accent transition-colors py-2 px-4 whitespace-nowrap"
          onClick={handleClear}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
