import Navbar from "../components/Navbar";
import UniversityListHeader from "../components/UniversityListHeader";
import UniversitySearchBar from "../components/UniversitySearchBar";
import UniversityCard from "../components/UniversityCard";

export default function UniversitiesPage() {
  const universities = [
    {
      name: "Massachusetts Institute of Technology",
      type: "university",
      location: "Cambridge, MA",
      resources: 1204,
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/0c/MIT_logo.svg",
      verified: true,
    },
    {
      name: "Stanford University",
      type: "university",
      location: "Stanford, CA",
      resources: 980,
      logo: "https://upload.wikimedia.org/wikipedia/en/b/b7/Stanford_University_seal_2003.svg",
      verified: true,
    },
    {
      name: "Harvard University",
      type: "university",
      location: "Cambridge, MA",
      resources: 1022,
      logo: "https://upload.wikimedia.org/wikipedia/en/2/29/Harvard_shield_wreath.svg",
      verified: true,
    },
    {
      name: "Caltech",
      type: "university",
      location: "Pasadena, CA",
      resources: 650,
      logo: "https://upload.wikimedia.org/wikipedia/en/5/5d/Caltech_logo.svg",
      verified: true,
    },
  ];

  return (
    <div className="bg-[#111418] min-h-screen text-white">
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
            />
          ))}
        </div>
      </main>
    </div>
  );
}
