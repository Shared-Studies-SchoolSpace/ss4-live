export default function ToastFrame({ message, visible }) {
  return (
    <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-lg shadow-lg bg-gray-900 text-white transition-opacity ${visible ? "opacity-100" : "opacity-0"}`}>
      {message}
    </div>
  );
}
