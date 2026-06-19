import UniversityListHeader from "../components/UniversityListHeader";
import UniversitySearchBar from "../components/UniversitySearchBar";
import UniversityCard from "../components/UniversityCard";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import tertiaryData from "../data/tertiary.json";

export default function TertiaryPage() {
  const [allSchools] = useState(tertiaryData);
  const [filteredSchools, setFilteredSchools] = useState(tertiaryData);
  const navigate = useNavigate();

  const handleSearch = ({ name, state, lga }) => {
    let filtered = allSchools;

    if (name) {
      const lowerName = name.toLowerCase();
      filtered = filtered.filter(s => s.name.toLowerCase().includes(lowerName) || s.abbreviation.toLowerCase().includes(lowerName));
    }

    if (state) {
      const lowerState = state.toLowerCase();
      filtered = filtered.filter(s => s.state.toLowerCase() === lowerState);
    }

    if (lga && (Array.isArray(lga) ? lga.length > 0 : lga)) {
      const lgas = Array.isArray(lga) ? lga.map(l => l.toLowerCase()) : [lga.toLowerCase()];
      filtered = filtered.filter(s => lgas.some(l => s.location.toLowerCase().includes(l)));
    }

    setFilteredSchools(filtered);
  };

  const handleClear = () => {
    setFilteredSchools(allSchools);
  };

  const gotoSchool = (s) => {
    navigate(`/tertiary/${s.id}`, { state: { school: s } });
  };

  return (
    <div className="w-full bg-brand-bg-cream min-h-screen">
      <main className="px-6 md:px-12 lg:px-16 py-12 max-w-[1600px] mx-auto">
        <UniversityListHeader 
          title="Tertiary Institutions"
          description="Explore leading universities, polytechnics, and colleges within the SS4 network."
          buttonLabel="Register Tertiary Institution"
        />
        
        <div className="mt-8">
          <div className="max-w-4xl">
            <UniversitySearchBar 
              onSearch={handleSearch} 
              onClear={handleClear} 
              placeholder="Search universities by name or abbreviation..."
            />

            <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-500 font-medium">
                  Showing <span className="text-brand-primary font-bold">{filteredSchools.length}</span> of <span className="text-brand-primary font-bold">{allSchools.length}</span> institutions
                </p>
            </div>

            {/* Grid of schools */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredSchools.map((s) => (
                <UniversityCard
                  key={s.id}
                  name={s.name}
                  type={s.type}
                  location={`${s.location}, ${s.state.toUpperCase()}`}
                  address={s.location}
                  bio={s.bio}
                  image="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800"
                  verified={s.verified}
                  onClicked={() => gotoSchool(s)}
                />
              ))}
            </div>

            {filteredSchools.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500 font-medium">No institutions found matching your criteria.</p>
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
