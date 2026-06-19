import { useLocation } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import UniversityHeader from "../components/UniversityHeader";

export default function UniversityPage() {
  const location = useLocation();
  const school = location.state?.school;

  return (
    <div className="w-full">
      <Breadcrumbs 
        parentLabel="Secondary Schools" 
        parentHref="/schools" 
        currentLabel={school?.name || "King's College"} 
      />

      <main className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto">
        <UniversityHeader school={school} />
      </main>
    </div>
  );
}
