export default function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary:
      "varsity-btn-primary text-sm tracking-wide select-none active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
    secondary:
      "varsity-btn-secondary text-sm tracking-wide select-none active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2",
    minimal:
      "inline-flex items-center justify-center min-h-[48px] px-4 text-[#111111] font-bold hover:text-brand-primary transition-colors cursor-pointer select-none outline-none focus-visible:underline",
  };
  return (
    <button className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
