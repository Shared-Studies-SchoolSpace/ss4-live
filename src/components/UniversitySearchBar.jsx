import SearchIcon from '@mui/icons-material/Search';

export default function UniversitySearchBar() {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center bg-white border border-gray-200 shadow-sm rounded-xl px-4 h-12 w-full focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all cursor-text">
        <span className="text-gray-400 mr-2"><SearchIcon/></span>
        <input
          type="text"
          placeholder="Search partner schools by name or state..."
          className="bg-transparent text-[#111111] placeholder:text-gray-400 w-full outline-none"
        />
      </div>
    </div>
  );
}
