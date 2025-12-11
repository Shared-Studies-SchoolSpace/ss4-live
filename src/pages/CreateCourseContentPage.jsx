import Navbar from "../components/Navbar";
import CreateCourseContentForm from "../components/CreateCourseContentForm";

export default function CreateCourseContentPage() {
  // For now, static. Later this can come from your API.
  const departments = [
    "Physics",
    "Mathematics",
    "Computer Science",
    "Mechanical Engineering",
    "Chemistry",
    "Biology",
  ];

  return (
    <div className="bg-[#111418] min-h-screen text-white">
      <Navbar />

      <main className="px-6 lg:px-10 py-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Upload Course Content</h1>

        <CreateCourseContentForm departments={departments} />
      </main>
    </div>
  );
}
