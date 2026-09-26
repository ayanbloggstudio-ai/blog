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
import { Header } from './components/Header';
import { SearchModal } from './components/SearchModal';
import { SavedDrawer } from './components/SavedDrawer';
import { OnboardingModal } from './components/OnboardingModal';
import { InterestsManagerModal } from './components/InterestsManagerModal';
import { ToastContainer } from './components/ToastContainer';
import { Footer } from './components/Footer';

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
  const { isAdminViewOpen } = useCMS();

  // If Admin CMS mode is active, render the dedicated single-operator CMS suite
  if (isAdminViewOpen) {
    return (
      <div className="min-h-screen bg-[#06080d] text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-zinc-950">
        <AdminLayout />
        <ToastContainer />
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
      <ToastContainer />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}
