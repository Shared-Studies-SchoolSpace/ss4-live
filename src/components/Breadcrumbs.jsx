import ChevronRightIcon from '@mui/icons-material/ChevronRight';


export default function Breadcrumbs() {
  return (
    <div className="px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <a className="text-gray-500 hover:text-[#26844D] font-medium transition-colors" href="/universities">Partner Schools</a>
        <span className="text-gray-300"><ChevronRightIcon fontSize="small"/></span>
        <a className="text-[#111111] hover:text-[#26844D] font-medium transition-colors" href="#">King's College</a>
      </div>
    </div>
  );
}
