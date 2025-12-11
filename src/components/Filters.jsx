import SearchIcon from '@mui/icons-material/Search';


export default function Filters() {
  return (
    <div className="flex flex-col gap-4 mb-8">
      <label className="flex flex-col w-full h-12">
        <div className="flex w-full items-stretch rounded-xl h-full bg-[#181b21] border border-[#283039]">
          <div className="text-[#9dabb9] flex items-center justify-center pl-4 pr-2">
            <span><SearchIcon/></span>
          </div>
          <input
            className="w-full bg-transparent text-white placeholder:text-[#9dabb9] border-none outline-none"
            placeholder="Search for courses..."
          />
        </div>
      </label>
    </div>
  );
}
