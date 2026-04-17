import UniversityListHeader from "../components/UniversityListHeader";
import UniversitySearchBar from "../components/UniversitySearchBar";
import UniversityCard from "../components/UniversityCard";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const INITIAL_UNIVERSITIES = [
  {
    name: "King's College",
    type: "secondary school",
    location: "Lagos, NG",
    address: "3 Adeyemo Alakija St, Victoria Island, Lagos",
    resources: 5,
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/Kings_College_Lagos_Logo.png/220px-Kings_College_Lagos_Logo.png",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800",
    bio: "An institution of high repute, King's College has been raising leaders of thought since 1909.",
    verified: true,
  },
  {
    name: "Queen's College",
    type: "secondary school",
    location: "Lagos, NG",
    address: "P.M.B. 12596, Yaba, Lagos",
    resources: 5,
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/c/ca/Queens_College_Lagos_Logo.png/220px-Queens_College_Lagos_Logo.png",
    image: "https://images.unsplash.com/photo-1546410531-bb4caaef2021?auto=format&fit=crop&q=80&w=800",
    bio: "Africa's premier female institution, dedicated to nurturing excellent young women.",
    verified: true,
  },
  {
    name: "Christ the King College",
    type: "secondary school",
    location: "Anambra, NG",
    address: "CKC Close, Oguta Road, Onitsha, Anambra",
    resources: 5,
    logo: "https://upload.wikimedia.org/wikipedia/en/7/75/CKCOnitshaLogo.png",
    image: "https://images.unsplash.com/photo-1592285338270-0775ef7530f6?auto=format&fit=crop&q=80&w=800",
    bio: "Winner of the 1977 World Secondary School Football Championship, CKC Onitsha combines athletics with rigorous academics.",
    verified: true,
  },
  {
    name: "Loyola Jesuit College",
    type: "secondary school",
    location: "FCT - Abuja, NG",
    address: "Karshi-Jikwoyi Road, Gidan Mangoro, Abuja",
    resources: 5,
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Loyola_Jesuit_College_logo.svg/220px-Loyola_Jesuit_College_logo.svg.png",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
    bio: "A co-educational boarding school providing a global standard of education in the heart of Nigeria.",
    verified: true,
  },
];

export default function UniversitiesPage() {
  const [filteredUniversities, setFilteredUniversities] = useState(INITIAL_UNIVERSITIES);
  const navigate = useNavigate();

  const handleSearch = ({ name, state, lga }) => {
    const filtered = INITIAL_UNIVERSITIES.filter(u => {
      const matchesName = !name || u.name.toLowerCase().includes(name.toLowerCase());
      const matchesState = !state || u.location.toLowerCase().includes(state.toLowerCase());
      const matchesLga = !lga || (Array.isArray(lga) ? (lga.length === 0 || lga.some(l => u.address.toLowerCase().includes(l.toLowerCase()))) : u.address.toLowerCase().includes(lga.toLowerCase()));
      return matchesName && matchesState && matchesLga;
    });
    setFilteredUniversities(filtered);
  };

  const handleClear = () => {
    setFilteredUniversities(INITIAL_UNIVERSITIES);
  };

  // Navigate to school profile
  const gotoMit = () => {
    navigate("/school/1");
  };

  return (
    <div className="w-full bg-brand-bg-cream min-h-screen">
      <main className="px-6 md:px-12 lg:px-16 py-12 max-w-[1600px] mx-auto">
        <UniversityListHeader />
        
        <div className="mt-8">
          {/* Main Content Area */}
          <div className="max-w-4xl">
            <UniversitySearchBar onSearch={handleSearch} onClear={handleClear} />

            <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-500 font-medium">
                  Showing <span className="text-brand-primary font-bold">{filteredUniversities.length}</span> schools
                </p>
            </div>

            {/* Grid of universities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredUniversities.map((u, index) => (
                <UniversityCard
                  key={index}
                  name={u.name}
                  type={u.type}
                  location={u.location}
                  address={u.address}
                  bio={u.bio}
                  image={u.image}
                  resources={u.resources}
                  logo={u.logo}
                  verified={u.verified}
                  onClicked={gotoMit}
                />
              ))}
            </div>
            {filteredUniversities.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500 font-medium">No schools found matching your criteria.</p>
                <button 
                  onClick={handleClear}
                  className="mt-4 text-brand-primary font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
