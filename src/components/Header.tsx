import React, { useState } from 'react';
import {
  Search,
  Bookmark,
  Sparkles,
  Flame,
  Clock,
  Compass,
  Menu,
  X,
  Sliders,
  Layers,
  Scale,
  Users,
  BookOpen,
  Sun,
  Moon,
  User as UserIcon,
  LogIn,
  LogOut,
  Shield,
  ChevronDown
} from 'lucide-react';
import { useDiscovery } from '../context/DiscoveryContext';
import { useCMS } from '../context/CMSContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { PageRoute } from '../types/discovery';

export const Header: React.FC = () => {
  const {
    currentRoute,
    navigateTo,
    activeCategory,
    savedIds,
    compareItemIds,
    setIsSearchOpen,
    setIsSavedOpen,
    setIsInterestsManagerOpen,
    resetFeed
  } = useDiscovery();

  const { getPublicCategories, setIsAdminViewOpen } = useCMS();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, isAdmin, openAuthModal, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Dynamic public categories that obey CMS Active & Published rules
  const publicNavCategories = getPublicCategories('navigation');

  const getCategoryRoute = (categoryName: string): PageRoute => {
    const lower = categoryName.toLowerCase();
    if (lower.includes('ai')) return 'category-ai';
    if (lower.includes('tech')) return 'category-tech';
    if (lower.includes('movie') || lower.includes('tv')) return 'category-movies';
    if (lower.includes('manhwa') || lower.includes('anime')) return 'category-anime';
    return 'category-ai';
  };

  const handleRouteNav = (route: PageRoute) => {
    navigateTo(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full max-w-full bg-[#0a0d14]/95 backdrop-blur-md border-b border-zinc-800/80 transition-colors duration-200 overflow-x-clip">
      {/* Main Top Row: Fully fluid width, responsive padding and gaps */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
        
        {/* Brand Title (Zone 1) - Never compressed */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
          <button
            onClick={resetFeed}
            className="flex items-center gap-2 sm:gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-0.5 transition-transform"
            aria-label="PRISM Discovery Home"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
              <span className="text-zinc-950 font-black text-base tracking-tighter">P</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white font-sans whitespace-nowrap">
                PRISM
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50 whitespace-nowrap">
                DISCOVERY
              </span>
            </div>
          </button>
        </div>

        {/* Primary Page Navigation (Zone 2 - Desktop lg+) */}
        <nav className="hidden lg:flex items-center gap-1 bg-zinc-900/90 p-1 rounded-full border border-zinc-800/80 shadow-inner shrink-0">
          <button
            onClick={() => handleRouteNav('for-you')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              currentRoute === 'for-you'
                ? 'bg-emerald-500 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>For You</span>
          </button>

          <button
            onClick={() => handleRouteNav('trending')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              currentRoute === 'trending'
                ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5 shrink-0" />
            <span>Trending</span>
          </button>

          <button
            onClick={() => handleRouteNav('latest')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              currentRoute === 'latest'
                ? 'bg-cyan-500 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Latest</span>
          </button>

          <button
            onClick={() => handleRouteNav('directories')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              currentRoute === 'directories' ||
              currentRoute === 'directory-ai' ||
              currentRoute === 'directory-tech' ||
              currentRoute === 'directory-movies' ||
              currentRoute === 'directory-manhwa' ||
              currentRoute === 'directory-anime' ||
              currentRoute === 'directory-item' ||
              currentRoute === 'curated-list' ||
              currentRoute === 'compare'
                ? 'bg-purple-500 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>Directories</span>
          </button>

          <button
            onClick={() => handleRouteNav('community')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              currentRoute === 'community'
                ? 'bg-rose-500 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Community</span>
          </button>

          <button
            onClick={() => handleRouteNav('novels')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              currentRoute === 'novels'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>Novels & Manga</span>
          </button>
        </nav>

        {/* Fluid Search Bar on Desktop / Tablet (Fills empty area naturally) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="hidden md:flex items-center justify-between flex-1 max-w-xs xl:max-w-sm px-3.5 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition-all text-xs shadow-inner group min-w-0"
          title="Search discoveries (⌘K)"
        >
          <span className="flex items-center gap-2 min-w-0 truncate">
            <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-400 transition-colors shrink-0" />
            <span className="truncate">Search discoveries, AI, tech...</span>
          </span>
          <kbd className="hidden lg:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 shrink-0 ml-1">
            ⌘K
          </kbd>
        </button>

        {/* Action Controls Cluster (Zone 3) - Responsive & compact on mobile */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 min-w-0">
          
          {/* Mobile Search Button (< md) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-all shrink-0"
            title="Search discoveries"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {/* Active Compare Indicator */}
          {compareItemIds.length > 0 && (
            <button
              onClick={() => handleRouteNav('compare')}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 transition-all text-xs font-semibold shadow-sm shrink-0"
              title="View active comparison matrix"
            >
              <Scale className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xl:inline">Compare</span>
              <span className="w-4 h-4 rounded-full bg-cyan-400 text-zinc-950 font-black text-[10px] flex items-center justify-center shrink-0">
                {compareItemIds.length}
              </span>
            </button>
          )}

          {/* Interests Profile Trigger */}
          <button
            onClick={() => setIsInterestsManagerOpen(true)}
            className="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-emerald-400 border border-zinc-800 hover:border-zinc-700 transition-all text-xs font-medium shadow-sm group shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title="Manage Interests"
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-400 transition-colors shrink-0" />
            <span className="hidden sm:inline">Interests</span>
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 shrink-0" />
          </button>

          {/* Saved Discoveries Drawer Trigger */}
          <button
            onClick={() => setIsSavedOpen(true)}
            className="relative flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-all text-xs font-medium shadow-sm group shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title="View saved discoveries"
          >
            <Bookmark className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-400 transition-colors shrink-0" />
            <span className="hidden sm:inline">Saved</span>
            {savedIds.length > 0 && (
              <span className="flex items-center justify-center min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-1 text-[9px] sm:text-[10px] font-bold rounded-full bg-emerald-500 text-zinc-950 shrink-0">
                {savedIds.length}
              </span>
            )}
          </button>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 border border-zinc-800 hover:border-zinc-700 transition-all shadow-sm group shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle light and dark theme"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* User Account / Authentication */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-all text-xs font-semibold shadow-sm shrink-0 cursor-pointer"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-5 h-5 rounded-full object-cover bg-zinc-800 shrink-0"
                />
                <span className="hidden sm:inline max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                {isAdmin && (
                  <span className="hidden md:inline text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 uppercase">
                    Admin
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0e121a] border border-zinc-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  <div className="px-3 py-2 border-b border-zinc-850">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {user.role}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Active</span>
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setIsAdminViewOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-emerald-400 hover:bg-emerald-950/40 transition-colors text-left cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Admin CMS Console</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setIsSavedOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:bg-zinc-850 hover:text-white transition-colors text-left cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Saved Discoveries ({savedIds.length})</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleRouteNav('novels');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:bg-zinc-850 hover:text-white transition-colors text-left cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                    <span>My Reading & Stories</span>
                  </button>

                  <div className="pt-1 border-t border-zinc-850">
                    <button
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
              title="Sign in to your PRISM account"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Navigation Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Public Categories & Filter Chips Sub-Bar (Directly below Header) */}
      <div className="w-full max-w-full border-t border-zinc-800/60 bg-zinc-950/60 backdrop-blur-sm overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-w-0">
          <div className="w-full flex items-center gap-1.5 sm:gap-2.5 py-2 sm:py-2.5 overflow-x-auto no-scrollbar scroll-smooth min-w-0">
            <button
              onClick={() => handleRouteNav('for-you')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                currentRoute === 'for-you' && activeCategory === 'All'
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span>All Stream</span>
            </button>

            <button
              onClick={() => handleRouteNav('community')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                currentRoute === 'community'
                  ? 'bg-rose-500 text-white font-semibold shadow-sm'
                  : 'text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>Community</span>
            </button>

            <button
              onClick={() => handleRouteNav('novels')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                currentRoute === 'novels'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>Novels & Manga</span>
            </button>

            <button
              onClick={() => handleRouteNav('directories')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                currentRoute === 'directories'
                  ? 'bg-purple-500 text-white font-semibold shadow-sm'
                  : 'text-purple-300 hover:text-white bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>Directories & Top Lists</span>
            </button>

            {/* Dynamic Active & Published categories from CMS */}
            {publicNavCategories.map((category) => {
              const catRoute = getCategoryRoute(category.name);
              const isSelected = currentRoute === catRoute || activeCategory === category.name;
              return (
                <button
                  key={category.id}
                  onClick={() => handleRouteNav(catRoute)}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-emerald-500 text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800/60'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-zinc-800 bg-[#0a0d14]/98 backdrop-blur-xl px-4 py-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 px-3 tracking-wider">
              Discovery Channels
            </span>
            <button
              onClick={() => handleRouteNav('for-you')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentRoute === 'for-you' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>For You Feed</span>
            </button>
            <button
              onClick={() => handleRouteNav('trending')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentRoute === 'trending' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Trending Velocity</span>
            </button>
            <button
              onClick={() => handleRouteNav('latest')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentRoute === 'latest' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Latest Drops</span>
            </button>
            <button
              onClick={() => handleRouteNav('directories')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentRoute === 'directories' ? 'bg-purple-500/20 text-purple-300 font-bold' : 'text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Directories & Top Lists</span>
            </button>
            <button
              onClick={() => handleRouteNav('community')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentRoute === 'community' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <Users className="w-4 h-4 text-rose-400" />
              <span>Community Discovery</span>
            </button>
            <button
              onClick={() => handleRouteNav('novels')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                currentRoute === 'novels' ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Web Novels & Manga</span>
            </button>
          </div>

          <div className="pt-2 border-t border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-xs font-medium text-zinc-300 flex items-center gap-2">
                {resolvedTheme === 'dark' ? (
                  <Moon className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
                <span>Appearance: <strong className="capitalize text-white">{resolvedTheme} Mode</strong></span>
              </span>
              <button
                onClick={toggleTheme}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-100 transition-colors"
              >
                Switch to {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>

            {/* Mobile Auth Button */}
            {user ? (
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover bg-zinc-800"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <span className="text-[10px] text-zinc-400 capitalize">{user.role}</span>
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setIsAdminViewOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold"
                    >
                      Admin
                    </button>
                  )}
                </div>
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                  }}
                  className="w-full py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold text-center"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('login');
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Create Account</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

