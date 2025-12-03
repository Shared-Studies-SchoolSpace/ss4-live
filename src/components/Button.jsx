export default function Button({ children, variant = "primary", ...props }) {
  const variants = {
    primary:
      "bg-primary text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition-colors",
    secondary:
      "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold px-8 py-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
    minimal:
      "text-gray-600 dark:text-gray-300 font-medium hover:text-primary",
  };
  return (
    <button className={variants[variant]} {...props}>
      {children}
    </button>
  );
}
