import CourseCard from "./CourseCard";

export default function CourseSection({ title }) {
  const courses = [
    { title: "Quantum Mechanics I", description: "Introductory quantum theory." },
    { title: "Electromagnetism II", description: "Maxwell equations and waves." },
    { title: "Statistical Physics", description: "Entropy, ensembles, thermodynamics." },
    { title: "Solid State Physics", description: "Crystals, bands, materials." },
  ];

  return (
    <div className="mb-10">
      <h3 className="text-white text-xl font-bold mb-4">{title}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((c, i) => (
          <CourseCard key={i} title={c.title} description={c.description} />
        ))}
      </div>
    </div>
  );
}
