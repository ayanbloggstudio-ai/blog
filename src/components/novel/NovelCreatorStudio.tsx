/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  BookOpen,
  Plus,
  Send,
  Save,
  Trash2,
  Eye,
  Info
} from 'lucide-react';
import { NovelItem, NovelSubmissionStatus, NovelContentType } from '../../types/novel';
import { useNovels } from '../../context/NovelContext';
import { useDiscovery } from '../../context/DiscoveryContext';
import { NOVEL_GENRES, MANGA_GENRES } from '../../data/novelData';
import { ImageUploadField } from '../ImageUploadField';

export const NovelCreatorStudio: React.FC = () => {
  const { allSubmissions, submitNovel, openNovel } = useNovels();
  const { showToast } = useDiscovery();

  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');

  // Form Fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [type, setType] = useState<NovelContentType>('novel');
  const [genre, setGenre] = useState(NOVEL_GENRES[1]);
  const [coverImage, setCoverImage] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [chapterTitle, setChapterTitle] = useState('Chapter 1: The Awakening');
  const [chapterContent, setChapterContent] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cover image preset picker
  const coverPresets = [
    { label: 'Cyberpunk Blade', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80' },
    { label: 'Cosmic Sorcery', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' },
    { label: 'Abyssal Throne', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80' },
    { label: 'Star Portal', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80' },
    { label: 'Urban Twilight', url: 'https://images.unsplash.com/photo-1519638399535-1b036603ac77?auto=format&fit=crop&w=800&q=80' }
  ];

  const handleSubmit = (asDraft = false) => {
    if (!title.trim()) {
      showToast('Please enter a title for your work');
      return;
    }
    if (!author.trim()) {
      showToast('Please specify the author name');
      return;
    }
    if (!asDraft && (!description.trim() || !chapterContent.trim())) {
      showToast('Please provide a synopsis and initial chapter content');
      return;
    }

    setIsSubmitting(true);

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const selectedCover = coverImage.trim() || coverPresets[0].url;

    submitNovel({
      title: title.trim(),
      author: author.trim(),
      type,
      genres: [genre],
      coverImage: selectedCover,
      shortDescription: shortDescription.trim() || description.slice(0, 140) + '...',
      description: description.trim() || 'No description provided.',
      tags: tags.length > 0 ? tags : ['Indie Creator', 'Community Submission'],
      submissionNotes: submissionNotes.trim() || 'Submitted via PRISM Creator Portal',
      chapters: [
        {
          id: `ch-user-${Date.now()}-1`,
          chapterNumber: 1,
          title: chapterTitle.trim() || 'Chapter 1',
          publishedAt: new Date().toISOString(),
          wordCount: chapterContent.split(/\s+/).filter(Boolean).length,
          views: 0,
          likes: 0,
          commentsCount: 0,
          content: chapterContent.trim() || 'Chapter content pending author update.'
        }
      ]
    }, asDraft);

    setIsSubmitting(false);

    if (asDraft) {
      showToast('Work saved to your drafts successfully!');
    } else {
      showToast('Submission uploaded! Status: Pending Editorial Review.');
    }

    // Reset fields & switch to history tab
    setTitle('');
    setDescription('');
    setShortDescription('');
    setChapterContent('');
    setTagsInput('');
    setActiveTab('history');
  };

  const getStatusBadge = (status: NovelSubmissionStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved & Public
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
            <FileText className="w-3.5 h-3.5" />
            Draft
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <AlertCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
            <ShieldAlert className="w-3.5 h-3.5" />
            Suspended
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 text-left">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-zinc-900 to-zinc-900 border border-indigo-900/40 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              PRISM Creator Studio
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Submit Your Novel or Manga
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Approved creators can submit original web novels, manhwa, and manga. All submissions undergo our editorial curation process before being published to the main feed.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 shrink-0">
            <button
              onClick={() => setActiveTab('submit')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'submit'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>New Submission</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Submissions ({allSubmissions.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: SUBMISSION FORM */}
      {activeTab === 'submit' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-6 shadow-xl">
          {/* Workflow Info Callout */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-amber-200/90 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300">Editorial Policy:</strong> User submissions will enter a{' '}
              <span className="font-semibold text-white">Pending Review</span> queue. Only editorial-approved stories become publicly discoverable in PRISM Web Novels & Manga.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Work Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chronicles of the Silver Spire"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Author */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Author Name *</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Pen name or Studio handle"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Content Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Content Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as NovelContentType)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="novel">Web Novel (Text format)</option>
                <option value="manhwa">Manhwa (Webtoon vertical format)</option>
                <option value="manga">Manga (Graphic narrative format)</option>
              </select>
            </div>

            {/* Primary Genre */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Primary Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                {(type === 'novel' ? NOVEL_GENRES : MANGA_GENRES)
                  .filter(g => g !== 'All Genres')
                  .map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Cover Image Selector */}
          <div className="space-y-2">
            <ImageUploadField
              label="Cover Artwork"
              value={coverImage}
              onChange={setCoverImage}
              aspectRatio="portrait"
              helperText="Upload your custom illustration or select a preset below."
            />
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-zinc-500">Or pick curated preset:</span>
              {coverPresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setCoverImage(preset.url)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    coverImage === preset.url
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-zinc-950 text-zinc-400 hover:text-white border-zinc-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Short Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Short Hook / Elevator Pitch</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="One compelling sentence summarizing the core conflict"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Full Synopsis */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Full Synopsis & Setting Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the setting, magic system, main character's journey, and stakes..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Tags (Comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Weak to Strong, Reincarnation, System, Fast Paced, Dragon"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* First Chapter Section */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <h3 className="font-extrabold text-sm sm:text-base text-zinc-100">
                Initial Chapter Content *
              </h3>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Chapter 1 Title</label>
              <input
                type="text"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">
                Chapter Story Text (Formatted Paragraphs)
              </label>
              <textarea
                value={chapterContent}
                onChange={(e) => setChapterContent(e.target.value)}
                placeholder="Paste the story paragraphs here. Use blank lines between paragraphs for clean reading flow..."
                rows={8}
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 leading-relaxed font-serif"
              />
            </div>
          </div>

          {/* Submission Notes to Editorial Team */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">
              Note to PRISM Editors (Optional)
            </label>
            <input
              type="text"
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              placeholder="Any release schedule details, trigger warnings, or inspiration sources..."
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/25 transition-all hover:scale-102"
            >
              <Send className="w-4 h-4" />
              <span>Submit for Editorial Review</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: MY SUBMISSIONS & STATUS TRACKER */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400">
              Your Submissions ({allSubmissions.length})
            </span>
          </div>

          {allSubmissions.length === 0 ? (
            <div className="text-center py-12 rounded-3xl bg-zinc-900/50 border border-zinc-800 text-zinc-500 text-sm">
              You haven't submitted any novels yet. Start a submission above!
            </div>
          ) : (
            <div className="space-y-3">
              {allSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={sub.coverImage}
                      alt={sub.title}
                      className="w-12 h-16 object-cover rounded-xl border border-zinc-700/80 shrink-0 bg-zinc-950"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm sm:text-base text-zinc-100 truncate">
                          {sub.title}
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 uppercase font-mono">
                          {sub.type}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Author: <strong className="text-zinc-300">{sub.author}</strong> • {sub.chapters.length} chapter(s)
                      </p>
                      {sub.submissionNotes && (
                        <p className="text-[11px] text-zinc-500 mt-1 italic line-clamp-1">
                          "{sub.submissionNotes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    {getStatusBadge(sub.submissionStatus)}

                    {sub.submissionStatus === 'approved' && (
                      <button
                        onClick={() => openNovel(sub.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-zinc-400" />
                        <span>View Public</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
