export default function Card({ icon, title, children }) {
  return (
    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-md transform hover:scale-110 transition-transform duration-300 ease-in-out cursor-pointer group">
      <div className="w-12 h-12 bg-[#F6F4F0] text-[#26844D] rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#111111] mb-2">
        {title}
      </h3>
      <p className="text-[#111111] leading-relaxed">
        {children}
      </p>
    </div>
  );
}
