import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useState } from 'react';

const categories = ['All Schools', 'Secondary Schools', 'A-Levels', 'JSS', 'SSS'];

export default function UniversitySearchBar() {
  const [activeCategory, setActiveCategory] = useState('All Schools');

  return (
    <div className="w-full mb-8 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Name Search */}
        <div className="flex-1 flex items-center bg-white border border-gray-200 shadow-sm rounded-xl px-4 h-12 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all cursor-text">
          <span className="text-gray-400 mr-2"><SearchIcon/></span>
          <input
            type="text"
            placeholder="Search schools by name..."
            className="bg-transparent text-[#111111] placeholder:text-gray-400 w-full outline-none"
          />
        </div>

        {/* State Search */}
        <div className="flex-1 flex items-center bg-white border border-gray-200 shadow-sm rounded-xl px-4 h-12 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all cursor-text">
          <span className="text-gray-400 mr-2"><LocationOnIcon/></span>
          <input
            type="text"
            placeholder="Search by state (e.g. Lagos, Abuja)..."
            className="bg-transparent text-[#111111] placeholder:text-gray-400 w-full outline-none"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              activeCategory === cat 
                ? 'bg-brand-primary text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
