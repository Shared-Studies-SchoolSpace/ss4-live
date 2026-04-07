import Navbar from "../components/Navbar";
import UniversityListHeader from "../components/UniversityListHeader";
import UniversitySearchBar from "../components/UniversitySearchBar";
import UniversityCard from "../components/UniversityCard";
import { useNavigate } from "react-router-dom";
export default function UniversitiesPage() {
  const universities = [
    {
      name: "King's College",
      type: "secondary school",
      location: "Lagos, NG",
      resources: 5,
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Kings_College_Lagos_Logo.png/220px-Kings_College_Lagos_Logo.png",
      verified: true,
    },
    {
      name: "Queen's College",
      type: "secondary school",
      location: "Lagos, NG",
      resources: 5,
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/c/ca/Queens_College_Lagos_Logo.png/220px-Queens_College_Lagos_Logo.png",
      verified: true,
    },
    {
      name: "Christ the King College",
      type: "secondary school",
      location: "Onitsha, NG",
      resources: 5,
      logo: "https://upload.wikimedia.org/wikipedia/en/7/75/CKCOnitshaLogo.png",
      verified: true,
    },
    {
      name: "Loyola Jesuit College",
      type: "secondary school",
      location: "Abuja, NG",
      resources: 5,
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Loyola_Jesuit_College_logo.svg/220px-Loyola_Jesuit_College_logo.svg.png",
      verified: true,
    },
  ];
  const navigate = useNavigate();

  // Navigate to school profile
  const gotoMit = () => {
    navigate("/school");
  };
  return (
    <div className="bg-[#F6F4F0] min-h-screen text-[#111111]">
      <Navbar />

      <main className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto">
        <UniversityListHeader />
        <UniversitySearchBar />

        {/* Grid of universities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {universities.map((u, index) => (
            <UniversityCard
              key={index}
              name={u.name}
              type={u.type}
              location={u.location}
              resources={u.resources}
              logo={u.logo}
              verified={u.verified}
              onClicked={gotoMit}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
