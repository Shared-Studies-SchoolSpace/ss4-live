export default function Card({ icon, title, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-lg flex items-center justify-center mb-5">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        {children}
      </p>
    </div>
  );
}
