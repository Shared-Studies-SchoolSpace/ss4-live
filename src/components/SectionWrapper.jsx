export default function SectionWrapper({ children, variant = "default" }) {
  const base = "py-12 md:py-24";
  const variants = {
    default: "",
    light: "bg-background-light",
    white: "bg-white",
  };
  return (
    <section className={`${base} ${variants[variant]}`}>
      {children}
    </section>
  );
}
