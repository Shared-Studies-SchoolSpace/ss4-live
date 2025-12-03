export default function DrawerFrame({ open, side = "right", children }) {
  if (!open) return null;
  const position = side === "right" ? "right-0" : "left-0";
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50">
      <div className={`absolute top-0 ${position} h-full w-80 bg-white dark:bg-gray-800 p-6 border-l border-gray-200 dark:border-gray-700`}>
        {children}
      </div>
    </div>
  );
}
