import { CMSContentItem } from '../types/cms';
import { DiscoveryItem, CategoryType } from '../types/discovery';
import { DirectoryItem, DirectoryCategory, BestForLabel, PricingModel } from '../types/directory';

export const cmsToDiscoveryItem = (c: CMSContentItem): DiscoveryItem => {
  return {
    id: c.id,
    title: c.title,
    tagline: c.tagline || c.title,
    category: (c.category as CategoryType) || 'AI & Tools',
    subcategory: c.subcategory || 'AI',
    quickScan: {
      whatItIs: c.whatItIs || c.summary || c.tagline,
      whyItMatters: c.whyItMatters || c.tagline,
      keyPoints: c.keyPoints && c.keyPoints.length > 0 ? c.keyPoints : [c.tagline],
      readingTimeSeconds: 35
    },
    coverImage: c.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    gallery: c.galleryImages && c.galleryImages.length > 0
      ? c.galleryImages.map((url, idx) => ({ id: `${c.id}-g-${idx}`, url, caption: c.title }))
      : [{ id: `${c.id}-g-0`, url: c.coverImage, caption: c.title }],
    tags: c.tags && c.tags.length > 0 ? c.tags : ['Featured'],
    author: {
      name: c.authorName || 'PRISM Editorial Staff',
      avatar: c.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      role: c.authorRole || 'Lead Curator'
    },
    scanTime: c.scanTime || '30s scan',
    readTime: c.readTime || '3 min read',
    publishedAt: c.publishedAt || new Date().toISOString().split('T')[0],
    heatScore: c.heatScore || 88,
    metrics: {
      sparks: 124,
      saves: 48,
      views: 1420,
      shares: 18
    },
    featured: Boolean(c.featured),
    aspectRatio: c.aspectRatio || 'video',
    summary: c.summary || c.tagline,
    externalSource: {
      name: c.officialUrl ? 'Official Website' : 'Documentation',
      url: c.officialUrl || c.externalUrl || 'https://prismdiscovery.io'
    },
    visualBreakdown: c.specs?.map((s) => ({ label: s.label, value: s.value, highlight: false })) || [
      { label: 'Platform', value: c.platformOrFormat || 'Web', highlight: true },
      { label: 'Pricing', value: c.pricing || 'Free tier', highlight: false }
    ]
  };
};

export const cmsToDirectoryItem = (c: CMSContentItem): DirectoryItem => {
  const dirCategory: DirectoryCategory = 
    c.contentType === 'ai-tool' ? 'ai-tools' :
    c.contentType === 'tech-product' ? 'tech-products' :
    c.contentType === 'movie' ? 'movies' :
    c.contentType === 'manhwa' ? 'manhwa' :
    c.contentType === 'anime' ? 'anime' : 'ai-tools';

  return {
    id: c.id,
    slug: c.slug || c.id,
    title: c.title,
    tagline: c.tagline || c.title,
    description: c.summary || c.tagline,
    category: dirCategory,
    categoryName: c.category,
    bestFor: (c.bestFor as BestForLabel) || 'Best for creators',
    pricing: c.pricing || 'Free & Paid Tiers',
    pricingType: 'Freemium' as PricingModel,
    releaseOrVersion: c.releaseOrVersion || 'v1.0',
    platformOrFormat: c.platformOrFormat || 'Web',
    whoItsFor: c.whoItsFor || c.whatItIs || c.summary,
    keyHighlights: c.keyHighlights && c.keyHighlights.length > 0 ? c.keyHighlights : c.keyPoints || [],
    pros: c.pros && c.pros.length > 0 ? c.pros : ['High precision execution', 'Modern ergonomic design'],
    considerations: c.considerations && c.considerations.length > 0 ? c.considerations : ['Continuous cloud sync recommended'],
    officialWebsite: c.officialUrl || 'https://prismdiscovery.io',
    externalLinks: [
      ...(c.officialUrl ? [{ label: 'Official Website', url: c.officialUrl, type: 'official' as const }] : []),
      ...(c.externalUrl ? [{ label: 'Documentation / Specs', url: c.externalUrl, type: 'docs' as const }] : []),
      ...(c.affiliateUrl ? [{ label: 'Partner Access', url: c.affiliateUrl, type: 'affiliate' as const, isAffiliate: true }] : [])
    ],
    coverImage: c.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    galleryImages: c.galleryImages && c.galleryImages.length > 0 ? c.galleryImages : [c.coverImage],
    quickSpecs: c.specs && c.specs.length > 0 ? c.specs : [
      { label: 'Platform', value: c.platformOrFormat || 'Web' },
      { label: 'Pricing', value: c.pricing || 'Free tier' }
    ],
    alternatives: [],
    compareWithIds: [],
    scanTimeSeconds: 30,
    badges: c.tags || []
  };
};
