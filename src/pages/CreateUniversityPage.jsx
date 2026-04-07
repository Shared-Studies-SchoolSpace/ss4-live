import CreateUniversityForm from "../components/CreateUniversityForm";

export default function CreateUniversityPage() {
  return (
    <div className="w-full">
      <main className="px-6 lg:px-10 py-10 md:py-16 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-[3rem] font-black text-[#111111] mb-4 leading-[1.1] text-center">Partner With Us</h1>
        <p className="text-gray-600 text-center text-lg mb-8">
          Join the Shared Studies network to equip your students with rigorous assessment tools and global exposure.
        </p>

        <CreateUniversityForm />
      </main>
    </div>
  );
}
