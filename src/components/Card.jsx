export default function Card({ icon, title, children }) {
  return (
    <div className="varsity-card p-6 cursor-pointer group">
      <div className="w-12 h-12 bg-white border border-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-space font-extrabold text-[#111111] mb-2">
        {title}
      </h3>
      <p className="text-[0.875rem] font-avenir text-gray-600 leading-relaxed">
        {children}
      </p>
    </div>
  );
}
