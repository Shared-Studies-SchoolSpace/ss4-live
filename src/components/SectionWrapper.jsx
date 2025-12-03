export default function SectionWrapper({ children, variant = "default" }) {
  const base = "py-24";
  const variants = {
    default: "",
    light: "bg-background-light dark:bg-background-dark",
    white: "bg-white dark:bg-gray-800",
  };
  return (
    <section className={`${base} ${variants[variant]}`}>
      {children}
    </section>
  );
}
