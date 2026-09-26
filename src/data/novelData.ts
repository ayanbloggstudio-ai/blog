/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NovelItem, NovelComment } from '../types/novel';

export const NOVEL_GENRES = [
  'All Genres',
  'LitRPG & System',
  'Fantasy',
  'Sci-Fi',
  'Action',
  'Cultivation & Murim',
  'Reincarnation',
  'Urban Supernatural',
  'Mystery & Thriller',
  'Romance',
  'Adventure'
];

export const MANGA_GENRES = [
  'All Genres',
  'Action & Shonen',
  'Manhwa & Webtoon',
  'Isekai & Regression',
  'Supernatural',
  'Martial Arts',
  'Sci-Fi & Cyberpunk',
  'Romance & Drama',
  'Slice of Life',
  'Psychological'
];

export const INITIAL_NOVELS: NovelItem[] = [];
export const INITIAL_USER_SUBMISSIONS: NovelItem[] = [];
export const INITIAL_NOVEL_COMMENTS: Record<string, NovelComment[]> = {};
