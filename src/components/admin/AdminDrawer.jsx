import React from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import AdminBroadcastPanel from '../announcements/AdminBroadcastPanel';

export default function AdminDrawer({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Overlay */}
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Content */}
          <Motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto z-10 flex flex-col scroll-smooth overscroll-contain [-webkit-overflow-scrolling:touch]"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/* Header Bar */}
            <div className="p-3.5 sm:p-4 bg-brand-primary text-white flex items-center justify-between shadow-md shrink-0 border-b border-white/10">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl shrink-0">📢</span>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider font-space truncate">
                    Admin Broadcast Center
                  </h3>
                  <p className="text-[10px] text-white/80 font-semibold truncate">
                    Global & Targeted Notifications
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-white/20 active:bg-white/30 transition-colors text-white text-base font-black cursor-pointer border-none bg-transparent shrink-0 focus:outline-none focus:ring-2 focus:ring-white/40"
                aria-label="Close Admin Drawer"
              >
                ✕
              </button>
            </div>

            {/* Panel Body */}
            <div 
              className="p-3 sm:p-6 flex-grow bg-gray-50/50 overflow-y-auto max-w-full [-webkit-overflow-scrolling:touch] space-y-4"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-space">Varsity Season 2</div>
                  <div className="text-xs font-black text-slate-800 truncate">Upload Next Match Day Link</div>
                </div>
                <Link
                  to="/admin/varsity"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-xl bg-brand-primary hover:bg-primary-hover text-white text-xs font-bold shrink-0 transition-colors inline-flex items-center gap-1"
                >
                  <span>Open</span>
                  <span>&rarr;</span>
                </Link>
              </div>
              <AdminBroadcastPanel onClose={onClose} />
            </div>
          </Motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
