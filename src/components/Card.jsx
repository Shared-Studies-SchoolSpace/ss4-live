export default function Card({ icon, title, children }) {
  return (
    <div className="bg-background-light dark:bg-background-dark p-8 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 text-primary rounded-lg flex items-center justify-center mb-5">
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
