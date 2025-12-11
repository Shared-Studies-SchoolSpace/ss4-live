import React, { useState } from "react";

export default function CreateCourseContentForm({ departments }) {
  const [department, setDepartment] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [visibility, setVisibility] = useState("preview");

  const [files, setFiles] = useState([]);

  function addFile() {
    setFiles([...files, { file: null, name: "" }]);
  }

  function updateFile(index, key, value) {
    const updated = [...files];
    updated[index][key] = value;
    setFiles(updated);
  }

  function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      department,
      title,
      description: desc,
      visibility,
      files,
    };

    console.log("Course Content:", payload);
  }

  return (
    <div className="bg-[#181b21] rounded-xl border border-[#283039] p-6 text-white max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">Upload Course Content</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Department Dropdown */}
        <label className="flex flex-col gap-1">
          <span className="text-[#9dabb9] text-sm">Department</span>

          <select
            className="bg-[#111418] border border-[#283039] rounded-xl px-3 py-2 outline-none text-white capitalize"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">Select department</option>
            {departments.map((dep, index) => (
              <option key={index} value={dep.toLowerCase()}>
                {dep}
              </option>
            ))}
          </select>
        </label>

        {/* Course Title */}
        <label className="flex flex-col gap-1">
          <span className="text-[#9dabb9] text-sm">Course Title</span>
          <input
            className="bg-[#111418] border border-[#283039] rounded-xl px-3 py-2 outline-none text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Quantum Mechanics I"
          />
        </label>

        {/* Description */}
        <label className="flex flex-col gap-1">
          <span className="text-[#9dabb9] text-sm">Course Description</span>
          <textarea
            className="bg-[#111418] border border-[#283039] rounded-xl px-3 py-2 outline-none text-white min-h-[120px]"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Write a brief course description..."
          ></textarea>
        </label>

        {/* Visibility */}
        <div className="flex flex-col gap-1">
          <span className="text-[#9dabb9] text-sm">Visibility</span>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="preview"
                checked={visibility === "preview"}
                onChange={(e) => setVisibility(e.target.value)}
              />
              <span className="text-[#9dabb9]">Preview</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="full"
                checked={visibility === "full"}
                onChange={(e) => setVisibility(e.target.value)}
              />
              <span className="text-[#9dabb9]">Full Access</span>
            </label>
          </div>
        </div>

        {/* File uploads */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#9dabb9] text-sm">File Uploads</span>
            <button
              type="button"
              onClick={addFile}
              className="bg-[#137fec] hover:bg-[#0f6ac5] text-white px-3 py-1 rounded-xl text-sm"
            >
              + Add File
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {files.map((f, index) => (
              <div
                key={index}
                className="border border-[#283039] bg-[#111418] rounded-xl p-4 flex flex-col gap-3"
              >
                <label className="flex flex-col gap-1">
                  <span className="text-[#9dabb9] text-sm">File Name</span>
                  <input
                    className="bg-[#181b21] border border-[#283039] rounded-xl px-3 py-2 outline-none text-white"
                    value={f.name}
                    onChange={(e) => updateFile(index, "name", e.target.value)}
                    placeholder="e.g. Lecture Notes Week 1"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[#9dabb9] text-sm">Upload File</span>
                  <input
                    type="file"
                    className="text-[#9dabb9]"
                    onChange={(e) => updateFile(index, "file", e.target.files[0])}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-[#137fec] hover:bg-[#0f6ac5] text-white font-semibold px-4 py-2 rounded-xl"
        >
          Upload Course Content
        </button>
      </form>
    </div>
  );
}
