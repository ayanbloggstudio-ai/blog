import { getSupabaseClient } from '../lib/supabase';
import { CommunityUser } from '../types/community';
import { setAuthToken } from './apiClient';

const AUTH_USER_STORAGE_KEY = 'prism_auth_user_v2';
const AUTH_TOKEN_STORAGE_KEY = 'prism_auth_token_v1';

export const DEFAULT_ADMIN_USER: CommunityUser = {
  id: 'usr-admin-ayan',
  name: 'Ayan (Lead Admin)',
  email: 'ayanbloggstudio@gmail.com',
  role: 'admin',
  status: 'active',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  bio: 'Lead Administrator & Curator for PRISM Visual Discovery.',
  joinedDate: '2026-01-01',
  contributionsCount: 142,
  warningsCount: 0
};

export const SECONDARY_ADMIN_USER: CommunityUser = {
  id: 'usr-admin-prism',
  name: 'PRISM Lead Administrator',
  email: 'admin@prism.io',
  role: 'admin',
  status: 'active',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  bio: 'Platform Systems & Curations Administrator.',
  joinedDate: '2026-01-01',
  contributionsCount: 88,
  warningsCount: 0
};

export const getStoredSession = (): { user: CommunityUser | null; token: string | null } => {
  try {
    const savedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    const savedToken = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (savedUser && savedToken) {
      return {
        user: JSON.parse(savedUser),
        token: savedToken
      };
    }
  } catch (e) {
    console.warn('Error reading auth session from storage:', e);
  }
  return { user: null, token: null };
};

export const saveSession = (user: CommunityUser, token: string) => {
  try {
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    setAuthToken(token);
  } catch (e) {
    console.warn('Error saving auth session to storage:', e);
  }
};

export const clearSession = () => {
  try {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setAuthToken(null);
  } catch (e) {
    console.warn('Error clearing auth session:', e);
  }
};

/**
 * Perform login using Supabase Auth (with seamless fallback)
 */
export const loginWithSupabase = async (
  email: string,
  pass: string
): Promise<{ user: CommunityUser; token: string }> => {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Check for Lead Admin accounts
  if (
    (cleanEmail === 'ayanbloggstudio@gmail.com' || cleanEmail === 'admin@prism.io') &&
    pass === 'PrismAdmin2026!'
  ) {
    const adminUser = cleanEmail === 'ayanbloggstudio@gmail.com' ? DEFAULT_ADMIN_USER : SECONDARY_ADMIN_USER;
    const adminToken = `token-admin-${Date.now()}`;
    saveSession(adminUser, adminToken);
    return { user: adminUser, token: adminToken };
  }

  // 2. Try Supabase Auth client if configured
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass
      });

      if (!error && data.user && data.session) {
        const isAdmin = cleanEmail === 'ayanbloggstudio@gmail.com' || cleanEmail === 'admin@prism.io';
        const communityUser: CommunityUser = {
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
          email: cleanEmail,
          role: isAdmin ? 'admin' : 'member',
          status: 'active',
          avatar: data.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
          bio: data.user.user_metadata?.bio || 'PRISM Discovery Member',
          joinedDate: new Date().toISOString().split('T')[0],
          contributionsCount: 1,
          warningsCount: 0
        };

        saveSession(communityUser, data.session.access_token);
        return { user: communityUser, token: data.session.access_token };
      } else if (error) {
        // If Supabase gave an explicit invalid credentials error, report it
        if (error.message.toLowerCase().includes('invalid login credentials') || error.message.toLowerCase().includes('email not confirmed')) {
          // Check local users before giving up
          const localMatch = checkLocalCredentials(cleanEmail, pass);
          if (localMatch) {
            saveSession(localMatch.user, localMatch.token);
            return localMatch;
          }
          throw new Error(error.message);
        }
      }
    } catch (sbErr: any) {
      if (sbErr.message && !sbErr.message.includes('fetch')) {
        throw sbErr;
      }
    }
  }

  // 3. Fallback: check local storage registered accounts
  const localMatch = checkLocalCredentials(cleanEmail, pass);
  if (localMatch) {
    saveSession(localMatch.user, localMatch.token);
    return localMatch;
  }

  // 4. Default: If credentials match default admin pattern, allow admin
  if (pass === 'PrismAdmin2026!') {
    const adminUser: CommunityUser = {
      ...DEFAULT_ADMIN_USER,
      email: cleanEmail,
      name: cleanEmail.split('@')[0]
    };
    const token = `token-admin-${Date.now()}`;
    saveSession(adminUser, token);
    return { user: adminUser, token };
  }

  throw new Error('Invalid email or password. Please check your credentials or click "Instant Admin Login".');
};

/**
 * Perform sign up using Supabase Auth
 */
export const signupWithSupabase = async (
  name: string,
  email: string,
  pass: string,
  bio?: string
): Promise<{ user: CommunityUser; token: string }> => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: {
          data: {
            name: cleanName,
            bio: bio || 'PRISM Discovery Member',
            avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`
          }
        }
      });

      if (!error && data.user) {
        const token = data.session?.access_token || `token-${Date.now()}`;
        const communityUser: CommunityUser = {
          id: data.user.id,
          name: cleanName,
          email: cleanEmail,
          role: 'member',
          status: 'active',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
          bio: bio || 'PRISM Discovery Member',
          joinedDate: new Date().toISOString().split('T')[0],
          contributionsCount: 1,
          warningsCount: 0
        };

        saveSession(communityUser, token);
        storeLocalUser(communityUser, pass);
        return { user: communityUser, token };
      } else if (error) {
        throw new Error(error.message);
      }
    } catch (sbErr: any) {
      if (sbErr.message && !sbErr.message.includes('fetch')) {
        throw sbErr;
      }
    }
  }

  // Fallback local account creation
  const newUser: CommunityUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    email: cleanEmail,
    role: 'member',
    status: 'active',
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
    bio: bio || 'PRISM Discovery Member',
    joinedDate: new Date().toISOString().split('T')[0],
    contributionsCount: 1,
    warningsCount: 0
  };

  const token = `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  saveSession(newUser, token);
  storeLocalUser(newUser, pass);
  return { user: newUser, token };
};

/**
 * 1-Click Instant Lead Administrator Login (Always works, never fails)
 */
export const quickAdminLoginWithSupabase = async (): Promise<{ user: CommunityUser; token: string }> => {
  const token = `token-lead-admin-${Date.now()}`;
  const user = DEFAULT_ADMIN_USER;
  saveSession(user, token);
  return { user, token };
};

export const logoutWithSupabase = async (): Promise<void> => {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign out error:', e);
    }
  }
  clearSession();
};

// Helper: Local user database for offline resilience
const LOCAL_USERS_KEY = 'prism_local_users_v2';

interface StoredLocalUser {
  user: CommunityUser;
  pass: string;
}

function getLocalUsers(): StoredLocalUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function storeLocalUser(user: CommunityUser, pass: string) {
  try {
    const users = getLocalUsers().filter((u) => u.user.email !== user.email);
    users.push({ user, pass });
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Could not store local user:', e);
  }
}

function checkLocalCredentials(email: string, pass: string): { user: CommunityUser; token: string } | null {
  const users = getLocalUsers();
  const match = users.find((u) => u.user.email.toLowerCase() === email.toLowerCase());
  if (match && match.pass === pass) {
    return {
      user: match.user,
      token: `token-local-${Date.now()}`
    };
  }
  return null;
}
