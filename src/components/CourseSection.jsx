import CourseCard from "./CourseCard";

export default function CourseSection({ title }) {
  const courses = [
    { title: "English Language", description: "Comprehension, lexis and structure." },
    { title: "Mathematics", description: "Algebra, geometry and trigonometry." },
    { title: "Physics", description: "Mechanics, energy and waves." },
    { title: "Chemistry", description: "Organic and inorganic chemistry." },
    { title: "Biology", description: "Ecology, genetics and human biology." },
  ];

  return (
    <div className="mb-10">
      <h3 className="text-[#111111] text-2xl font-bold mb-4">{title}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {courses.map((c, i) => (
          <CourseCard key={i} title={c.title} description={c.description} />
        ))}
      </div>
    </div>
  );
}
