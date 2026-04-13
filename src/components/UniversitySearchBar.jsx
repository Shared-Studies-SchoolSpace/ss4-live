import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useState } from 'react';
import Button from './Button';

const categories = ['All Schools', 'Secondary Schools', 'A-Levels', 'JSS', 'SSS'];

export default function UniversitySearchBar({ onSearch, onToggleFilters }) {
  const [activeCategory, setActiveCategory] = useState('All Schools');

  return (
    <div className="w-full mb-8 space-y-6">
      <div className="flex flex-col md:flex-row items-stretch gap-0 bg-white border border-gray-200 shadow-lg rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all">
        {/* Name Search */}
        <div className="flex-[2] flex items-center px-6 py-4 border-b md:border-b-0 md:border-r border-gray-100">
          <span className="text-brand-primary mr-3 flex items-center"><SearchIcon sx={{ fontSize: 24 }}/></span>
          <input
            type="text"
            placeholder="Search schools by name..."
            className="bg-transparent text-[#111111] font-medium placeholder:text-gray-400 w-full outline-none text-sm md:text-base"
          />
        </div>

        {/* State Search */}
        <div className="flex-1 flex items-center px-6 py-4 border-b md:border-b-0 md:border-r border-gray-100">
          <span className="text-brand-accent mr-3 flex items-center"><LocationOnIcon sx={{ fontSize: 24 }}/></span>
          <input
            type="text"
            placeholder="State (e.g. Lagos)"
            className="bg-transparent text-[#111111] font-medium placeholder:text-gray-400 w-full outline-none text-sm md:text-base"
          />
        </div>
        
        <div className="flex items-center p-2 bg-gray-50 md:bg-white gap-2">
            <button 
                onClick={onToggleFilters}
                className="p-3 text-gray-500 hover:text-brand-primary hover:bg-gray-100 rounded-xl transition-colors md:hidden"
                title="Filters"
            >
                <FilterListIcon />
            </button>
            <Button variant="primary" className="w-full md:w-auto px-8 py-3 rounded-xl shadow-md">
                Find Schools
            </Button>
        </div>
      </div>

      {/* Categories - with horizontal scroll on mobile */}
      <div className="flex items-center gap-4">
        <span className="hidden md:block text-xs font-black uppercase tracking-wider text-gray-400">Quick Filters:</span>
        <div className="flex overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide md:flex-wrap gap-2 flex-1">
            {categories.map((cat) => (
            <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-[12px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                activeCategory === cat 
                    ? 'bg-brand-primary border-brand-primary text-white shadow-lg' 
                    : 'bg-white text-gray-500 border-gray-100 hover:border-brand-primary/30 active:bg-gray-50'
                }`}
            >
                {cat}
            </button>
            ))}
        </div>
      </div>
    </div>
  );
}
