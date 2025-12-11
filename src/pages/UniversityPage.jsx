import Navbar from "../components/Navbar";
import Breadcrumbs from "../components/Breadcrumbs";
import UniversityHeader from "../components/UniversityHeader";
import Filters from "../components/Filters";
import CourseSection from "../components/CourseSection";

export default function UniversityPage() {
  return (
    <div className="bg-[#111418] min-h-screen text-white">
      <Navbar />
      <Breadcrumbs />

      <main className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto">
        <UniversityHeader />
        <Filters />

        <CourseSection title="Courses Offered" />
      </main>
    </div>
  );
}
