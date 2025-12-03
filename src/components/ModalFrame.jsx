export default function ModalFrame({ open, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-lg w-full border border-gray-200 dark:border-gray-700">
        {children}
      </div>
    </div>
  );
}
