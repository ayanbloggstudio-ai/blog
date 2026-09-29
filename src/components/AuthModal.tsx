import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, Sparkles, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDiscovery } from '../context/DiscoveryContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    openAuthModal,
    login,
    signup,
    authError,
    clearAuthError
  } = useAuth();

  const { showToast } = useDiscovery();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both email and password.');
      return;
    }

    if (authModalMode === 'signup' && !name.trim()) {
      setLocalError('Please enter your full or display name.');
      return;
    }

    if (authModalMode === 'signup' && password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (authModalMode === 'login') {
        const ok = await login(email.trim(), password);
        if (ok) {
          showToast('Welcome back! Successfully logged in.', 'success');
          setEmail('');
          setPassword('');
        }
      } else {
        const ok = await signup(name.trim(), email.trim(), password, bio.trim());
        if (ok) {
          showToast('Account created! Welcome to PRISM Community.', 'success');
          setName('');
          setEmail('');
          setPassword('');
          setBio('');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillAdmin = () => {
    setEmail('admin@prism.io');
    setPassword('PrismAdmin2026!');
    setLocalError(null);
    clearAuthError();
  };

  const displayedError = localError || authError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#0e121a] rounded-3xl border border-zinc-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header / Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <span className="text-zinc-950 font-black text-xl">P</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {authModalMode === 'login' ? 'Sign In to PRISM' : 'Create Your PRISM Account'}
          </h2>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            {authModalMode === 'login'
              ? 'Access saved discoveries, community voting, novel bookmarks, and discussion reviews.'
              : 'Join fellow creators and enthusiasts to publish, review, and curate knowledge.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-zinc-900/80 p-1 border border-zinc-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              openAuthModal('login');
              setLocalError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all text-center ${
              authModalMode === 'login'
                ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              openAuthModal('signup');
              setLocalError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all text-center ${
              authModalMode === 'signup'
                ? 'bg-zinc-100 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Banner */}
        {displayedError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="leading-snug">{displayedError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {authModalMode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Display Name <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Email Address <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Password <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {authModalMode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Bio / Interests <span className="text-zinc-500 text-[10px]">(optional)</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="Tell us what topics or stories you explore..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : authModalMode === 'login' ? (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Create Account</span>
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Administrator Auto-Fill Hint */}
        {authModalMode === 'login' && (
          <div className="pt-2 border-t border-zinc-800/80 text-center">
            <div className="flex items-center justify-between text-xs text-zinc-400 bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800">
              <span className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Testing Admin role?</span>
              </span>
              <button
                type="button"
                onClick={handleFillAdmin}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
              >
                Auto-fill Admin
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
