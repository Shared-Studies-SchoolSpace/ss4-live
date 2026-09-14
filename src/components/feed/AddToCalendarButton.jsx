import React, { useState, useRef, useEffect } from 'react';

/**
 * AddToCalendarButton Component
 * Allows users to add events directly to Google Calendar, Apple Calendar, or Outlook.
 */
export function AddToCalendarButton({ event = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const menuRef = useRef(null);

  const eventTitle = event.title || 'SS4 Chess League Varsity Tournament 2026';
  const eventDesc = event.description || 'Nigeria’s premier inter-university chess championship.';
  const eventLocation = event.location || 'Online (Chess.com & Lichess)';
  
  // Multi-day tournament: Sept 16 - Sept 30, 2026
  // Google Calendar all-day event end date is exclusive (20261001 spans through Sept 30)
  const gcalDates = '20260916/20261001';
  const outlookStart = '2026-09-16';
  const outlookEnd = '2026-09-30';

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Flash temporary feedback message
  const flashStatus = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleGoogleCalendar = () => {
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      eventTitle
    )}&dates=${gcalDates}&details=${encodeURIComponent(eventDesc)}&location=${encodeURIComponent(
      eventLocation
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    flashStatus('Opened Google Calendar');
  };

  const handleOutlookCalendar = () => {
    const url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
      eventTitle
    )}&body=${encodeURIComponent(eventDesc)}&startdt=${outlookStart}&enddt=${outlookEnd}&allday=true&location=${encodeURIComponent(
      eventLocation
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    flashStatus('Opened Outlook Calendar');
  };

  const handleIcsDownload = () => {
    const cleanDesc = eventDesc.replace(/\r\n|\r|\n/g, '\\n');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SS4//SS4 Varsity Tournament 2026//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@ss4league.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      'DTSTART;VALUE=DATE:20260916',
      'DTEND;VALUE=DATE:20261001',
      `SUMMARY:${eventTitle}`,
      `DESCRIPTION:${cleanDesc}`,
      `LOCATION:${eventLocation}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', 'SS4_Varsity_Tournament_2026.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);

    setIsOpen(false);
    flashStatus('Downloaded .ics event');
  };

  return (
    <div className={`relative inline-block ${isOpen ? 'z-50' : 'z-10'}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="feed-calendar-btn"
        aria-label="Add event to calendar"
        aria-expanded={isOpen}
      >
        <svg
          className="w-4 h-4 text-primary shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>Add to Calendar</span>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {statusMessage && (
        <div className="feed-calendar-status-badge">
          {statusMessage}
        </div>
      )}

      {isOpen && (
        <div className="feed-calendar-dropdown">
          <div className="px-2 py-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Add to your calendar
          </div>

          <button
            type="button"
            onClick={handleGoogleCalendar}
            className="feed-calendar-item"
          >
            <span className="w-5 h-5 rounded flex items-center justify-center bg-blue-50 text-blue-600 font-black text-[11px] shrink-0">
              G
            </span>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800">Google Calendar</span>
              <span className="text-[10px] text-slate-400 font-normal">Opens in new tab</span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleIcsDownload}
            className="feed-calendar-item"
          >
            <span className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 text-slate-700 shrink-0">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.98.6-2.62 1.35-.57.65-1.07 1.71-.93 2.73 1 .08 2.01-.48 2.63-1.23z" />
              </svg>
            </span>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800">Apple Calendar</span>
              <span className="text-[10px] text-slate-400 font-normal">Download .ics file</span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleOutlookCalendar}
            className="feed-calendar-item"
          >
            <span className="w-5 h-5 rounded flex items-center justify-center bg-sky-50 text-sky-600 font-black text-[11px] shrink-0">
              O
            </span>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800">Outlook (Web)</span>
              <span className="text-[10px] text-slate-400 font-normal">Opens Outlook online</span>
            </div>
          </button>

          <div className="border-t border-slate-100 my-1"></div>

          <button
            type="button"
            onClick={handleIcsDownload}
            className="feed-calendar-item"
          >
            <svg
              className="w-4 h-4 text-slate-500 shrink-0 ml-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <div className="flex flex-col ml-0.5">
              <span className="font-medium text-slate-600">Download .ics file</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
