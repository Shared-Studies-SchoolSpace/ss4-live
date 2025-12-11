export default function CourseCard({ title, description }) {
  return (
    <div className="group flex flex-col rounded-xl border border-[#283039] bg-[#181b21] overflow-hidden cursor-pointer hover:border-[#137fec] transition-all">
      <div className="h-32 bg-[#111418]"></div>

      <div className="p-4 flex flex-col">
        <h4 className="text-white font-bold group-hover:text-[#137fec] mb-2">
          {title}
        </h4>

        <p className="text-[#9dabb9] text-sm mb-4 line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  );
}
