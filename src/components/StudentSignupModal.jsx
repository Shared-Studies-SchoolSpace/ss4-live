// components/StudentSignupModal.jsx
import { useState } from "react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
export default function StudentSignupModal({ onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    university: "",
    faculty: "",
    department: "",
    level: "",
  });

  const navigate = useNavigate();

  // Navigate to /generate after successful login/signup
  const gotoUniversities = () => {
    navigate("/universities");
  };

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-gray-700 rounded-xl p-8 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Student Signup
        </h2>

        <div className="flex flex-col gap-4">
          <input
            className="border rounded-md px-4 py-2"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />

          <input
            className="border rounded-md px-4 py-2"
            placeholder="Email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />

          <input
            className="border rounded-md px-4 py-2"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />

          <input
            className="border rounded-md px-4 py-2"
            type="password"
            placeholder="Confirm Password"
            value={form.confirm}
            onChange={(e) => update("confirm", e.target.value)}
          />

          <input
            className="border rounded-md px-4 py-2"
            placeholder="University"
            value={form.university}
            onChange={(e) => update("university", e.target.value)}
          />

          <input
            className="border rounded-md px-4 py-2"
            placeholder="Faculty"
            value={form.faculty}
            onChange={(e) => update("faculty", e.target.value)}
          />

          <input
            className="border rounded-md px-4 py-2"
            placeholder="Department"
            value={form.department}
            onChange={(e) => update("department", e.target.value)}
          />

          <input
            className="border rounded-md px-4 py-2"
            placeholder="Level / Year"
            value={form.level}
            onChange={(e) => update("level", e.target.value)}
          />

          <Button variant="primary" onClick={gotoUniversities}>
            Sign Up
          </Button>

          <button
            className="text-sm text-gray-500 underline mt-2"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
