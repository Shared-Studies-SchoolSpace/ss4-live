export default function ModalFrame({ open, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-xl p-8 max-w-lg w-full border border-gray-200">
        {children}
      </div>
    </div>
  );
}
