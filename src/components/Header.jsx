import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useAuthModal } from '../context/AuthModalContext';
import TournamentCountdownBanner from './announcements/TournamentCountdownBanner';

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const { 
    user, 
    profile, 
    signOut, 
    unreadMessages = [],
    notifications = [],
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useAuth();
  
  const { openAuthModal } = useAuthModal();

  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Close menu & dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const toggleButton = document.getElementById('mobile-menu-toggle');
      if (toggleButton && toggleButton.contains(event.target)) {
        return;
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen, isDropdownOpen, isNotifOpen]);

  const handleLogout = async () => {
    await signOut();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setIsNotifOpen(false);
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const diff = new Date() - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <>
      {/* Tournament countdown — sits above the sticky nav bar */}
      <TournamentCountdownBanner />
      <header className="sticky top-0 z-50 w-full bg-white/75 backdrop-blur-lg border-b border-white/40 shadow-sm">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 h-16 lg:h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <a href="/" className="flex items-center">
              <img src="/ss4_logo.jpg" alt="SS4" className="h-10 lg:h-12" />
            </a>
            
            <nav className="hidden lg:flex items-center gap-8">
              <div className="relative group py-2">
                <button className="text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors flex items-center gap-1 focus:outline-none cursor-pointer">
                  Schools
                  <svg className="w-3.5 h-3.5 transition-transform duration-250 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-[100%] left-0 mt-1 w-48 bg-white border border-gray-150 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
                  <a href="/schools" className="block px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-[#F6F4F0] hover:text-brand-primary transition-colors">Secondary Schools</a>
                  <a href="/tertiary" className="block px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-[#F6F4F0] hover:text-brand-primary transition-colors">Tertiary Institutions</a>
                </div>
              </div>
              <div className="relative group py-2">
                <button className="text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors flex items-center gap-1 focus:outline-none cursor-pointer">
                  Chess League
                  <svg className="w-3.5 h-3.5 transition-transform duration-250 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-[100%] left-0 mt-1 w-48 bg-white border border-gray-150 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
                  <a href="/chess-league" className="block px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-[#F6F4F0] hover:text-brand-primary transition-colors">League Divisions</a>
                  <a href="/chess-league/tournament" className="block px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-[#F6F4F0] hover:text-brand-primary transition-colors">Monthly Tournament</a>
                </div>
              </div>
              <a href="/sas" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors">Assessment Series</a>
              <a href="/award" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors">Aspirants Award</a>
              <a href="/news" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors">News</a>
              <a href="/about" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors">About</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden md:block px-5 py-2 border border-[#E8640A] text-[#E8640A] font-bold text-sm rounded-full hover:bg-[#E8640A]/5 transition-colors cursor-pointer" onClick={() => window.location.href='/partner'}>
              Partner With Us
            </button>

            {/* Notifications Bell Dropdown */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => {
                    setIsNotifOpen(!isNotifOpen);
                    setIsDropdownOpen(false);
                  }}
                  className="p-2 rounded-full hover:bg-gray-50 border border-gray-100 transition-colors cursor-pointer relative focus:outline-none flex items-center justify-center"
                  aria-label="Notifications"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notifications.filter(n => !n.read_at).length > 0 && (
                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-brand-accent ring-2 ring-white animate-pulse" />
                  )}
                </button>

                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-[-60px] md:right-0 mt-2 w-80 bg-white border border-gray-150 rounded-2xl shadow-xl z-50 py-2 overflow-hidden text-left"
                    >
                      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between mb-1.5">
                        <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Notifications</p>
                        {notifications.filter(n => !n.read_at).length > 0 && (
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="text-[9px] font-black text-brand-primary uppercase hover:underline focus:outline-none cursor-pointer border-none bg-transparent"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto no-scrollbar pr-1">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs font-semibold text-gray-400 italic">
                            All caught up! No notifications.
                          </div>
                        ) : (
                          notifications.map((n) => {
                            const isUnread = !n.read_at;
                            return (
                              <button
                                key={n.id}
                                onClick={async () => {
                                  if (isUnread) await markNotificationAsRead(n.id);
                                  setIsNotifOpen(false);
                                  if (n.link) {
                                    window.location.href = n.link;
                                  }
                                }}
                                className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-[#F6F4F0] transition-colors border-b border-gray-50 text-left focus:outline-none cursor-pointer relative ${
                                  isUnread ? 'bg-brand-bg-cream/35 font-bold' : 'opacity-80'
                                }`}
                              >
                                <span className="text-base shrink-0 mt-0.5">
                                  {n.type === 'opponent_assigned' ? '♟' : 
                                   n.type === 'rating_update' ? '📊' : 
                                   n.type === 'announcement' ? '📢' : '🏆'}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-xs font-black text-brand-text-dark leading-tight">{n.title}</h4>
                                  <p className="text-[10px] font-semibold text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1.5 block">
                                    {formatRelativeTime(n.created_at)}
                                  </span>
                                </div>
                                {isUnread && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-brand-accent shrink-0 mt-1.5" />
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Auth Dropdown or Sign In Button */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-50 border border-gray-100 transition-colors cursor-pointer focus:outline-none"
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary to-brand-accent text-white font-black text-sm flex items-center justify-center shadow-sm">
                      {profile?.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </div>
                    {unreadMessages.length > 0 && (
                      <span className="absolute -top-1 -right-1 block h-4 w-4 bg-[#E8640A] text-white text-[8px] font-black rounded-full border-2 border-white flex items-center justify-center">
                        {unreadMessages.length}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:block text-xs font-black text-brand-text-dark max-w-[100px] truncate">
                    {profile?.name || "Player"}
                  </span>
                  <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-gray-150 rounded-2xl shadow-xl z-50 py-2 overflow-hidden"
                    >
                      <div className="px-4 py-2 border-b border-gray-100 mb-1.5">
                        <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Signed In As</p>
                        <p className="text-xs font-black text-brand-text-dark truncate mt-0.5">{profile?.name || user.email}</p>
                        <p className="text-[10px] font-semibold text-gray-400 truncate">{user.email}</p>
                      </div>
                      
                      <a href="/dashboard" className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-[#F6F4F0] hover:text-brand-primary transition-colors">
                        <div className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Dashboard & Profile
                        </div>
                        {unreadMessages.length > 0 && (
                          <span className="bg-[#E8640A] text-white text-[8.5px] font-black px-2 py-0.5 rounded-full shrink-0">
                            {unreadMessages.length} unread
                          </span>
                        )}
                      </a>
                      
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-brand-accent hover:bg-red-50 transition-colors text-left cursor-pointer border-none bg-transparent">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openAuthModal('', null, 'login')}
                  className="px-5 py-2 text-brand-primary hover:text-brand-accent font-bold text-sm transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('', null, 'register')}
                  className="px-6 py-2 bg-brand-primary text-white font-bold text-sm rounded-full hover:bg-brand-accent transition-colors shadow-md hover:shadow-lg cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            )}
            
            {/* Mobile menu toggle */}
            <button 
              id="mobile-menu-toggle"
              className="lg:hidden p-2 text-brand-primary focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <motion.span
                  animate={isMobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                  className="w-full h-0.5 bg-current rounded-full origin-center"
                />
                <motion.span
                  animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="w-full h-0.5 bg-current rounded-full"
                />
                <motion.span
                  animate={isMobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                  className="w-full h-0.5 bg-current rounded-full origin-center"
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              ref={menuRef}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-[100%] left-0 w-full bg-white border-b border-gray-100 shadow-xl p-6 flex flex-col gap-4 z-40 text-left"
            >
              {user && (
                <div className="bg-[#F6F4F0] p-4 rounded-2xl mb-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-primary to-brand-accent text-white font-black text-lg flex items-center justify-center">
                    {profile?.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-brand-text-dark leading-tight">{profile?.name || "Player"}</h4>
                    <p className="text-[10px] font-semibold text-gray-400 mt-0.5">{user.email}</p>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Schools Directory</span>
                <a href="/schools" className="pl-4 text-[14px] font-bold text-gray-700 hover:text-brand-primary" onClick={() => setIsMobileMenuOpen(false)}>Secondary Schools</a>
                <a href="/tertiary" className="pl-4 text-[14px] font-bold text-gray-700 hover:text-brand-primary" onClick={() => setIsMobileMenuOpen(false)}>Tertiary Institutions</a>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Chess League</span>
                <a href="/chess-league" className="pl-4 text-[14px] font-bold text-gray-700 hover:text-brand-primary" onClick={() => setIsMobileMenuOpen(false)}>League Divisions</a>
                <a href="/chess-league/tournament" className="pl-4 text-[14px] font-bold text-gray-700 hover:text-brand-primary" onClick={() => setIsMobileMenuOpen(false)}>Monthly Tournament</a>
              </div>
              <a href="/sas" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary" onClick={() => setIsMobileMenuOpen(false)}>Assessment Series</a>
              <a href="/award" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary" onClick={() => setIsMobileMenuOpen(false)}>Aspirants Award</a>
              <a href="/news" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary" onClick={() => setIsMobileMenuOpen(false)}>News</a>
              <a href="/about" className="text-[14px] font-bold text-gray-700 hover:text-brand-primary" onClick={() => setIsMobileMenuOpen(false)}>About</a>
              
              <hr className="my-2 border-gray-100" />
              
              {user ? (
                <>
                  <a href="/dashboard" className="py-2.5 text-[14px] font-bold text-gray-700 hover:text-brand-primary flex items-center justify-between" onClick={() => setIsMobileMenuOpen(false)}>
                    <span>My Dashboard & Profile</span>
                    {unreadMessages.length > 0 && (
                      <span className="bg-[#E8640A] text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                        {unreadMessages.length} unread
                      </span>
                    )}
                  </a>
                  <button onClick={handleLogout} className="py-2.5 text-[14px] font-bold text-brand-accent text-left cursor-pointer border-none bg-transparent">
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2.5 mt-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal('', null, 'login');
                    }}
                    className="py-3 border border-brand-primary/30 text-brand-primary font-bold rounded-full hover:bg-brand-primary/5 text-center cursor-pointer bg-transparent"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal('', null, 'register');
                    }}
                    className="py-3 bg-brand-primary text-white font-bold rounded-full hover:bg-brand-accent shadow-md text-center cursor-pointer border-none"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};
