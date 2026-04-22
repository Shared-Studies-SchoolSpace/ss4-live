import Breadcrumbs from "../components/Breadcrumbs";
import UniversityHeader from "../components/UniversityHeader";

export default function UniversityPage() {
  return (
    <div className="w-full">
      <Breadcrumbs />

      <main className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto">
        <UniversityHeader />
      </main>
    </div>
  );
}
