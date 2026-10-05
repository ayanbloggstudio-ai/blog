import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Copy,
  Check,
  ExternalLink,
  Table,
  Key,
  Globe,
  Sliders,
  ShieldCheck,
  Code2,
  Layers,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  SupabaseConfig
} from '../../lib/supabase';
import {
  checkSupabaseConnection,
  SupabaseStatusResult,
  pushAllDataToSupabase,
  pullAllDataFromSupabase,
  SUPABASE_SQL_SCHEMA
} from '../../services/supabaseService';

export const AdminSupabase: React.FC = () => {
  const {
    items,
    categories,
    collections,
    comparisons,
    mediaAssets,
    trends,
    setAllCMSData
  } = useCMS();

  const [config, setConfig] = useState<SupabaseConfig>(getSupabaseConfig);
  const [status, setStatus] = useState<SupabaseStatusResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'schema' | 'tables' | 'settings'>('overview');

  const testConnection = async () => {
    setIsTesting(true);
    setActionFeedback(null);
    try {
      const res = await checkSupabaseConnection();
      setStatus(res);
      if (res.connected) {
        if (!res.tablesInitialized) {
          setActionFeedback({
            type: 'warning',
            message: `Connected to Supabase (${res.latencyMs}ms), but database tables have not been created yet. Copy and run the SQL schema in your Supabase SQL Editor.`
          });
        } else {
          setActionFeedback({
            type: 'success',
            message: `Connected successfully to Supabase! Latency: ${res.latencyMs}ms`
          });
        }
      } else if (!res.configured) {
        setActionFeedback({
          type: 'error',
          message: 'Supabase credentials not configured. Please enter your project URL and Anon key.'
        });
      } else {
        setActionFeedback({
          type: 'error',
          message: res.error || 'Connection failed. Please verify your Supabase URL and Anon key.'
        });
      }
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err?.message || 'Error checking Supabase connection'
      });
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(config);
    setActionFeedback({
      type: 'success',
      message: 'Supabase configuration saved! Testing connection...'
    });
    testConnection();
  };

  const handlePushAll = async () => {
    if (!confirm('This will upsert all current local CMS contents, categories, collections, and trends into your Supabase database. Continue?')) {
      return;
    }
    setIsPushing(true);
    setActionFeedback(null);
    try {
      const res = await pushAllDataToSupabase({
        items,
        categories,
        collections,
        comparisons,
        mediaAssets,
        trends
      });
      if (res.success) {
        setActionFeedback({
          type: 'success',
          message: res.message
        });
        testConnection();
      } else if (res.isTablesMissing) {
        setActionFeedback({
          type: 'warning',
          message: res.message
        });
        setActiveTab('schema');
      } else {
        setActionFeedback({
          type: 'error',
          message: res.message
        });
      }
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Push failed'
      });
    } finally {
      setIsPushing(false);
    }
  };

  const handlePullAll = async () => {
    if (!confirm('This will load all published items, categories, collections, and trends directly from Supabase and update your local CMS workspace. Continue?')) {
      return;
    }
    setIsPulling(true);
    setActionFeedback(null);
    try {
      const res = await pullAllDataFromSupabase();
      if (res.success && res.data) {
        setAllCMSData(res.data);
        setActionFeedback({
          type: 'success',
          message: `Pulled ${res.data.items.length} items and ${res.data.categories.length} categories from Supabase!`
        });
        testConnection();
      } else if (res.isTablesMissing) {
        setActionFeedback({
          type: 'warning',
          message: res.message
        });
        setActiveTab('schema');
      } else {
        setActionFeedback({
          type: 'error',
          message: res.message
        });
      }
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Pull failed'
      });
    } finally {
      setIsPulling(false);
    }
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-zinc-900 to-cyan-950/70 p-6 sm:p-8 rounded-3xl border border-emerald-800/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/60 text-emerald-400 text-xs font-bold tracking-wide">
              <Database className="w-3.5 h-3.5" />
              <span>POSTGRESQL & SUPABASE CLOUD SYNC</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Supabase CMS Database
            </h1>
            <p className="text-zinc-300 text-sm max-w-2xl leading-relaxed">
              Persist all PRISM discovery articles, categories, curated collections, comparisons, media assets, and live trends to your scalable Supabase PostgreSQL cloud database.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={testConnection}
              disabled={isTesting}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center gap-2 transition-all border border-zinc-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <button
              onClick={handlePushAll}
              disabled={isPushing}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isPushing ? 'Pushing...' : 'Push Local → Supabase'}</span>
            </button>

            <button
              onClick={handlePullAll}
              disabled={isPulling}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-600/20 disabled:opacity-50"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>{isPulling ? 'Pulling...' : 'Pull Supabase → Local'}</span>
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className="mt-6 pt-6 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">Database Status:</span>
              {status?.connected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700/80 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Connected ({status.latencyMs}ms)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-700/80 text-amber-300 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {status?.configured ? 'Tables Not Initialized' : 'Credentials Needed'}
                </span>
              )}
            </div>

            {config.url && (
              <div className="hidden sm:flex items-center gap-1.5 text-zinc-400 bg-zinc-950/60 px-3 py-1 rounded-lg border border-zinc-800 font-mono text-[11px]">
                <Globe className="w-3 h-3 text-cyan-400" />
                <span className="truncate max-w-xs">{config.url}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-zinc-400">
            <span>Local Items: <strong className="text-white">{items.length}</strong></span>
            <span>Categories: <strong className="text-white">{categories.length}</strong></span>
            <span>Collections: <strong className="text-white">{collections.length}</strong></span>
            <span>Trends: <strong className="text-white">{trends.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Action feedback toast banner */}
      {actionFeedback && (
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm font-medium transition-all ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
              : actionFeedback.type === 'warning'
              ? 'bg-amber-950/70 border-amber-700 text-amber-300'
              : 'bg-rose-950/70 border-rose-700 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : actionFeedback.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {actionFeedback.type === 'warning' && (
              <button
                type="button"
                onClick={() => {
                  handleCopySQL();
                  setActiveTab('schema');
                }}
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shrink-0 transition-colors"
              >
                Copy SQL & Open Schema
              </button>
            )}
            <button
              onClick={() => setActionFeedback(null)}
              className="text-xs opacity-70 hover:opacity-100 hover:underline px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-zinc-100 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Status & Sync</span>
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'schema'
              ? 'bg-zinc-100 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>SQL Schema Migration</span>
        </button>

        <button
          onClick={() => setActiveTab('tables')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'tables'
              ? 'bg-zinc-100 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Cloud Tables Inspector</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-zinc-100 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Credentials & Settings</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & QUICK SYNC */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Sync Controls */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 space-y-6">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-emerald-400" />
                Bidirectional Cloud Synchronization
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Push Card */}
                <div className="bg-zinc-950/70 border border-zinc-800/90 rounded-2xl p-5 space-y-4 hover:border-emerald-700/50 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Seed / Push to Supabase</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Uploads and upserts all local CMS discoveries, categories, collections, and trends into Supabase PostgreSQL tables.
                    </p>
                  </div>
                  <button
                    onClick={handlePushAll}
                    disabled={isPushing}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{isPushing ? 'Pushing Data...' : 'Run Full Push'}</span>
                  </button>
                </div>

                {/* Pull Card */}
                <div className="bg-zinc-950/70 border border-zinc-800/90 rounded-2xl p-5 space-y-4 hover:border-cyan-700/50 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
                      <DownloadCloud className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Pull from Supabase</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Fetches current published database records from Supabase and hydrates your local editorial workspace.
                    </p>
                  </div>
                  <button
                    onClick={handlePullAll}
                    disabled={isPulling}
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-600/20 disabled:opacity-50"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    <span>{isPulling ? 'Pulling Data...' : 'Run Full Pull'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Setup 3-Step Guide */}
              <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Quick Supabase Setup in 3 Minutes
                </h4>
                <ol className="text-xs text-zinc-300 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    Create a project on <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3 inline" /></a>.
                  </li>
                  <li>
                    Go to <strong>SQL Editor</strong> in Supabase, paste the schema from the <strong>SQL Schema Migration</strong> tab, and click <strong>Run</strong>.
                  </li>
                  <li>
                    Under <strong>Project Settings → API</strong>, copy your <strong>Project URL</strong> and <strong>anon public API key</strong> into the <strong>Settings</strong> tab here.
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Sidebar: Table Readiness */}
          <div className="space-y-6">
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Table className="w-4 h-4 text-cyan-400" />
                Cloud Database Tables
              </h3>

              <div className="space-y-2.5">
                {[
                  { name: 'cms_items', label: 'Discovery & Directory Content', localCount: items.length },
                  { name: 'cms_categories', label: 'Taxonomy & Navigation', localCount: categories.length },
                  { name: 'cms_collections', label: 'Curated Stacks & Top 10s', localCount: collections.length },
                  { name: 'cms_comparisons', label: 'Side-by-Side Pairs', localCount: comparisons.length },
                  { name: 'cms_media_assets', label: 'Media Library CDN', localCount: mediaAssets.length },
                  { name: 'cms_trends', label: 'Trend Radar Signals', localCount: trends.length }
                ].map((tbl) => {
                  const cloudTbl = status?.tables.find((t) => t.name === tbl.name);
                  const isReady = cloudTbl?.exists;

                  return (
                    <div
                      key={tbl.name}
                      className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-mono font-bold text-zinc-200">{tbl.name}</div>
                        <div className="text-[10px] text-zinc-400">{tbl.label}</div>
                      </div>
                      <div className="text-right">
                        {isReady ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                            <Check className="w-3 h-3" />
                            {cloudTbl.count} rows
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                            Local: {tbl.localCount}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setActiveTab('schema')}
                className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>View & Copy SQL Schema</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SQL SCHEMA MIGRATION */}
      {activeTab === 'schema' && (
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-400" />
                Supabase PostgreSQL Schema Migration
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Copy and run this SQL script in your Supabase SQL Editor to provision all tables, JSONB indexes, and Row Level Security (RLS) policies.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center gap-1.5 border border-zinc-700 transition-all"
              >
                <span>Supabase Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleCopySQL}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                {copiedSQL ? (
                  <>
                    <Check className="w-4 h-4 text-zinc-950" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Full SQL Schema</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-[#05070a]">
            <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span className="font-mono text-[11px] text-emerald-400">prism_supabase_schema.sql</span>
              <span>PostgreSQL 15+ / Supabase RLS</span>
            </div>
            <pre className="p-4 sm:p-6 text-xs font-mono text-zinc-300 overflow-x-auto max-h-[500px] leading-relaxed select-all">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: CLOUD TABLES INSPECTOR */}
      {activeTab === 'tables' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Table className="w-4 h-4 text-cyan-400" />
                  Supabase Live Content Table Viewer
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Inspect the local and cloud dataset synchronized across PRISM CMS modules.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={testConnection}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh Counts</span>
                </button>
              </div>
            </div>

            {/* Table summary grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {[
                { name: 'cms_items', title: 'Content Items', count: items.length, icon: Layers, desc: 'Articles, tools, gadgets, visual reviews' },
                { name: 'cms_categories', title: 'Categories', count: categories.length, icon: Globe, desc: 'Taxonomy, icons, and visibility switches' },
                { name: 'cms_collections', title: 'Rankings & Stacks', count: collections.length, icon: Sparkles, desc: 'Top 10s and thematic collections' },
                { name: 'prism-media', title: 'Supabase Storage', count: 'Active', icon: UploadCloud, desc: 'Public bucket for images, covers, and media files' },
                { name: 'cms_media_assets', title: 'Media Assets', count: mediaAssets.length, icon: Layers, desc: 'CDN photography and cover gallery URLs' },
                { name: 'cms_trends', title: 'Trend Radar', count: trends.length, icon: Zap, desc: 'Velocity scores and signal trackers' }
              ].map((c) => {
                const Icon = c.icon as any;
                const cloud = status?.tables.find((t) => t.name === c.name);

                return (
                  <div key={c.name} className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{c.title}</div>
                          <div className="font-mono text-[10px] text-zinc-400">{c.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-black text-white">{c.count}</div>
                        <div className="text-[10px] text-zinc-400">records</div>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400">{c.desc}</p>
                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Cloud Status:</span>
                      {cloud?.exists ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Online ({cloud.count} rows)
                        </span>
                      ) : (
                        <span className="text-amber-400 font-medium">Not synced yet</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CREDENTIALS & SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-3xl bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              Supabase Project Connection Settings
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Configure your Supabase project credentials. Credentials can also be specified via <code className="text-emerald-400">VITE_SUPABASE_URL</code> and <code className="text-emerald-400">VITE_SUPABASE_ANON_KEY</code> in your environment.
            </p>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-5">
            {/* Supabase Project URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                Supabase Project URL
              </label>
              <input
                type="url"
                value={config.url}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                placeholder="https://your-project-id.supabase.co"
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm focus:outline-none focus:border-emerald-500 font-mono"
              />
              <p className="text-[11px] text-zinc-400">
                Found under Project Settings → API in your Supabase Dashboard.
              </p>
            </div>

            {/* Supabase Anon Key */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                value={config.anonKey}
                onChange={(e) => setConfig({ ...config, anonKey: e.target.value })}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-sm focus:outline-none focus:border-emerald-500 font-mono"
              />
              <p className="text-[11px] text-zinc-400">
                The public anon key safe for browser client requests.
              </p>
            </div>

            {/* Auto-Sync Switch */}
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Live Auto-Sync
                </div>
                <div className="text-xs text-zinc-400">
                  Automatically push any new discovery content, edits, or categories to Supabase when published.
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoSyncEnabled}
                  onChange={(e) => setConfig({ ...config, autoSyncEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20"
              >
                Save & Connect Supabase
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
