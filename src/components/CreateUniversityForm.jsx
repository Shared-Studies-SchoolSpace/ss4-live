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
    // Initial state: One faculty -> one session -> one semester -> one course -> one level
    faculties: [
      {
        name: "",
        sessions: [
          {
            name: "",
            semesters: [
              {
                name: "",
                courses: [
                  {
                    name: "",
                    levels: [""],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
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
      faculties: [
        ...formData.faculties,
        {
          name: "",
          sessions: [
            {
              name: "",
              semesters: [
                {
                  name: "",
                  courses: [
                    { name: "", levels: [""] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  };

  const removeFaculty = (index) => {
    const newFaculties = formData.faculties.filter((_, i) => i !== index);
    setFormData({ ...formData, faculties: newFaculties });
  };

  // Session Logic
  const handleSessionChange = (fIndex, sIndex, value) => {
    const newFaculties = [...formData.faculties];
    newFaculties[fIndex].sessions[sIndex].name = value;
    setFormData({ ...formData, faculties: newFaculties });
  };

  const addSession = (fIndex) => {
    const newFaculties = [...formData.faculties];
    newFaculties[fIndex].sessions.push({
      name: "",
      semesters: [
        {
          name: "",
          courses: [{ name: "", levels: [""] }],
        },
      ],
    });
    setFormData({ ...formData, faculties: newFaculties });
  };

  const removeSession = (fIndex, sIndex) => {
    const newFaculties = [...formData.faculties];
    newFaculties[fIndex].sessions = newFaculties[fIndex].sessions.filter(
      (_, i) => i !== sIndex
    );
    setFormData({ ...formData, faculties: newFaculties });
  };

  // Semester Logic
  const handleSemesterChange = (fIndex, sIndex, semIndex, value) => {
    const newFaculties = [...formData.faculties];
    newFaculties[fIndex].sessions[sIndex].semesters[semIndex].name = value;
    setFormData({ ...formData, faculties: newFaculties });
  };

  const addSemester = (fIndex, sIndex) => {
    const newFaculties = [...formData.faculties];
    newFaculties[fIndex].sessions[sIndex].semesters.push({
      name: "",
      courses: [{ name: "", levels: [""] }],
    });
    setFormData({ ...formData, faculties: newFaculties });
  };

  const removeSemester = (fIndex, sIndex, semIndex) => {
    const newFaculties = [...formData.faculties];
    newFaculties[fIndex].sessions[sIndex].semesters = newFaculties[
      fIndex
    ].sessions[sIndex].semesters.filter((_, i) => i !== semIndex);
    setFormData({ ...formData, faculties: newFaculties });
  };

  // Course Logic
  const handleCourseChange = (
    fIndex,
    sIndex,
    semIndex,
    cIndex,
    value
  ) => {
    const newFaculties = [...formData.faculties];
    newFaculties[fIndex].sessions[sIndex].semesters[semIndex].courses[cIndex].name =
      value;
    setFormData({ ...formData, faculties: newFaculties });
  };

  const addCourse = (fIndex, sIndex, semIndex) => {
    const newFaculties = [...formData.faculties];
    newFaculties[fIndex].sessions[sIndex].semesters[semIndex].courses.push({
      name: "",
      levels: [""],
    });
    setFormData({ ...formData, faculties: newFaculties });
  };

  const removeCourse = (fIndex, sIndex, semIndex, cIndex) => {
    const newFaculties = [...formData.faculties];
    newFaculties[fIndex].sessions[sIndex].semesters[semIndex].courses =
      newFaculties[fIndex].sessions[sIndex].semesters[semIndex].courses.filter(
        (_, i) => i !== cIndex
      );
    setFormData({ ...formData, faculties: newFaculties });
  };

  // Level Logic
  const handleLevelChange = (
    fIndex,
    sIndex,
    semIndex,
    cIndex,
    levelIndex,
    value
  ) => {
    const newFaculties = [...formData.faculties];
    newFaculties[fIndex].sessions[sIndex].semesters[semIndex].courses[cIndex].levels[
      levelIndex
    ] = value;
    setFormData({ ...formData, faculties: newFaculties });
  };

  const addLevel = (fIndex, sIndex, semIndex, cIndex) => {
    const newFaculties = [...formData.faculties];
    newFaculties[fIndex].sessions[sIndex].semesters[semIndex].courses[cIndex].levels.push(
      ""
    );
    setFormData({ ...formData, faculties: newFaculties });
  };

  const removeLevel = (fIndex, sIndex, semIndex, cIndex, levelIndex) => {
    const newFaculties = [...formData.faculties];
    newFaculties[fIndex].sessions[sIndex].semesters[semIndex].courses[cIndex].levels =
      newFaculties[fIndex].sessions[sIndex].semesters[semIndex].courses[cIndex].levels.filter(
        (_, i) => i !== levelIndex
      );
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

            {/* --- Section 2: Structure (Faculties & Sessions) --- */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                <H2 className="text-2xl">Faculties & Structure</H2>
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

                  {/* Sessions -> Semesters -> Courses -> Levels */}
                  <div className="pl-14 space-y-4">
                    <Body className="text-gray-500 text-sm mb-2">
                      Sessions
                    </Body>

                    {faculty.sessions.map((session, sIndex) => (
                      <div key={sIndex} className="space-y-3 border-l pl-6">
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            placeholder="Session Name (e.g. 2024/2025)"
                            value={session.name}
                            onChange={(e) =>
                              handleSessionChange(fIndex, sIndex, e.target.value)
                            }
                            className="flex-grow p-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          {faculty.sessions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSession(fIndex, sIndex)}
                              className="text-gray-300 hover:text-red-500"
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </button>
                          )}
                        </div>

                        {/* Semesters */}
                        <div className="pl-6 space-y-2">
                          <Body className="text-gray-500 text-sm">Semesters</Body>
                          {session.semesters.map((sem, semIndex) => (
                            <div key={semIndex} className="space-y-2">
                              <div className="flex items-center gap-3">
                                <input
                                  type="text"
                                  placeholder="Semester Name (e.g. Semester 1)"
                                  value={sem.name}
                                  onChange={(e) =>
                                    handleSemesterChange(
                                      fIndex,
                                      sIndex,
                                      semIndex,
                                      e.target.value
                                    )
                                  }
                                  className="flex-grow p-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                {session.semesters.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeSemester(fIndex, sIndex, semIndex)}
                                    className="text-gray-300 hover:text-red-500"
                                  >
                                    <DeleteOutlineIcon fontSize="small" />
                                  </button>
                                )}
                              </div>

                              {/* Courses */}
                              <div className="pl-6 space-y-2">
                                <Body className="text-gray-500 text-sm">Courses</Body>
                                {sem.courses.map((course, cIndex) => (
                                  <div key={cIndex} className="space-y-2">
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="text"
                                        placeholder="Course Name"
                                        value={course.name}
                                        onChange={(e) =>
                                          handleCourseChange(
                                            fIndex,
                                            sIndex,
                                            semIndex,
                                            cIndex,
                                            e.target.value
                                          )
                                        }
                                        className="flex-grow p-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      />
                                      {sem.courses.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => removeCourse(fIndex, sIndex, semIndex, cIndex)}
                                          className="text-gray-300 hover:text-red-500"
                                        >
                                          <DeleteOutlineIcon fontSize="small" />
                                        </button>
                                      )}
                                    </div>

                                    {/* Levels */}
                                    <div className="pl-6 space-y-1">
                                      <Body className="text-gray-500 text-sm">Levels</Body>
                                      {course.levels.map((lvl, lIndex) => (
                                        <div key={lIndex} className="flex items-center gap-3">
                                          <input
                                            type="text"
                                            placeholder="Level (e.g. 100)"
                                            value={lvl}
                                            onChange={(e) =>
                                              handleLevelChange(
                                                fIndex,
                                                sIndex,
                                                semIndex,
                                                cIndex,
                                                lIndex,
                                                e.target.value
                                              )
                                            }
                                            className="flex-grow p-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          />
                                          {course.levels.length > 1 && (
                                            <button
                                              type="button"
                                              onClick={() => removeLevel(fIndex, sIndex, semIndex, cIndex, lIndex)}
                                              className="text-gray-300 hover:text-red-500"
                                            >
                                              <DeleteOutlineIcon fontSize="small" />
                                            </button>
                                          )}
                                        </div>
                                      ))}

                                      <button
                                        type="button"
                                        onClick={() => addLevel(fIndex, sIndex, semIndex, cIndex)}
                                        className="text-sm text-blue-600 font-medium hover:underline mt-1 flex items-center gap-1"
                                      >
                                        <AddCircleOutlineIcon style={{ fontSize: 14 }} /> Add Level
                                      </button>
                                    </div>
                                  </div>
                                ))}

                                <button
                                  type="button"
                                  onClick={() => addCourse(fIndex, sIndex, semIndex)}
                                  className="text-sm text-blue-600 font-medium hover:underline mt-1 flex items-center gap-1"
                                >
                                  <AddCircleOutlineIcon style={{ fontSize: 14 }} /> Add Course
                                </button>
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => addSemester(fIndex, sIndex)}
                            className="text-sm text-blue-600 font-medium hover:underline mt-1 flex items-center gap-1"
                          >
                            <AddCircleOutlineIcon style={{ fontSize: 14 }} /> Add Semester
                          </button>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addSession(fIndex)}
                      className="text-sm text-blue-600 font-medium hover:underline mt-2 flex items-center gap-1"
                    >
                      <AddCircleOutlineIcon style={{ fontSize: 16 }} /> Add Session
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