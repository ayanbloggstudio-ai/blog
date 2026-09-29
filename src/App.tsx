/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CMSProvider, useCMS } from './context/CMSContext';
import { DiscoveryProvider, useDiscovery } from './context/DiscoveryContext';
import { CommunityProvider } from './context/CommunityContext';
import { NovelProvider } from './context/NovelContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { SearchModal } from './components/SearchModal';
import { SavedDrawer } from './components/SavedDrawer';
import { OnboardingModal } from './components/OnboardingModal';
import { InterestsManagerModal } from './components/InterestsManagerModal';
import { ToastContainer } from './components/ToastContainer';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { ShieldAlert } from 'lucide-react';

// Public Pages
import { ForYouPage } from './pages/ForYouPage';
import { TrendingPage } from './pages/TrendingPage';
import { LatestPage } from './pages/LatestPage';
import { AICategoryPage } from './pages/AICategoryPage';
import { TechCategoryPage } from './pages/TechCategoryPage';
import { MoviesCategoryPage } from './pages/MoviesCategoryPage';
import { AnimeCategoryPage } from './pages/AnimeCategoryPage';
import { ContentDetailPage } from './pages/ContentDetailPage';
import { SearchPage } from './pages/SearchPage';

// Structured Directory Pages
import { DirectoryIndexPage } from './pages/DirectoryIndexPage';
import { DirectoryItemDetailPage } from './pages/DirectoryItemDetailPage';
import { CuratedListPage } from './pages/CuratedListPage';
import { ComparisonPage } from './pages/ComparisonPage';

// Community Layer Page
import { CommunityFeedPage } from './pages/CommunityFeedPage';

// Web Novel & Manga Portal
import { NovelPortalPage } from './pages/NovelPortalPage';

// Admin CMS Layout
import { AdminLayout } from './pages/admin/AdminLayout';

const PageRouter: React.FC = () => {
  const { currentRoute } = useDiscovery();

  switch (currentRoute) {
    case 'for-you':
      return <ForYouPage />;
    case 'trending':
      return <TrendingPage />;
    case 'latest':
      return <LatestPage />;
    case 'category-ai':
      return <AICategoryPage />;
    case 'category-tech':
      return <TechCategoryPage />;
    case 'category-movies':
      return <MoviesCategoryPage />;
    case 'category-anime':
      return <AnimeCategoryPage />;
    case 'detail':
      return <ContentDetailPage />;
    case 'search':
      return <SearchPage />;
    
    // Structured Directories
    case 'directories':
      return <DirectoryIndexPage initialCategory="all" />;
    case 'directory-ai':
      return <DirectoryIndexPage initialCategory="ai-tools" />;
    case 'directory-tech':
      return <DirectoryIndexPage initialCategory="tech-products" />;
    case 'directory-movies':
      return <DirectoryIndexPage initialCategory="movies" />;
    case 'directory-manhwa':
      return <DirectoryIndexPage initialCategory="manhwa" />;
    case 'directory-anime':
      return <DirectoryIndexPage initialCategory="anime" />;
    case 'directory-item':
      return <DirectoryItemDetailPage />;
    case 'curated-list':
      return <CuratedListPage />;
    case 'compare':
      return <ComparisonPage />;

    // Community Layer
    case 'community':
      return <CommunityFeedPage />;

    // Web Novel & Manga Vertical
    case 'novels':
      return <NovelPortalPage />;

    default:
      return <ForYouPage />;
  }
};

const DiscoveryApp: React.FC = () => {
  const { isAdminViewOpen, setIsAdminViewOpen } = useCMS();
  const { user, isAdmin, openAuthModal } = useAuth();

  // If Admin CMS mode is requested, enforce strict role authorization
  if (isAdminViewOpen) {
    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-[#06080d] text-zinc-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0e121a] p-8 rounded-3xl border border-zinc-800 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {user
                ? `You are signed in as ${user.name} (${user.email}) with the role of '${user.role}'. Only verified administrators can access the PRISM CMS and Moderation Console.`
                : 'The PRISM Administration Console is protected. Please sign in with an Administrator account.'}
            </p>
            <div className="pt-3 flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                onClick={() => setIsAdminViewOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Return to Public Website
              </button>
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-colors cursor-pointer shadow-md shadow-emerald-500/20"
              >
                {user ? 'Switch to Admin Account' : 'Sign In as Administrator'}
              </button>
            </div>
          </div>
          <AuthModal />
          <ToastContainer />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#06080d] text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-zinc-950">
        <AdminLayout />
        <ToastContainer />
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-[#07090e] text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-zinc-950">
      {/* Sticky Top Header */}
      <Header />

      {/* Main Page View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 min-w-0">
        <PageRouter />
      </main>

      {/* Global Interactive Overlays & Personalization Modals */}
      <OnboardingModal />
      <InterestsManagerModal />
      <SearchModal />
      <SavedDrawer />
      <AuthModal />
      <ToastContainer />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CMSProvider>
          <CommunityProvider>
            <NovelProvider>
              <AnalyticsProvider>
                <DiscoveryProvider>
                  <DiscoveryApp />
                </DiscoveryProvider>
              </AnalyticsProvider>
            </NovelProvider>
          </CommunityProvider>
        </CMSProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
