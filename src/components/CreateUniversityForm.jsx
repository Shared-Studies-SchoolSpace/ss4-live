import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

export default function CreateUniversityForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    schoolName: "",
    contactName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting Inquiry:", formData);
    // Add your API call here
    alert("Inquiry sent successfully.");
    navigate("/universities");
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-1">
          <span className="text-gray-600 text-sm font-bold tracking-wide">School Name</span>
          <input
            type="text"
            name="schoolName"
            className="w-full bg-[#F6F4F0] border border-gray-200 rounded-lg px-4 py-3 outline-none text-[#111111] focus:ring-2 focus:ring-[#26844D] focus:border-[#26844D] transition-all"
            value={formData.schoolName}
            onChange={handleChange}
            placeholder="e.g. King's College"
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-600 text-sm font-bold tracking-wide">Contact Person Name</span>
          <input
            type="text"
            name="contactName"
            className="w-full bg-[#F6F4F0] border border-gray-200 rounded-lg px-4 py-3 outline-none text-[#111111] focus:ring-2 focus:ring-[#26844D] focus:border-[#26844D] transition-all"
            value={formData.contactName}
            onChange={handleChange}
            placeholder="e.g. Dr. John Doe"
            required
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <label className="flex flex-col gap-1">
            <span className="text-gray-600 text-sm font-bold tracking-wide">Email Address</span>
            <input
              type="email"
              name="email"
              className="w-full bg-[#F6F4F0] border border-gray-200 rounded-lg px-4 py-3 outline-none text-[#111111] focus:ring-2 focus:ring-[#26844D] focus:border-[#26844D] transition-all"
              value={formData.email}
              onChange={handleChange}
              placeholder="principal@school.edu.ng"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-gray-600 text-sm font-bold tracking-wide">Phone Number</span>
            <input
              type="tel"
              name="phone"
              className="w-full bg-[#F6F4F0] border border-gray-200 rounded-lg px-4 py-3 outline-none text-[#111111] focus:ring-2 focus:ring-[#26844D] focus:border-[#26844D] transition-all"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+234..."
              required
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-gray-600 text-sm font-bold tracking-wide">Additional Message</span>
          <textarea
            name="message"
            className="w-full bg-[#F6F4F0] border border-gray-200 rounded-lg px-4 py-3 outline-none text-[#111111] min-h-[120px] focus:ring-2 focus:ring-[#26844D] focus:border-[#26844D] transition-all"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us about your school and how you'd like to partner..."
          ></textarea>
        </label>

        <div className="pt-4 text-center">
          <Button type="submit" variant="primary">
            Submit Partnership Inquiry
          </Button>
        </div>
      </form>
    </div>
  );
}