import React from 'react';

/**
 * LoadingScreen
 * Displays the SS4 loading state with:
 * 1. Logo image (ss4_logo_without_text.jpg)
 * 2. A slim, blue, highly accurate progress loading bar positioned directly below the image.
 */
export default function LoadingScreen({ progress = 0, status = '' }) {
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center font-nunito selection:bg-gray-200 p-4">
      <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-sm w-full">
        {/* SS4 Logo Image (without text) */}
        <div className="relative flex items-center justify-center">
          <img
            src="/ss4_logo_without_text.jpg"
            alt="SS4 Logo"
            className="w-24 sm:w-32 md:w-36 h-auto object-contain select-none animate-pulse duration-1000"
          />
        </div>

        {/* Slim Blue Loading Bar Track below the image */}
        <div className="w-48 sm:w-64 md:w-72 flex flex-col space-y-1.5">
          <div 
            role="progressbar"
            aria-valuenow={Math.round(normalizedProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
            className="w-full h-1.5 sm:h-2 bg-gray-150 rounded-full overflow-hidden relative shadow-inner"
          >
            <div
              className="h-full bg-[#155baa] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${normalizedProgress}%` }}
            />
          </div>

          {/* Accurate Progress indicator */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold text-gray-500 tracking-wide px-0.5">
            <span className="truncate max-w-[140px] sm:max-w-[180px] opacity-80">{status || "Loading..."}</span>
            <span className="text-[#155baa] font-bold font-mono ml-2 shrink-0">{Math.round(normalizedProgress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
