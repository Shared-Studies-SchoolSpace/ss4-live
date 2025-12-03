export default function GridWrapper({ children, cols = "md:grid-cols-2 lg:grid-cols-3" }) {
  return (
    <div className={`grid gap-8 ${cols}`}>
      {children}
    </div>
  );
}
