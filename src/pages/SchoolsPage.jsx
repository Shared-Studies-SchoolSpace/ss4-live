import UniversityListHeader from "../components/UniversityListHeader";
import UniversitySearchBar from "../components/UniversitySearchBar";
import UniversityCard from "../components/UniversityCard";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";

// Helper to get all schools (initially just a few to avoid heavy load if not filtered)
// In a real app, we might fetch from an API or use pagination
const states = [
  "abia", "adamawa", "akwa_ibom", "anambra", "bauchi", "bayelsa", "benue", "borno", "cross_river", "delta",
  "ebonyi", "edo", "ekiti", "enugu", "fct", "gombe", "imo", "jigawa", "kaduna", "kano", "katsina", "kebbi", 
  "kogi", "kwara", "lagos", "nasarawa", "niger", "ogun", "ondo", "osun", "oyo", "plateau", "rivers", "sokoto", 
  "taraba", "yobe", "zamfara"
];

export default function SchoolsPage() {
  const [allSchools, setAllSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltered, setIsFiltered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const allData = await Promise.all(
          states.map(state => 
            import(`../data/schools/${state}.json`).then(m => m.default.map(s => ({
              ...s, 
              // Normalize state name for filtering
              state: state.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            })))
          )
        );
        const combined = allData.flat();
        setAllSchools(combined);
        setFilteredSchools(combined);
      } catch (error) {
        console.error("Failed to load schools data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleSearch = ({ name, state, lga }) => {
    // Mark as filtered if any filter is applied
    const hasFilters = !!(name || state || (Array.isArray(lga) ? lga.length > 0 : lga));
    setIsFiltered(hasFilters);
    
    let filtered = allSchools;

    if (name) {
      const lowerName = name.toLowerCase();
      filtered = filtered.filter(s => s.name.toLowerCase().includes(lowerName));
    }

    if (state) {
      const lowerState = state.toLowerCase();
      // Match against the normalized state name
      filtered = filtered.filter(s => s.state.toLowerCase() === lowerState);
    }

    if (lga && (Array.isArray(lga) ? lga.length > 0 : lga)) {
      const lgas = Array.isArray(lga) ? lga.map(l => l.toLowerCase()) : [lga.toLowerCase()];
      // CSV 'Location' field often contains LGA or city
      filtered = filtered.filter(s => lgas.some(l => s.location.toLowerCase().includes(l)));
    }

    setFilteredSchools(filtered);
  };

  const handleClear = () => {
    setIsFiltered(false);
    setFilteredSchools(allSchools);
  };

  // Navigate to school profile
  const gotoSchool = (id) => {
    navigate(`/school/${id}`);
  };

  // Show only 9 initially, show all matching when filtered
  const displayedSchools = useMemo(() => {
    if (!isFiltered) {
      return filteredSchools.slice(0, 9);
    }
    return filteredSchools;
  }, [filteredSchools, isFiltered]);

  return (
    <div className="w-full bg-brand-bg-cream min-h-screen">
      <main className="px-6 md:px-12 lg:px-16 py-12 max-w-[1600px] mx-auto">
        <UniversityListHeader />
        
        <div className="mt-8">
          <div className="max-w-4xl">
            <UniversitySearchBar onSearch={handleSearch} onClear={handleClear} />

            <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-500 font-medium">
                  {isLoading ? (
                    "Loading schools..."
                  ) : (
                    <>
                      Showing <span className="text-brand-primary font-bold">{Math.min(displayedSchools.length, filteredSchools.length)}</span> of <span className="text-brand-primary font-bold">{filteredSchools.length}</span> schools
                      {filteredSchools.length > displayedSchools.length && " (use search to narrow down)"}
                    </>
                  )}
                </p>
            </div>

            {/* Grid of schools */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {displayedSchools.map((s, index) => (
                <UniversityCard
                  key={`${s.name}-${index}`}
                  name={s.name}
                  type={s.type}
                  location={`${s.location}, ${s.state.toUpperCase()}`}
                  address={s.location}
                  bio={`${s.name} is a ${s.type} located in ${s.location}.`}
                  image="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800"
                  verified={s.verified}
                  onClicked={() => gotoSchool(index)}
                />
              ))}
            </div>

            {!isLoading && filteredSchools.length === 0 && (
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
