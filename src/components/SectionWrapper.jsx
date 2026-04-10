export default function SectionWrapper({ children, variant = "default", py = "8 md:py-24" }) {
  const pyClass = String(py).startsWith("py-") ? py : `py-${py}`;
  const variants = {
    default: "",
    light: "bg-background-light",
    white: "bg-white",
  };
  return (
    <section className={`${pyClass} ${variants[variant]}`}>
      {children}
    </section>
  );
}

