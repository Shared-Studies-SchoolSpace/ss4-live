import ChevronRightIcon from '@mui/icons-material/ChevronRight';


export default function Breadcrumbs({ parentLabel = "Schools", parentHref = "/schools", currentLabel = "King's College" }) {
  return (
    <div className="px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <a className="text-gray-500 hover:text-brand-primary font-medium transition-colors" href={parentHref}>{parentLabel}</a>
        <span className="text-gray-300"><ChevronRightIcon fontSize="small"/></span>
        <span className="text-[#111111] font-medium">{currentLabel}</span>
      </div>
    </div>
  );
}
