export default function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-primary focus:border-primary"
    />
  );
}
