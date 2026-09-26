import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Star,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Flag,
  User,
  ExternalLink,
  EyeOff,
  Eye,
  MessageSquare,
  Search,
  BookOpen,
  Layers,
  Clock,
  Check,
  X,
  FileText,
  RotateCcw,
  Ban,
  UserX,
  UserCheck,
  Package
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { useNovels } from '../../context/NovelContext';
import { useDiscovery } from '../../context/DiscoveryContext';
import { CommunityReportItem, CommunityUser, CommunityUserStatus } from '../../types/community';

export const AdminModeration: React.FC<{
  initialTab?: 'reports' | 'comments' | 'novel_subs' | 'product_subs' | 'users';
}> = ({ initialTab = 'reports' }) => {
  const {
    reviews,
    comments,
    approveReview,
    deleteReview,
    dismissReviewReports,
    hideReview,
    unhideReview,
    reports,
    updateReportStatus,
    deleteReport,
    users,
    updateUserStatus,
    deleteUser,
    products,
    setProductStatus,
    getProduct
  } = useCommunity();

  const {
    allSubmissions,
    adminApproveSubmission,
    adminRejectSubmission,
    adminSuspendSubmission,
    adminDeleteSubmission,
    adminRequestChangesSubmission,
    openNovel
  } = useNovels();

  const { showToast } = useDiscovery();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'reports' | 'comments' | 'novel_subs' | 'product_subs' | 'users'>(initialTab);

  // Filters
  // User Requirement: "Add filters: All, Pending, Reported, Approved, Rejected, Suspended"
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reported' | 'approved' | 'rejected' | 'suspended'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Action States
  const [deleteConfirmId, setDeleteConfirmId] = useState<{ id: string; type: string } | null>(null);
  const [rejectionModal, setRejectionModal] = useState<{ id: string; type: 'novel' | 'report'; targetTitle?: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Violates platform guidelines or quality standards.');

  // Counts
  const pendingReportsCount = reports.filter((r) => r.status === 'pending' || r.status === 'reported').length;
  const pendingNovelsCount = allSubmissions.filter((s) => s.submissionStatus === 'pending_review').length;
  const flaggedReviewsCount = reviews.filter((r) => r.status === 'flagged' || r.status === 'under_review').length;
  const suspendedUsersCount = users.filter((u) => u.status === 'suspended' || u.status === 'banned').length;

  // Filtered Reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          r.content.toLowerCase().includes(q) ||
          r.reporterName.toLowerCase().includes(q) ||
          r.authorName.toLowerCase().includes(q) ||
          (r.targetTitle && r.targetTitle.toLowerCase().includes(q)) ||
          r.reason.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [reports, statusFilter, searchQuery]);

  // Filtered Comments & Reviews
  const filteredComments = useMemo(() => {
    return reviews.filter((r) => {
      if (statusFilter === 'pending' && r.status !== 'under_review') return false;
      if (statusFilter === 'reported' && r.status !== 'flagged') return false;
      if (statusFilter === 'approved' && (r.status !== 'published' || r.isUserHidden)) return false;
      if (statusFilter === 'rejected' && r.status !== 'hidden' && !r.isUserHidden) return false;
      if (statusFilter === 'suspended' && r.status !== 'hidden') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          r.content.toLowerCase().includes(q) ||
          r.authorName.toLowerCase().includes(q) ||
          (r.title && r.title.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [reviews, statusFilter, searchQuery]);

  // Filtered Novel Submissions
  const filteredNovelSubmissions = useMemo(() => {
    return allSubmissions.filter((sub) => {
      if (statusFilter === 'pending' && sub.submissionStatus !== 'pending_review') return false;
      if (statusFilter === 'approved' && sub.submissionStatus !== 'approved') return false;
      if (statusFilter === 'rejected' && sub.submissionStatus !== 'rejected') return false;
      if (statusFilter === 'suspended' && sub.submissionStatus !== 'suspended') return false;
      if (statusFilter === 'reported' && sub.submissionStatus !== 'pending_review') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          sub.title.toLowerCase().includes(q) ||
          sub.author.toLowerCase().includes(q) ||
          sub.description.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [allSubmissions, statusFilter, searchQuery]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter === 'suspended' && u.status !== 'suspended' && u.status !== 'banned') return false;
      if (statusFilter === 'approved' && u.status !== 'active') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [users, statusFilter, searchQuery]);

  // Report Action Handlers
  const handleApproveReport = (report: CommunityReportItem) => {
    updateReportStatus(report.id, 'approved', 'Violation confirmed. Content removed.');
    showToast('Report verified and approved. Content action taken.', 'success');
  };

  const handleDismissReport = (report: CommunityReportItem) => {
    updateReportStatus(report.id, 'rejected', 'No violation found. Content restored.');
    showToast('Report dismissed.', 'info');
  };

  const handleSuspendUser = (userName: string) => {
    const user = users.find((u) => u.name === userName);
    if (user) {
      updateUserStatus(user.id, 'suspended');
      showToast(`User ${userName} suspended.`, 'info');
    } else {
      showToast(`Account for ${userName} flagged.`, 'info');
    }
  };

  const handleBanUser = (userName: string) => {
    const user = users.find((u) => u.name === userName);
    if (user) {
      updateUserStatus(user.id, 'banned');
      showToast(`User ${userName} permanently banned.`, 'info');
    } else {
      showToast(`User ${userName} marked as banned.`, 'info');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <span>Community Moderation & Safety Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Enforce community guidelines, moderate comments, reports, creator submissions, and user accounts.
          </p>
        </div>

        {/* Quick Pending Counter */}
        <div className="flex items-center gap-2">
          {pendingReportsCount > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 font-bold text-xs flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              {pendingReportsCount} Reports Pending
            </span>
          )}
          {pendingNovelsCount > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-300 font-bold text-xs flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              {pendingNovelsCount} Submissions
            </span>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-[#0b0e15] border border-zinc-800">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Reported Content ({reports.length})</span>
            {pendingReportsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-zinc-950 text-[10px] font-black flex items-center justify-center">
                {pendingReportsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'comments'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comments & Reviews ({reviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('novel_subs')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'novel_subs'
                ? 'bg-amber-500 text-zinc-950 shadow-md font-black'
                : 'text-zinc-400 hover:text-amber-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Novel Submissions ({allSubmissions.length})</span>
            {pendingNovelsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-black flex items-center justify-center">
                {pendingNovelsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-emerald-500 text-zinc-950 shadow-md font-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>User Accounts ({users.length})</span>
          </button>
        </div>

        {/* Global Filters: All, Pending, Reported, Approved, Rejected, Suspended */}
        <div className="flex items-center gap-1 text-xs overflow-x-auto no-scrollbar">
          {(['all', 'pending', 'reported', 'approved', 'rejected', 'suspended'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                statusFilter === filter
                  ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Filter moderation items by keyword, user, content, or reason..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500"
        />
      </div>

      {/* ========================================================
          1. REPORTS QUEUE
         ======================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {filteredReports.length === 0 ? (
            <div className="py-16 text-center bg-[#0b0e15] rounded-2xl border border-zinc-800 p-6 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">No reports match the current filter</h3>
              <p className="text-xs text-zinc-400">All community reports have been processed or none match criteria.</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-[#0e121a] p-5 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all space-y-3"
              >
                {/* Meta details row: Reason, Reporter, Content, Date, Current Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                      <Flag className="w-3 h-3 fill-current" /> Reason: {report.reason}
                    </span>

                    <span className="text-xs text-zinc-400">
                      Reporter: <strong className="text-zinc-200">{report.reporterName}</strong>
                    </span>

                    <span className="text-xs text-zinc-500">•</span>

                    <span className="text-xs text-zinc-400">
                      Author: <strong className="text-zinc-300">{report.authorName}</strong>
                    </span>

                    <span className="text-xs text-zinc-500">•</span>

                    <span className="text-[11px] text-zinc-500 font-mono">
                      {new Date(report.date).toLocaleString()}
                    </span>
                  </div>

                  {/* Current Status Pill */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase self-start sm:self-auto ${
                      report.status === 'approved'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : report.status === 'rejected'
                        ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        : report.status === 'suspended'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-700'
                    }`}
                  >
                    Status: {report.status}
                  </span>
                </div>

                {/* Target & Content */}
                <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-850 space-y-1 text-xs">
                  {report.targetTitle && (
                    <div className="font-bold text-zinc-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Target: {report.targetTitle}</span>
                    </div>
                  )}
                  <p className="text-zinc-200 leading-relaxed font-sans">{report.content}</p>
                  {report.actionNotes && (
                    <div className="text-[11px] text-emerald-400 font-mono pt-1">
                      Resolution Note: {report.actionNotes}
                    </div>
                  )}
                </div>

                {/* Actions: Approve, Reject, Hide, Delete, Restore, Suspend, Ban */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSuspendUser(report.authorName)}
                      className="px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900 text-amber-300 text-xs font-bold border border-amber-800/80 transition-all flex items-center gap-1"
                    >
                      <UserX className="w-3 h-3" />
                      <span>Suspend Author</span>
                    </button>

                    <button
                      onClick={() => handleBanUser(report.authorName)}
                      className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold border border-rose-800/80 transition-all flex items-center gap-1"
                    >
                      <Ban className="w-3 h-3" />
                      <span>Ban Author</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Approve Report (confirms violation) */}
                    <button
                      onClick={() => handleApproveReport(report)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Report</span>
                    </button>

                    {/* Reject / Dismiss Report */}
                    <button
                      onClick={() => handleDismissReport(report)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold"
                    >
                      Dismiss / Restore
                    </button>

                    {/* Delete Report */}
                    <button
                      onClick={() => {
                        deleteReport(report.id);
                        showToast('Report removed', 'info');
                      }}
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 border border-zinc-800 text-xs"
                      title="Delete report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================
          2. COMMENTS & REVIEWS MODERATION
         ======================================================== */}
      {activeTab === 'comments' && (
        <div className="space-y-3">
          {filteredComments.length === 0 ? (
            <div className="py-16 text-center bg-[#0b0e15] rounded-2xl border border-zinc-800 p-6 space-y-2">
              <p className="text-xs text-zinc-400">No comments or reviews match current criteria.</p>
            </div>
          ) : (
            filteredComments.map((rev) => (
              <div
                key={rev.id}
                className="bg-[#0e121a] p-5 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">{rev.authorName}</span>
                    {typeof rev.rating === 'number' && (
                      <span className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" /> {rev.rating}/5
                      </span>
                    )}
                    <span className="text-xs text-zinc-500">•</span>
                    <span className="text-xs text-zinc-400 font-mono">{rev.productId}</span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase self-start sm:self-auto ${
                      rev.status === 'published'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : rev.status === 'flagged'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {rev.status}
                  </span>
                </div>

                {rev.title && <h4 className="text-xs font-bold text-zinc-200">{rev.title}</h4>}
                <p className="text-xs text-zinc-300">{rev.content}</p>

                {/* Actions: Approve, Reject, Hide, Delete, Restore */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                  {rev.status !== 'published' && (
                    <button
                      onClick={() => {
                        approveReview(rev.id);
                        showToast('Review approved and published', 'success');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Approve & Publish</span>
                    </button>
                  )}

                  {!rev.isUserHidden && rev.status !== 'hidden' ? (
                    <button
                      onClick={() => {
                        hideReview(rev.id);
                        showToast('Comment hidden from public view', 'info');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1"
                    >
                      <EyeOff className="w-3 h-3" />
                      <span>Hide</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        unhideReview(rev.id);
                        showToast('Comment restored to public view', 'success');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs font-bold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      deleteReview(rev.id);
                      showToast('Review permanently deleted', 'info');
                    }}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 border border-zinc-800 text-xs"
                    title="Delete Review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================
          3. NOVEL SUBMISSIONS QUEUE
         ======================================================== */}
      {activeTab === 'novel_subs' && (
        <div className="space-y-3">
          {filteredNovelSubmissions.length === 0 ? (
            <div className="py-16 text-center bg-[#0b0e15] rounded-2xl border border-zinc-800 p-6 space-y-2">
              <p className="text-xs text-zinc-400">No novel submissions in queue.</p>
            </div>
          ) : (
            filteredNovelSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-[#0e121a] p-5 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={sub.coverImage}
                      alt={sub.title}
                      className="w-12 h-16 rounded-xl object-cover border border-zinc-800 bg-zinc-950 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{sub.title}</h4>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {sub.type}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Author: <strong className="text-zinc-200">{sub.author}</strong> ({sub.submittedBy || 'Creator'})
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      sub.submissionStatus === 'approved'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : sub.submissionStatus === 'pending_review'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {sub.submissionStatus.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 line-clamp-2">{sub.description}</p>

                {sub.submissionNotes && (
                  <div className="p-2 rounded bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300 font-mono">
                    Note: {sub.submissionNotes}
                  </div>
                )}

                {/* Actions: Approve, Reject, Request Changes, Suspend, Delete */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                  {sub.submissionStatus !== 'approved' && (
                    <button
                      onClick={() => {
                        adminApproveSubmission(sub.id);
                        showToast(`Approved "${sub.title}" for catalog publication!`, 'success');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Approve</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      adminRejectSubmission(sub.id, 'Does not meet publishing standards.');
                      showToast(`Rejected "${sub.title}"`, 'info');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 text-xs font-bold"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() => {
                      adminRequestChangesSubmission(sub.id, 'Please revise formatting and expand description.');
                      showToast('Requested revisions from author', 'info');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-950 hover:bg-amber-900 text-amber-300 text-xs font-bold"
                  >
                    Request Changes
                  </button>

                  <button
                    onClick={() => {
                      adminSuspendSubmission(sub.id);
                      showToast('Submission suspended', 'info');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                  >
                    Suspend
                  </button>

                  <button
                    onClick={() => {
                      adminDeleteSubmission(sub.id);
                      showToast('Submission deleted', 'info');
                    }}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 border border-zinc-800 text-xs"
                    title="Delete Submission"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================
          4. USER ACCOUNTS & ROLES MODERATION
         ======================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="py-16 text-center bg-[#0b0e15] rounded-2xl border border-zinc-800 p-6 space-y-2">
              <p className="text-xs text-zinc-400">No user accounts found.</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-[#0e121a] p-4 sm:p-5 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-xl object-cover bg-zinc-900 border border-zinc-800 shrink-0"
                  />
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-sm truncate">{user.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-zinc-800 text-zinc-300">
                        {user.role}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-mono truncate">{user.email}</p>
                    <div className="text-[11px] text-zinc-500">
                      Joined: {user.joinedDate} • {user.contributionsCount} contributions • {user.warningsCount} warnings
                    </div>
                  </div>
                </div>

                {/* Actions: Suspend, Ban, Restore */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold uppercase ${
                      user.status === 'active'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : user.status === 'suspended'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {user.status}
                  </span>

                  {user.status !== 'active' ? (
                    <button
                      onClick={() => {
                        updateUserStatus(user.id, 'active');
                        showToast(`Restored user ${user.name} to active`, 'success');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          updateUserStatus(user.id, 'suspended');
                          showToast(`Suspended user ${user.name}`, 'info');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800 text-xs font-bold"
                      >
                        Suspend
                      </button>
                      <button
                        onClick={() => {
                          updateUserStatus(user.id, 'banned');
                          showToast(`Banned user ${user.name}`, 'info');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold"
                      >
                        Ban
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      deleteUser(user.id);
                      showToast(`Removed user ${user.name}`, 'info');
                    }}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 border border-zinc-800 text-xs"
                    title="Delete Account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
