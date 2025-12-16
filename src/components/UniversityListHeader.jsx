import { useNavigate } from "react-router-dom";
export default function UniversityListHeader() {
  const navigate = useNavigate();
  const gotoCreateUniversity = () => {
    navigate("/create-university");
  };
  return (
    <div>
      <div className="mb-6 flex justify-between text-center items-center">
        <h1 className="text-white text-3xl font-bold mb-2">Universities</h1>
        <button className="border border-white px-3 py-2 rounded-full text-sm hover:bg-gray-600"
        onClick={gotoCreateUniversity}>
          Create
        </button>
      </div>
      <p className="text-[#9dabb9]">
        Browse all available schools and institutions.
      </p>
    </div>
  );
}
