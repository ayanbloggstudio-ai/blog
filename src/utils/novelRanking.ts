/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NovelItem } from '../types/novel';

/**
 * Calculates a dynamic trending velocity score for a novel or manga.
 * Does not rank purely by lifetime views. Combines:
 * - Weekly recent reads (velocity factor)
 * - Recent reader likes
 * - Bookmark saves (high intent signal)
 * - Community discussions & comments
 * - Reader completion rate
 * - Days since last chapter update
 */
export function calculateNovelTrendingScore(novel: NovelItem): number {
  const views = typeof novel.views === 'number' && !isNaN(novel.views) ? novel.views : 0;
  const weeklyReads = novel.weeklyReads ?? Math.round(views * 0.18);
  const likes = typeof novel.likes === 'number' && !isNaN(novel.likes) ? novel.likes : 0;
  const saves = typeof novel.saves === 'number' && !isNaN(novel.saves) ? novel.saves : 0;
  const comments = typeof novel.commentsCount === 'number' && !isNaN(novel.commentsCount) ? novel.commentsCount : 0;
  const completionRate = typeof novel.completionRate === 'number' && !isNaN(novel.completionRate) ? novel.completionRate : 0.72; // default 72%

  // Recency decay based on last update date
  const now = Date.now();
  const updateTime = novel.lastUpdatedAt ? new Date(novel.lastUpdatedAt).getTime() : now;
  const daysSinceUpdate = isNaN(updateTime) ? 0 : Math.max(0, (now - updateTime) / (1000 * 60 * 60 * 24));
  const recencyMultiplier = Math.max(0.5, 1.4 - daysSinceUpdate * 0.05);

  // Engagement quality weighting
  const readWeight = (weeklyReads || 0) * 0.65;
  const likeWeight = likes * 1.5;
  const saveWeight = saves * 2.8; // saves reflect strong reading dedication
  const commentWeight = comments * 2.2; // active discussion
  const completionBonus = (completionRate * 100) * 1.5;

  const rawScore = (readWeight + likeWeight + saveWeight + commentWeight + completionBonus) * recencyMultiplier;

  return isNaN(rawScore) ? 0 : Math.round(rawScore);
}

/**
 * Sorts novels according to selected filter criteria
 */
export function sortNovels(novels: NovelItem[], sortBy: 'trending' | 'popular' | 'latest' | 'top-rated'): NovelItem[] {
  const list = [...novels];
  switch (sortBy) {
    case 'trending':
      return list.sort((a, b) => {
        const scoreA = a.trendingScore ?? calculateNovelTrendingScore(a);
        const scoreB = b.trendingScore ?? calculateNovelTrendingScore(b);
        return scoreB - scoreA;
      });
    case 'popular':
      return list.sort((a, b) => b.views - a.views);
    case 'latest':
      return list.sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());
    case 'top-rated':
      return list.sort((a, b) => {
        if (b.rating === a.rating) {
          return b.ratingCount - a.ratingCount;
        }
        return b.rating - a.rating;
      });
    default:
      return list;
  }
}
