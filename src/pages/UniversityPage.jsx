import Breadcrumbs from "../components/Breadcrumbs";
import UniversityHeader from "../components/UniversityHeader";
import Filters from "../components/Filters";
import CourseSection from "../components/CourseSection";

export default function UniversityPage() {
  return (
    <div className="w-full">
      <Breadcrumbs />

      <main className="px-6 lg:px-10 py-8 max-w-[1400px] mx-auto">
        <UniversityHeader />
        <Filters />

        <CourseSection title="SAS Subjects Scope" />
      </main>
    </div>
  );
}
