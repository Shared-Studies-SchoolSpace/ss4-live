import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Reuse the existing components from your project structure
import SectionWrapper from "../components/SectionWrapper";
import { H2, Body, BodyLarge } from "../components/Typography";
import Button from "../components/Button";
import NavBar from "../components/Navbar";

// Icons
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SchoolIcon from "@mui/icons-material/School";


export default function CreateUniversityForm() {
  const navigate = useNavigate();

  // State for the form
  const [formData, setFormData] = useState({
    image: null,
    name: "",
    location: "",
    // Initial state: One faculty with one empty department slot
    faculties: [{ name: "", departments: [""] }],
  });

  const [previewUrl, setPreviewUrl] = useState(null);

  // --- Handlers ---

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleBasicChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Faculty Logic
  const handleFacultyChange = (index, value) => {
    const newFaculties = [...formData.faculties];
    newFaculties[index].name = value;
    setFormData({ ...formData, faculties: newFaculties });
  };

  const addFaculty = () => {
    setFormData({
      ...formData,
      faculties: [...formData.faculties, { name: "", departments: [""] }],
    });
  };

  const removeFaculty = (index) => {
    const newFaculties = formData.faculties.filter((_, i) => i !== index);
    setFormData({ ...formData, faculties: newFaculties });
  };

  // Department Logic (Nested inside Faculty)
  const handleDepartmentChange = (facultyIndex, deptIndex, value) => {
    const newFaculties = [...formData.faculties];
    newFaculties[facultyIndex].departments[deptIndex] = value;
    setFormData({ ...formData, faculties: newFaculties });
  };

  const addDepartment = (facultyIndex) => {
    const newFaculties = [...formData.faculties];
    newFaculties[facultyIndex].departments.push("");
    setFormData({ ...formData, faculties: newFaculties });
  };

  const removeDepartment = (facultyIndex, deptIndex) => {
    const newFaculties = [...formData.faculties];
    newFaculties[facultyIndex].departments = newFaculties[
      facultyIndex
    ].departments.filter((_, i) => i !== deptIndex);
    setFormData({ ...formData, faculties: newFaculties });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting University Data:", formData);
    // Add your API call here
    navigate("/create-course-content");
  };

  return (
    <>
      <NavBar />

      <SectionWrapper variant="light">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <H2>Register a University</H2>
            <BodyLarge className="mt-4">
              Add a new institution to the SS4 network.
            </BodyLarge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* --- Section 1: Basic Info & Branding --- */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col items-center justify-center mb-8">
                {/* Image Upload Area */}
                <label className="cursor-pointer w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:bg-gray-50 transition-colors relative overflow-hidden">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="University Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <CloudUploadIcon
                        className="text-gray-400 mb-2"
                        style={{ fontSize: 40 }}
                      />
                      <Body className="text-gray-500">
                        Click to upload University Logo / Campus Image
                      </Body>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              <div className="grid gap-6">
                <div>
                  <Body className="mb-2 font-semibold">University Name</Body>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. University of Lagos"
                    value={formData.name}
                    onChange={handleBasicChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <Body className="mb-2 font-semibold">Location</Body>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. Akoka, Yaba, Lagos"
                    value={formData.location}
                    onChange={handleBasicChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* --- Section 2: Structure (Faculties & Departments) --- */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <H2 className="text-2xl">Faculties & Departments</H2>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addFaculty}
                  className="flex items-center gap-2"
                >
                  <AddCircleOutlineIcon fontSize="small" /> Add Faculty
                </Button>
              </div>

              {formData.faculties.map((faculty, fIndex) => (
                <div
                  key={fIndex}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative"
                >
                  {/* Faculty Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                      <SchoolIcon />
                    </div>
                    <div className="flex-grow">
                      <Body className="mb-1 text-sm text-gray-500">
                        Faculty Name
                      </Body>
                      <input
                        type="text"
                        placeholder="e.g. Faculty of Engineering"
                        value={faculty.name}
                        onChange={(e) =>
                          handleFacultyChange(fIndex, e.target.value)
                        }
                        className="w-full p-2 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-transparent font-medium text-lg transition-all"
                      />
                    </div>
                    {formData.faculties.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFaculty(fIndex)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <DeleteOutlineIcon />
                      </button>
                    )}
                  </div>

                  {/* Departments List */}
                  <div className="pl-14 space-y-3">
                    <Body className="text-gray-500 text-sm mb-2">
                      Departments
                    </Body>
                    {faculty.departments.map((dept, dIndex) => (
                      <div key={dIndex} className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="Department Name"
                          value={dept}
                          onChange={(e) =>
                            handleDepartmentChange(
                              fIndex,
                              dIndex,
                              e.target.value
                            )
                          }
                          className="flex-grow p-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        {faculty.departments.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeDepartment(fIndex, dIndex)}
                            className="text-gray-300 hover:text-red-500"
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </button>
                        ) : null}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addDepartment(fIndex)}
                      className="text-sm text-blue-600 font-medium hover:underline mt-2 flex items-center gap-1"
                    >
                      <AddCircleOutlineIcon style={{ fontSize: 16 }} /> Add
                      Department
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* --- Submit Action --- */}
            <div className="pt-8 text-center">
              <button type="submit" className="w-fit md:w-auto px-12 bg-blue-500 rounded-md hover:bg-blue-400"
              onClick={handleSubmit}>
                Create University Profile
              </button>
            </div>
          </form>
        </div>
      </SectionWrapper>
    </>
  );
}