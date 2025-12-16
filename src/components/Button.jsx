export default function Button({ children, variant = "primary", ...props }) {
  const variants = {
    primary:
      "bg-blue-500 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition-colors",
    secondary:
      "bg-white text-gray-700 font-semibold px-8 py-3 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors",
    minimal:
      "text-gray-600 dark:text-gray-300 font-medium hover:text-blue-500",
  };
  return (
    <button className={variants[variant]} {...props}>
      {children}
    </button>
  );
}
