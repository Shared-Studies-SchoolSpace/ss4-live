import React from 'react';

/**
 * Modern minimal loading screen inspired by ChatGPT & Gemini.
 * Features the SS4 brand logo, smooth breathing animation, and an elegant progress indicator.
 * Completely eliminates all technical system/process messages.
 */
export default function LoadingScreen({ progress = 0 }) {
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="fixed inset-0 bg-[#FAF9F6] z-[9999] flex flex-col items-center justify-center p-6 select-none transition-colors duration-500 font-sans">
      <div className="flex flex-col items-center justify-center space-y-8 text-center max-w-xs w-full">
        {/* SS4 Logo with gentle ambient breathing glow */}
        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-4 bg-gradient-to-tr from-[#155baa]/10 via-[#E8640A]/10 to-transparent rounded-3xl blur-xl animate-pulse" />
          <div className="relative bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
            <img
              src="/ss4_logo.jpg"
              alt="SS4"
              className="h-12 sm:h-14 w-auto object-contain"
            />
          </div>
        </div>

        {/* Minimal Progress Track */}
        <div className="w-48 sm:w-56 flex flex-col items-center space-y-3">
          <div
            role="progressbar"
            aria-valuenow={Math.round(normalizedProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="w-full h-1 bg-slate-200/80 rounded-full overflow-hidden relative"
          >
            <div
              className="h-full bg-gradient-to-r from-[#155baa] to-[#E8640A] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${normalizedProgress || 20}%` }}
            />
          </div>

          {/* Clean minimal brand tag */}
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            SS4 Chess League
          </span>
        </div>
      </div>
    </div>
  );
}
