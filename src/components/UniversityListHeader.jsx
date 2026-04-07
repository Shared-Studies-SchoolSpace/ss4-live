import { useNavigate } from "react-router-dom";
export default function UniversityListHeader() {
  const navigate = useNavigate();
  const gotoCreateUniversity = () => {
    navigate("/create-university");
  };
  return (
    <div>
      <div className="mb-6 flex justify-between text-center items-center">
        <h1 className="text-[#111111] text-4xl font-black mb-2">Partner Schools</h1>
        <button className="bg-white border border-gray-200 shadow-sm text-[#111111] px-4 py-2 rounded-full text-sm hover:bg-[#F6F4F0] font-bold transition-colors"
        onClick={gotoCreateUniversity}>
          Apply to Partner
        </button>
      </div>
      <p className="text-gray-600">
        Browse all partner secondary schools in the Shared Studies assessment network.
      </p>
    </div>
  );
}
