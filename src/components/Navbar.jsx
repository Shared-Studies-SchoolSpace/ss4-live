import React from "react";

export default function Navbar() {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-[#283039] bg-[#111418] px-6 py-3 text-white">
      <div className="flex items-center gap-4 cursor-pointer">
        <div className="size-8 text-[#137fec]">
          {/* Logo */}
          <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
            <path
              fill="currentColor"
              d="M24 0.757L47.243 24 24 47.243 0.757 24 24 0.757ZM21 35.757V12.243L9.243 24 21 35.757Z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold">SS4</h2>
      </div>

      {/* Fake nav links */}
      <nav className="hidden lg:flex items-center gap-6">
        <a className="hover:text-[#137fec] text-sm font-medium" href="#">Browse</a>
        <a className="hover:text-[#137fec] text-sm font-medium" href="#">Upload Resource</a>
        <a className="hover:text-[#137fec] text-sm font-medium" href="#">Community</a>
        <a className="hover:text-[#137fec] text-sm font-medium" href="#">My Library</a>
      </nav>
    </header>
  );
}
