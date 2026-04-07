export default function Button({ children, variant = "primary", ...props }) {
  const variants = {
    primary:
      "bg-brand-primary text-white font-bold px-8 py-3 rounded-full shadow-md hover:bg-brand-accent transition-colors",
    secondary:
      "bg-white text-[#111111] font-bold px-8 py-3 rounded-full shadow-sm border border-gray-200 hover:bg-brand-bg-cream transition-colors",
    minimal:
      "text-[#111111] font-bold hover:text-brand-primary",
  };
  return (
    <button className={variants[variant]} {...props}>
      {children}
    </button>
  );
}
