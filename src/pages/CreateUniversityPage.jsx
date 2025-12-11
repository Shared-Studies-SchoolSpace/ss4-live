import Navbar from "../components/Navbar";
import CreateUniversityForm from "../components/CreateUniversityForm";

export default function CreateUniversityPage() {
  return (
    <div className="bg-[#111418] min-h-screen text-white">
      <Navbar />

      <main className="px-6 lg:px-10 py-10 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add a New University</h1>

        <CreateUniversityForm />
      </main>
    </div>
  );
}
