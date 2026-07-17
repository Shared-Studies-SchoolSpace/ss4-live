import { useNavigate } from "react-router-dom";
export default function UniversityListHeader({ 
  title = "SS4 School Network",
  description = "Explore government-accredited secondary schools within the SS4 network.",
  buttonLabel = "Enhance school profile"
}) {
  const navigate = useNavigate();
  const gotoPartner = () => {
    navigate("/partner");
  };
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h1 className="text-[#111111] text-3xl md:text-4xl font-black">{title}</h1>
        <button className="w-full md:w-auto bg-white border border-gray-200 shadow-sm text-[#111111] px-6 py-2.5 rounded-full text-sm hover:bg-[#F6F4F0] font-bold transition-all active:scale-95 whitespace-nowrap"
        onClick={gotoPartner}>
          {buttonLabel}
        </button>
      </div>
      <p className="text-gray-600 text-sm md:text-base max-w-2xl leading-relaxed">
        {description}
      </p>
    </div>
  );
}
