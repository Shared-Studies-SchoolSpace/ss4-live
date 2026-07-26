import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../features/auth-portal/hooks/useAuth';
import { useAuthModal } from '../features/auth-portal/context/AuthModalContext';
import TournamentCountdownBanner from '../features/chess-league/components/TournamentCountdownBanner';
import AdminDrawer from './admin/AdminDrawer';

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);

  const { 
    user, 
    profile, 
    signOut, 
    unreadMessages = [],
    unreadNotificationsCount = 0,
    unreadAnnouncementsCount = 0,
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
      {/* Universal Admin Broadcast Drawer */}
      <AdminDrawer isOpen={isAdminDrawerOpen} onClose={() => setIsAdminDrawerOpen(false)} />

      {/* Tournament countdown  sits above the sticky nav bar */}
      <TournamentCountdownBanner />
      <header className="sticky top-0 z-50 w-full bg-white/75 backdrop-blur-lg border-b border-white/40 shadow-sm">
        <div className="container mx-auto px-3 sm:px-6 md:px-8 lg:px-12 xl:px-16 h-16 lg:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 lg:gap-6 xl:gap-8">
            <a href="/" className="flex items-center shrink-0 pr-2">
              <img src="/ss4_logo.jpg" alt="SS4" className="h-8 sm:h-9 md:h-10 lg:h-12 w-auto object-contain" />
            </a>
            
            {/* Primary Navigation Group - Equal spacing & hitboxes */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              <div className="relative group">
                <button className="px-3 py-2 rounded-xl hover:bg-black/[0.04] text-[13px] xl:text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors flex items-center gap-1 focus:outline-none cursor-pointer whitespace-nowrap">
                  Schools
                  <svg className="w-3.5 h-3.5 transition-transform duration-250 group-hover:rotate-180 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-[100%] left-0 mt-1 w-48 bg-white border border-gray-150 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
                  <a href="/schools" className="block px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-[#F6F4F0] hover:text-brand-primary transition-colors">Secondary Schools</a>
                  <a href="/tertiary" className="block px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-[#F6F4F0] hover:text-brand-primary transition-colors">Tertiary Institutions</a>
                </div>
              </div>
              <div className="relative group">
                <button className="px-3 py-2 rounded-xl hover:bg-black/[0.04] text-[13px] xl:text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors flex items-center gap-1 focus:outline-none cursor-pointer whitespace-nowrap">
                  Chess League
                  <svg className="w-3.5 h-3.5 transition-transform duration-250 group-hover:rotate-180 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-[100%] left-0 mt-1 w-48 bg-white border border-gray-150 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
                  <a href="/chess-league" className="block px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-[#F6F4F0] hover:text-brand-primary transition-colors">League Divisions</a>
                  <a href="/chess-league/tournament" className="block px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-[#F6F4F0] hover:text-brand-primary transition-colors">Monthly Tournament</a>
                </div>
              </div>
              <a href="/sas" className="px-3 py-2 rounded-xl hover:bg-black/[0.04] text-[13px] xl:text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors whitespace-nowrap">Assessment Series</a>
              <a href="/award" className="px-3 py-2 rounded-xl hover:bg-black/[0.04] text-[13px] xl:text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors whitespace-nowrap">Aspirants Award</a>
              <a href="/news" className="px-3 py-2 rounded-xl hover:bg-black/[0.04] text-[13px] xl:text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors whitespace-nowrap">News</a>
              <a href="/about" className="px-3 py-2 rounded-xl hover:bg-black/[0.04] text-[13px] xl:text-[14px] font-bold text-gray-700 hover:text-brand-primary transition-colors whitespace-nowrap">About</a>
            </nav>
          </div>

          {/* Action & Utility Group - Equal heights & gap spacing */}
          <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 shrink-0">
            <button className="hidden xl:inline-flex items-center h-9 sm:h-10 px-4 xl:px-5 border border-[#E8640A] text-[#E8640A] font-bold text-xs xl:text-sm rounded-xl hover:bg-[#E8640A]/5 transition-colors cursor-pointer whitespace-nowrap" onClick={() => window.location.href='/partner'}>
              Partner With Us
            </button>

            {/* Admin Quick Broadcast Button in Navbar */}
            {profile?.role === 'admin' && (
              <button
                onClick={() => setIsAdminDrawerOpen(true)}
                className="hidden sm:inline-flex items-center h-9 sm:h-10 gap-1.5 px-3.5 bg-brand-accent text-white text-xs font-black rounded-full hover:bg-brand-accent/90 transition-colors shadow-sm cursor-pointer uppercase tracking-wider whitespace-nowrap"
                title="Open Admin Broadcast Drawer"
              >
                <span>📢</span>
                <span className="hidden md:inline">Broadcast</span>
              </button>
            )}

            {/* Notifications Bell Dropdown */}
            {user && (
              <div className="relative flex items-center" ref={notifRef}>
                <button
                  onClick={() => {
                    setIsNotifOpen(!isNotifOpen);
                    setIsDropdownOpen(false);
                  }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-gray-100/80 border border-gray-150 transition-colors cursor-pointer relative focus:outline-none flex items-center justify-center shrink-0"
                  aria-label="Notifications"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 block h-4 px-1 min-w-[16px] bg-[#E8640A] text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-xs">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="fixed inset-x-3 sm:inset-auto sm:right-0 top-16 sm:top-full sm:mt-2 w-auto sm:w-80 max-w-sm bg-white border border-gray-150 rounded-2xl shadow-xl z-50 py-2 overflow-hidden text-left mx-auto sm:mx-0"
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
              <div className="relative flex items-center" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="h-9 sm:h-10 flex items-center gap-2 px-2.5 sm:px-3 rounded-full hover:bg-gray-100/80 border border-gray-150 transition-colors cursor-pointer focus:outline-none shrink-0"
                >
                  <div className="relative shrink-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#0B193C] to-brand-primary text-white font-black text-xs sm:text-sm flex items-center justify-center overflow-hidden shadow-2xs">
                      {profile?.avatar || profile?.chess_avatar || profile?.avatar_url ? (
                        <img 
                          src={profile.avatar || profile.chess_avatar || profile.avatar_url} 
                          alt={profile?.name || 'User Avatar'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        profile?.name?.charAt(0) || user.email.charAt(0).toUpperCase()
                      )}
                    </div>
                    {unreadMessages.length > 0 && (
                      <span className="absolute -top-1 -right-1 block h-4 w-4 bg-[#E8640A] text-white text-[8px] font-black rounded-full border-2 border-white flex items-center justify-center">
                        {unreadMessages.length}
                      </span>
                    )}
                  </div>
                  <span className="hidden xl:block text-xs font-black text-brand-text-dark max-w-[100px] truncate">
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
                      className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-24px)] bg-white border border-gray-150 rounded-2xl shadow-xl z-50 py-2.5 overflow-hidden"
                    >
                      <div className="px-4 py-2.5 border-b border-gray-100 mb-1 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0B193C] to-brand-primary text-white font-black text-xs flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                          {profile?.avatar || profile?.chess_avatar || profile?.avatar_url ? (
                            <img 
                              src={profile.avatar || profile.chess_avatar || profile.avatar_url} 
                              alt={profile?.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            profile?.name?.charAt(0) || user.email.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Signed In As</p>
                          <p className="text-xs font-bold font-space text-[#111111] truncate">{profile?.name || "Player"}</p>
                          <p className="text-[10px] font-medium text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      
                      <a href="/dashboard" className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-[#F6F4F0] hover:text-brand-primary transition-colors">
                        <div className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Dashboard & Profile</span>
                        </div>
                        {unreadMessages.length > 0 && (
                          <span className="bg-[#E8640A] text-white text-[9px] font-black px-2 py-0.5 rounded-full shrink-0">
                            {unreadMessages.length} unread
                          </span>
                        )}
                      </a>

                      {profile?.role === 'admin' && (
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsAdminDrawerOpen(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-50 transition-colors text-left cursor-pointer border-none bg-transparent"
                        >
                          <span className="text-sm">📢</span>
                          <span>Admin Broadcast Panel</span>
                        </button>
                      )}
                      
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer border-none bg-transparent">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('', null, 'login')}
                  className="px-4 py-2 text-xs font-bold text-brand-primary hover:text-brand-accent transition-colors cursor-pointer bg-transparent border-none"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('', null, 'register')}
                  className="px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-full hover:bg-brand-accent transition-colors shadow-sm cursor-pointer border-none"
                >
                  Sign Up
                </button>
              </div>
            )}
            
            {/* Mobile Hamburger Menu Toggle */}
            <button 
              id="mobile-menu-toggle"
              className="lg:hidden p-2 text-gray-600 hover:text-brand-primary transition-colors cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              ref={menuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-6 flex flex-col gap-2.5 overflow-hidden shadow-lg"
            >
              <a href="/" className="text-[13px] sm:text-[14px] font-bold text-gray-700 hover:text-brand-primary py-0.5" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
              <a href="/chess-league/tournament" className="text-[13px] sm:text-[14px] font-bold text-gray-700 hover:text-brand-primary py-0.5" onClick={() => setIsMobileMenuOpen(false)}>Monthly Tournament</a>
              <a href="/tertiary/admission" className="text-[13px] sm:text-[14px] font-bold text-gray-700 hover:text-brand-primary py-0.5" onClick={() => setIsMobileMenuOpen(false)}>Tertiary Admission</a>
              <a href="/award" className="text-[13px] sm:text-[14px] font-bold text-gray-700 hover:text-brand-primary py-0.5" onClick={() => setIsMobileMenuOpen(false)}>Aspirants Award</a>
              <a href="/news" className="text-[13px] sm:text-[14px] font-bold text-gray-700 hover:text-brand-primary py-0.5" onClick={() => setIsMobileMenuOpen(false)}>News</a>
              <a href="/about" className="text-[13px] sm:text-[14px] font-bold text-gray-700 hover:text-brand-primary py-0.5" onClick={() => setIsMobileMenuOpen(false)}>About</a>
              
              <a 
                href="/partner" 
                className="py-2.5 px-4 border border-[#E8640A] text-[#E8640A] font-bold text-xs sm:text-sm rounded-xl hover:bg-[#E8640A]/5 transition-colors text-center inline-block my-1" 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Partner With Us
              </a>

              <hr className="my-1 border-gray-100" />
              
              {user ? (
                <div className="bg-brand-bg-cream/80 border border-gray-200/80 rounded-2xl p-3.5 my-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0B193C] to-brand-primary text-white font-black text-sm flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                      {profile?.avatar || profile?.chess_avatar || profile?.avatar_url ? (
                        <img 
                          src={profile.avatar || profile.chess_avatar || profile.avatar_url} 
                          alt={profile?.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        profile?.name?.charAt(0) || user.email.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold font-space text-[#111111] truncate">{profile?.name || "Player"}</p>
                      <p className="text-[10px] font-medium text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-1 border-t border-gray-200/60">
                    <a 
                      href="/dashboard" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-[#1545A2] transition-all shadow-2xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Dashboard & Profile</span>
                      </div>
                      {unreadMessages.length > 0 && (
                        <span className="bg-[#E8640A] text-white text-[9px] font-black px-2 py-0.5 rounded-full shrink-0">
                          {unreadMessages.length} unread
                        </span>
                      )}
                    </a>

                    {profile?.role === 'admin' && (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsAdminDrawerOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-500/20 text-xs font-bold hover:bg-amber-500/20 transition-all text-left cursor-pointer"
                      >
                        <span className="text-sm">📢</span>
                        <span>Admin Broadcast Panel</span>
                      </button>
                    )}

                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }} 
                      className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200/60 text-xs font-bold hover:bg-red-100 transition-all text-left cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 mt-1">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal('', null, 'login');
                    }}
                    className="py-2.5 sm:py-3 border border-brand-primary/30 text-brand-primary font-bold text-xs sm:text-sm rounded-xl hover:bg-brand-primary/5 text-center cursor-pointer bg-transparent"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal('', null, 'register');
                    }}
                    className="py-2.5 sm:py-3 bg-brand-primary text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-brand-accent shadow-md text-center cursor-pointer border-none"
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
