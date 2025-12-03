import React from "react";
import SchoolIcon from '@mui/icons-material/School';

export default function Navbar() {
  return (
    <header className="container mx-auto px-6 py-6">
      <nav className="flex justify-between items-center">
        <a className="flex items-center gap-3" href="#">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <SchoolIcon/>
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">SS4</span>
        </a>

        <div className="hidden md:flex items-center space-x-6 text-gray-600 dark:text-gray-300 font-medium">
          <a className="hover:text-primary" href="#">Features</a>
          <a className="hover:text-primary" href="#">Pricing</a>
          <a className="hover:text-primary" href="#">Discover</a>
          <a className="hover:text-primary" href="#">Contact</a>
        </div>

        <div className="flex items-center space-x-4">
          <a className="text-gray-600 dark:text-gray-300 font-medium hover:text-primary" href="#">Log in</a>
          <a className="bg-primary text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-600 transition-colors" href="#">
            Sign Up
          </a>
        </div>
      </nav>
    </header>
  );
}
