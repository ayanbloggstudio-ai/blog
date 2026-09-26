import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG_STORAGE_KEY = 'prism_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  autoSyncEnabled: boolean;
}

// Get initial config from environment or localStorage
export const getSupabaseConfig = (): SupabaseConfig => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  const envServiceKey = (import.meta as any).env?.SUPABASE_SERVICE_ROLE_KEY || '';

  let storedConfig: Partial<SupabaseConfig> = {};
  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_STORAGE_KEY);
    if (saved) {
      storedConfig = JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Could not read supabase config from localStorage:', e);
  }

  return {
    url: storedConfig.url || envUrl || '',
    anonKey: storedConfig.anonKey || envKey || '',
    serviceRoleKey: storedConfig.serviceRoleKey || envServiceKey || '',
    autoSyncEnabled: storedConfig.autoSyncEnabled ?? true
  };
};

export const saveSupabaseConfig = (config: SupabaseConfig) => {
  try {
    localStorage.setItem(SUPABASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Could not save supabase config to localStorage:', e);
  }
};

let cachedClient: SupabaseClient | null = null;
let currentConfigKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  const key = `${config.url}:::${config.anonKey}`;
  if (cachedClient && currentConfigKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    currentConfigKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
};
