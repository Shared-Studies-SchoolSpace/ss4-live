import Button from "./Button";

export default function SignupChoiceModal({ onGuest, onStudent, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Continue as:
        </h2>

        <div className="flex flex-col gap-4">

          <Button variant="secondary" onClick={onGuest}>
            Continue as Guest
          </Button>

          <Button variant="primary" onClick={onStudent}>
            Continue as Student
          </Button>

          <button className="text-sm text-gray-500 underline" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
