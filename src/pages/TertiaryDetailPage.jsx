import { useLocation, useParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import UniversityHeader from "../components/UniversityHeader";
import tertiaryData from "../data/tertiary.json";

export default function TertiaryDetailPage() {
  const location = useLocation();
  const { id } = useParams();

  // Resolve school object from state or fallback lookup
  const school = location.state?.school || tertiaryData.find(u => u.id === id) || tertiaryData[0];

  return (
    <div className="w-full bg-brand-bg-cream min-h-screen">
      <Breadcrumbs 
        parentLabel="Tertiary Institutions" 
        parentHref="/tertiary" 
        currentLabel={school?.name || "University"} 
      />

      <main className="px-6 lg:px-10 py-12 max-w-[1400px] mx-auto">
        <UniversityHeader school={school} />

        {/* Bio Section */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-12">
          <h2 className="text-[#111111] text-xl font-bold mb-4">About the Institution</h2>
          <p className="text-gray-700 leading-relaxed text-base">
            {school?.bio || "A premier higher education institution dedicated to academic achievement, research excellence, and grooming the next generation of leaders."}
          </p>
        </div>

        {/* Departments Section */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4 text-left">
            <h2 className="text-[#111111] text-2xl font-black">Academic Departments</h2>
            <p className="text-gray-500 text-sm mt-1">Departments registered and active in the SS4 academic network.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {school?.departments?.map((dept, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-brand-primary transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="h-2 w-2 rounded-full bg-brand-accent"></span>
                    <h3 className="text-[#111111] text-lg font-black">{dept.name}</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {dept.bio || "No summary provided for this department yet."}
                  </p>
                </div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span>SS4 Active Engine</span>
                  <span className="text-brand-primary">Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
