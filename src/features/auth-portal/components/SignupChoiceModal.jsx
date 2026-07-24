import React from 'react';

export default function SignupChoiceModal({ onStudent, onGeneral, onGuest, onSignIn, onClose }) {
  const handleGeneralClick = onGeneral || onGuest;

  return (
    <div className="fixed inset-0 bg-[#111111]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-gray-100 relative text-center">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-brand-text-dark w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <img src="/ss4_logo.jpg" alt="SS4 Logo" className="h-10 mx-auto mb-3" />

        <h2 className="text-xl sm:text-2xl font-black font-space text-brand-text-dark leading-tight mb-2">
          Are you a student in a Nigerian Secondary or Tertiary institution?
        </h2>
        <p className="text-xs font-semibold text-gray-500 mb-6">
          Select your registration flow to get started with SS4 Chess League & Tournaments.
        </p>

        <div className="flex flex-col gap-3.5">
          <button
            onClick={onStudent}
            className="w-full flex items-center justify-between p-4 bg-brand-primary/5 hover:bg-brand-primary/10 border-2 border-brand-primary rounded-2xl transition-all text-left cursor-pointer group"
          >
            <div>
              <div className="text-sm font-black text-brand-primary flex items-center gap-2">
                <span>🎓</span> Yes, I am a Student
              </div>
              <p className="text-[11px] font-semibold text-gray-500 mt-0.5">
                Secondary or Tertiary institution student in Nigeria
              </p>
            </div>
            <svg className="w-5 h-5 text-brand-primary group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={handleGeneralClick}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl transition-all text-left cursor-pointer group"
          >
            <div>
              <div className="text-sm font-black text-gray-800 flex items-center gap-2">
                <span>♟️</span> No, General / Open Member
              </div>
              <p className="text-[11px] font-semibold text-gray-500 mt-0.5">
                For open players, enthusiasts, and general members
              </p>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {onSignIn && (
          <div className="text-center mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500">
              Already have an account?{" "}
              <button
                onClick={onSignIn}
                className="text-brand-primary font-bold hover:underline ml-1 cursor-pointer focus:outline-none"
              >
                Sign in here
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
