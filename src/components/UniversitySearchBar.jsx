import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useState, useEffect } from 'react';
import Button from './Button';
import { nigeriaStates, nigeriaLgas } from '../data/nigeria-states-lga';

export default function UniversitySearchBar({ onSearch, onClear }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedLga, setSelectedLga] = useState('');
  const [availableLgas, setAvailableLgas] = useState([]);

  useEffect(() => {
    if (selectedState) {
      setAvailableLgas(nigeriaLgas[selectedState] || []);
    } else {
      setAvailableLgas([]);
    }
    setSelectedLga('');
  }, [selectedState]);

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
    setSelectedLga('');
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* State Dropdown */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 shadow-sm rounded-2xl px-6 py-3 focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all">
          <span className="text-brand-accent flex items-center">
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
        <div className="flex items-center gap-3 bg-white border border-gray-200 shadow-sm rounded-2xl px-6 py-3 focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all">
          <span className="text-brand-accent flex items-center">
            <LocationOnIcon sx={{ fontSize: 20 }} />
          </span>
          <select
            className="bg-transparent text-[#111111] font-medium w-full outline-none text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            value={selectedLga}
            onChange={(e) => setSelectedLga(e.target.value)}
            disabled={!selectedState}
          >
            <option value="">Select Local Government</option>
            {availableLgas.map((lga) => (
              <option key={lga} value={lga}>
                {lga}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row items-center gap-3 pt-2">
        <Button 
          variant="primary" 
          className="w-full md:w-auto px-8 py-3 rounded-xl shadow-md font-bold"
          onClick={handleApply}
        >
          Apply Filter
        </Button>
        <button 
          className="text-sm font-bold text-gray-400 hover:text-brand-accent transition-colors py-2 px-4"
          onClick={handleClear}
        >
          Clear Filter
        </button>
      </div>
    </div>
  );
}
