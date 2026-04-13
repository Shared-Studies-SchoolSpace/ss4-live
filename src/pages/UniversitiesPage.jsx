import UniversityListHeader from "../components/UniversityListHeader";
import UniversitySearchBar from "../components/UniversitySearchBar";
import UniversityCard from "../components/UniversityCard";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../components/Button";
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function UniversitiesPage() {
  const [showFilters, setShowFilters] = useState(false);
  const universities = [
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
      location: "Onitsha, NG",
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
      location: "Abuja, NG",
      address: "Karshi-Jikwoyi Road, Gidan Mangoro, Abuja",
      resources: 5,
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Loyola_Jesuit_College_logo.svg/220px-Loyola_Jesuit_College_logo.svg.png",
      image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800",
      bio: "A co-educational boarding school providing a global standard of education in the heart of Nigeria.",
      verified: true,
    },
  ];
  const navigate = useNavigate();

  // Navigate to school profile
  const gotoMit = () => {
    navigate("/school/1");
  };

  const FilterPanel = () => (
    <div className="flex flex-col gap-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm h-fit sticky top-24">
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary mb-6 flex items-center gap-2">
            <FilterListIcon sx={{ fontSize: 16 }} /> Filter Results
        </h3>
        
        <div className="space-y-6">
            <div>
                <label className="text-sm font-bold text-gray-700 block mb-3">School Type</label>
                <div className="space-y-2">
                    {['Public', 'Private', 'Mission-owned', 'International'].map(type => (
                        <label key={type} className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
                            <span className="text-sm text-gray-600 group-hover:text-brand-primary transition-colors">{type}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-sm font-bold text-gray-700 block mb-3">Verification</label>
                <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
                    <span className="text-sm text-gray-600 group-hover:text-brand-primary flex items-center gap-1.5 transition-colors">
                        <CheckCircleIcon sx={{ fontSize: 16 }} className="text-green-500" /> SS4 Verified Only
                    </span>
                </label>
            </div>

            <div>
                <label className="text-sm font-bold text-gray-700 block mb-3">Facility Rating</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-primary transition-colors">
                    <option>Any Rating</option>
                    <option>4 Stars & Up</option>
                    <option>3 Stars & Up</option>
                </select>
            </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
        <Button variant="primary" className="w-full" onClick={() => setShowFilters(false)}>Apply Filters</Button>
        <button className="text-sm font-bold text-gray-400 hover:text-brand-accent transition-colors py-2" onClick={() => {}}>
            Clear filters
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-brand-bg-cream min-h-screen">
      <main className="px-6 md:px-12 lg:px-16 py-12 max-w-[1600px] mx-auto">
        <UniversityListHeader />
        
        <div className="mt-12 flex flex-col lg:flex-row gap-10">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-80 shrink-0">
            <FilterPanel />
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            <UniversitySearchBar onToggleFilters={() => setShowFilters(!showFilters)} />

            {/* Mobile Filter Toggle Info */}
            <div className="lg:hidden flex justify-between items-center mb-6">
                <p className="text-sm text-gray-500 font-medium">Showing <span className="text-brand-primary font-bold">{universities.length}</span> schools</p>
                <button 
                    onClick={() => setShowFilters(true)}
                    className="flex items-center gap-2 text-sm font-bold text-brand-primary bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm"
                >
                    <FilterListIcon sx={{ fontSize: 18 }} /> Filters
                </button>
            </div>

            {/* Grid of universities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {universities.map((u, index) => (
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
          </div>
        </div>
      </main>

      {/* Mobile Filter Drawer Backdrop */}
      {showFilters && (
        <div 
            className="fixed inset-0 bg-black/50 z-[100] lg:hidden"
            onClick={() => setShowFilters(false)}
        >
            <div 
                className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white p-2"
                onClick={e => e.stopPropagation()}
            >
                <FilterPanel />
            </div>
        </div>
      )}
    </div>
  );
}
