import ChevronRightIcon from '@mui/icons-material/ChevronRight';


export default function Breadcrumbs() {
  return (
    <div className="px-6 py-4 border-b border-[#283039] bg-[#111418] sticky top-0 z-10">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <a className="text-[#9dabb9] hover:text-white font-medium" href="#">Universities</a>
        <span><ChevronRightIcon/></span>
        <a className="text-[#9dabb9] hover:text-white font-medium" href="#">MIT</a>
        <span ><ChevronRightIcon/></span>
        {/* <a className="text-[#9dabb9] hover:text-white font-medium" href="#">Science</a>
        <span><ChevronRightIcon/></span>
        <span className="text-white font-bold bg-[#137fec33] px-2 py-0.5 rounded text-xs uppercase tracking-wide">Physics</span> */}
      </div>
    </div>
  );
}
