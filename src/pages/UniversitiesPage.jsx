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
    navigate("/school");
  };
  return (
    <div className="w-full">
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
      </main>
    </div>
  );
}
