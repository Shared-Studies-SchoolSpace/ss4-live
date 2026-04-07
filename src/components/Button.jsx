export default function Button({ children, variant = "primary", ...props }) {
  const variants = {
    primary:
      "bg-[#004529] text-white font-bold px-8 py-3 rounded-full shadow-md hover:bg-[#26844D] transition-colors",
    secondary:
      "bg-white text-[#111111] font-bold px-8 py-3 rounded-full shadow-sm border border-gray-200 hover:bg-[#F6F4F0] transition-colors",
    minimal:
      "text-[#111111] font-bold hover:text-[#26844D]",
  };
  return (
    <button className={variants[variant]} {...props}>
      {children}
    </button>
  );
}
