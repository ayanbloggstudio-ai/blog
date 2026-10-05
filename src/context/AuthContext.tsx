import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CommunityUser } from '../types/community';
import { apiClient, getAuthToken, setAuthToken } from '../services/apiClient';
import { getStoredSession } from '../services/supabaseAuthService';

interface AuthContextType {
  user: CommunityUser | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  authError: string | null;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<boolean>;
  quickAdminLogin: () => Promise<boolean>;
  claimAdmin: () => Promise<boolean>;
  signup: (name: string, email: string, pass: string, bio?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: { name?: string; avatar?: string; bio?: string }) => Promise<boolean>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CommunityUser | null>(null);
  const [token, setTokenState] = useState<string | null>(getAuthToken);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Modal Controls
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const openAuthModal = useCallback((mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setAuthError(null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthError(null);
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Validate existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const stored = getStoredSession();
      if (stored.user) {
        setUser(stored.user);
        setTokenState(stored.token);
      }

      const storedToken = stored.token || getAuthToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await apiClient.getMe();
        if (res.user) {
          setUser(res.user);
          setTokenState(storedToken);
        }
      } catch {
        // If stored session is valid, keep it active
        if (!stored.user) {
          setAuthToken(null);
          setTokenState(null);
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const res = await apiClient.login({ email, password: pass });
      setUser(res.user);
      setTokenState(res.token);
      setIsAuthModalOpen(false);
      return true;
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please check your credentials.');
      return false;
    }
  };

  const quickAdminLogin = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      const res = await apiClient.quickAdminLogin();
      setUser(res.user);
      setTokenState(res.token);
      setIsAuthModalOpen(false);
      return true;
    } catch (err: any) {
      setAuthError(err.message || 'Admin authentication failed. Please verify the server is running.');
      return false;
    }
  };

  const claimAdmin = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      const res = await apiClient.claimAdmin();
      if (res.user) {
        setUser(res.user);
      }
      return true;
    } catch (err: any) {
      setAuthError(err.message || 'Failed to claim administrator role.');
      return false;
    }
  };

  const signup = async (name: string, email: string, pass: string, bio?: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const res = await apiClient.signup({ name, email, password: pass, bio });
      setUser(res.user);
      setTokenState(res.token);
      setIsAuthModalOpen(false);
      return true;
    } catch (err: any) {
      setAuthError(err.message || 'Signup failed. Please try a different email.');
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch {
      // ignore
    } finally {
      setUser(null);
      setTokenState(null);
      setAuthToken(null);
    }
  };

  const updateProfile = async (updates: { name?: string; avatar?: string; bio?: string }): Promise<boolean> => {
    try {
      const res = await apiClient.updateProfile(updates);
      setUser(res.user);
      return true;
    } catch (err: any) {
      setAuthError(err.message || 'Failed to update profile.');
      return false;
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        authError,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        quickAdminLogin,
        claimAdmin,
        signup,
        logout,
        updateProfile,
        clearAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
