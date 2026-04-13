import CreateUniversityForm from "../components/CreateUniversityForm";

export default function CreateUniversityPage() {
  return (
    <div className="w-full">
      <main className="px-6 lg:px-10 py-10 md:py-16 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-[3rem] font-black text-[#111111] mb-4 leading-[1.1] text-center">Enhance Your School Profile</h1>
        <p className="text-gray-600 text-center text-lg mb-8">
          Formalize your institution's status within the SS4 network to gain full visibility and control over your academic data.
        </p>

        <CreateUniversityForm />
      </main>
    </div>
  );
}
