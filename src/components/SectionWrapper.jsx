export default function SectionWrapper({ children, variant = "default", py = "8 md:py-24", className = "" }) {
  const pyClass = String(py).startsWith("py-") ? py : `py-${py}`;
  const variants = {
    default: "",
    light: "bg-background-light",
    white: "bg-white",
  };
  return (
    <section className={`${pyClass} px-6 md:px-12 lg:px-16 ${variants[variant]} ${className}`}>
      {children}
    </section>
  );
}

