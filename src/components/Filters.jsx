import SearchIcon from '@mui/icons-material/Search';


export default function Filters() {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <label className="flex flex-col w-full h-12 relative cursor-text group">
        <div className="flex w-full items-stretch rounded-xl h-full bg-white border border-gray-200 shadow-sm group-focus-within:border-brand-primary group-focus-within:ring-2 group-focus-within:ring-brand-primary/20 transition-all">
          <div className="text-gray-400 flex items-center justify-center pl-4 pr-2">
            <span><SearchIcon/></span>
          </div>
          <input
            className="w-full bg-transparent text-[#111111] placeholder:text-gray-400 border-none outline-none"
            placeholder="Search for SAS subjects..."
          />
        </div>
      </label>
    </div>
  );
}
