export default function CourseCard({ title, description }) {
  return (
    <div className="group flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden cursor-pointer hover:border-[#26844D] hover:shadow-md transition-all">
      <div className="h-24 bg-[#F6F4F0] flex items-center justify-center border-b border-gray-100">
        <span className="text-[#26844D] font-bold tracking-[0.2em] text-xs uppercase opacity-80">SAS Module</span>
      </div>

      <div className="p-5 flex flex-col">
        <h4 className="text-[#111111] font-bold text-lg group-hover:text-[#26844D] mb-2 transition-colors">
          {title}
        </h4>

        <p className="text-gray-500 text-sm mb-2 line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  );
}
