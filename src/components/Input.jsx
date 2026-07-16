export default function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full varsity-input text-brand-text-dark font-medium placeholder-gray-400 ${className}`}
    />
  );
}
