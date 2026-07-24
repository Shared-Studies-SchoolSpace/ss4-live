import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminBroadcastPanel from '../announcements/AdminBroadcastPanel';

export default function AdminDrawer({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto z-10 flex flex-col"
          >
            {/* Header Bar */}
            <div className="p-4 bg-brand-primary text-white flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">📢</span>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider font-space">
                    Admin Broadcast Center
                  </h3>
                  <p className="text-[9px] text-white/80 font-bold">
                    Global & Targeted Notifications
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white text-sm font-black cursor-pointer border-none bg-transparent"
                aria-label="Close Admin Drawer"
              >
                ✕
              </button>
            </div>

            {/* Panel Body */}
            <div className="p-4 sm:p-6 flex-grow bg-gray-50/50">
              <AdminBroadcastPanel onClose={onClose} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
