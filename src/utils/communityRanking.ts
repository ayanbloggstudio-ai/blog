import { CommunityProduct, CommunityComment, CommunityProductStats, CommunitySortFilter } from '../types/community';

/**
 * Calculates a multi-factor community ranking and trending velocity score.
 * Formula does not rely solely on lifetime likes. It factors in:
 * 1. Saves (strong signal of high intent & utility)
 * 2. Discussion depth & review comments
 * 3. Recent activity velocity (decaying recency)
 * 4. Engagement quality (verified star ratings, review substance, helpful feedback, low report ratio)
 */
export function calculateProductStats(
  product: CommunityProduct,
  comments: CommunityComment[],
  isLiked: boolean,
  isSaved: boolean
): CommunityProductStats {
  const publishedComments = comments.filter(
    (c) => c.productId === product.id && c.status === 'published' && !c.isUserHidden
  );

  const ratedComments = publishedComments.filter((c) => typeof c.rating === 'number' && !isNaN(c.rating) && c.rating > 0);
  const ratingCount = ratedComments.length;
  const rawAvg =
    ratingCount > 0
      ? ratedComments.reduce((acc, c) => acc + (c.rating || 0), 0) / ratingCount
      : null;
  const averageRating = rawAvg !== null && !isNaN(rawAvg) ? Number(rawAvg.toFixed(1)) : null;

  const totalLikes = (product.initialLikes || 0) + (isLiked ? 1 : 0);
  const totalSaves = (product.initialSaves || 0) + (isSaved ? 1 : 0);
  const commentCount = publishedComments.length;

  // Calculate Engagement Quality Score (0 to 100)
  let qualityPoints = 50; // Neutral baseline
  if (averageRating !== null) {
    if (averageRating >= 4.5) qualityPoints += 25;
    else if (averageRating >= 4.0) qualityPoints += 15;
    else if (averageRating < 3.0) qualityPoints -= 20;
  }

  // Bonus for substantial thoughtful comments
  const substantialCommentsCount = publishedComments.filter((c) => c.content.length > 50).length;
  qualityPoints += Math.min(20, substantialCommentsCount * 5);

  // Helpful votes bonus
  const totalHelpfulVotes = publishedComments.reduce((sum, c) => sum + (c.helpfulCount || 0), 0);
  qualityPoints += Math.min(15, totalHelpfulVotes * 2);

  // Clamped engagement quality score
  const engagementQualityScore = Math.max(0, Math.min(100, qualityPoints));

  // Recent Activity Factor (decay from creation date + recent interactions)
  const createdDate = product.createdAt ? new Date(product.createdAt).getTime() : Date.now();
  const now = Date.now();
  const ageInDays = isNaN(createdDate) ? 0 : Math.max(0, (now - createdDate) / (1000 * 60 * 60 * 24));
  
  // Exponential recency multiplier
  const recencyMultiplier = Math.max(0.4, 1 - ageInDays * 0.02);
  const adjustedRecentActivity = Math.round((product.recentActivityScore || 0) * recencyMultiplier);

  // Trending Velocity Score
  // Weights: Recent Velocity (40%) + Saves (25%) + Comments (20%) + Likes (15%) + Quality (15%)
  const rawTrendingScore = Number(
    (
      (adjustedRecentActivity || 0) * 0.40 +
      Math.min(100, (totalSaves || 0) * 0.8) * 0.25 +
      Math.min(100, (commentCount || 0) * 12) * 0.20 +
      Math.min(100, (totalLikes || 0) * 0.4) * 0.15 +
      (engagementQualityScore || 0) * 0.15
    ).toFixed(1)
  );
  const trendingScore = isNaN(rawTrendingScore) ? 0 : rawTrendingScore;

  // Threshold: products with high recent engagement are flagged as trending
  const isTrending = trendingScore >= 68 || (product.featured && trendingScore >= 60);

  return {
    likes: totalLikes,
    saves: totalSaves,
    commentCount,
    recentActivityScore: adjustedRecentActivity,
    engagementQualityScore,
    trendingScore,
    isTrending,
    averageRating,
    ratingCount,
    isLikedByUser: isLiked,
    isSavedByUser: isSaved
  };
}

/**
 * Sorts products according to the selected community filter.
 */
export function sortCommunityProducts(
  products: CommunityProduct[],
  comments: CommunityComment[],
  userLikes: string[],
  userSaves: string[],
  filter: CommunitySortFilter
): CommunityProduct[] {
  const statsMap = new Map<string, CommunityProductStats>();
  for (const product of products) {
    statsMap.set(
      product.id,
      calculateProductStats(
        product,
        comments,
        userLikes.includes(product.id),
        userSaves.includes(product.id)
      )
    );
  }

  return [...products].sort((a, b) => {
    const statsA = statsMap.get(a.id)!;
    const statsB = statsMap.get(b.id)!;

    switch (filter) {
      case 'trending':
        return statsB.trendingScore - statsA.trendingScore;

      case 'featured':
        if (a.featured !== b.featured) {
          return a.featured ? -1 : 1;
        }
        return statsB.trendingScore - statsA.trendingScore;

      case 'most-liked':
        return statsB.likes - statsA.likes || statsB.saves - statsA.saves;

      case 'recently-added':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

      case 'most-discussed':
        return statsB.commentCount - statsA.commentCount || statsB.trendingScore - statsA.trendingScore;

      case 'highest-rated':
        if (statsA.averageRating === null && statsB.averageRating === null) return 0;
        if (statsA.averageRating === null) return 1;
        if (statsB.averageRating === null) return -1;
        return (
          statsB.averageRating - statsA.averageRating ||
          statsB.ratingCount - statsA.ratingCount ||
          statsB.likes - statsA.likes
        );

      default:
        return statsB.trendingScore - statsA.trendingScore;
    }
  });
}
