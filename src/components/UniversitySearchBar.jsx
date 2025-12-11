export default function UniversitySearchBar() {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center bg-[#181b21] border border-[#283039] rounded-xl px-4 h-12 w-full">
        <span className="material-icons text-[#9dabb9] mr-2">search</span>
        <input
          type="text"
          placeholder="Search universities..."
          className="bg-transparent text-white placeholder:text-[#9dabb9] w-full outline-none"
        />
      </div>
    </div>
  );
}
