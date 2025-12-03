export default function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-primary focus:border-primary"
    />
  );
}
