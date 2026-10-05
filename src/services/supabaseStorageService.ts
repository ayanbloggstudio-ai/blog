import { getSupabaseClient, getSupabaseConfig } from '../lib/supabase';

export interface StorageUploadResult {
  url: string;
  path: string;
  storage: 'supabase' | 'local_fallback';
  error?: string;
}

const BUCKET_NAME = 'prism-media';

/**
 * Checks if Supabase Storage is available and configured
 */
export const isSupabaseStorageConfigured = (): boolean => {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.anonKey);
};

/**
 * Ensures the 'prism-media' bucket exists if user has serviceRoleKey or public bucket access
 */
export const ensureMediaBucket = async (): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { data: buckets, error } = await client.storage.listBuckets();
    if (error) {
      console.warn('Could not list Supabase buckets:', error.message);
      return false;
    }

    const exists = (buckets || []).some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      const { error: createErr } = await client.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 20 * 1024 * 1024 // 20MB
      });
      if (createErr) {
        console.warn('Could not auto-create bucket prism-media (run SQL schema to create):', createErr.message);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.warn('Error checking/creating storage bucket:', err);
    return false;
  }
};

/**
 * Uploads an image File or Blob directly to Supabase Storage bucket 'prism-media'
 * and returns the public CDN URL. Falls back cleanly to data URL if Supabase is unconfigured.
 */
export const uploadImageToSupabase = async (
  file: File | Blob,
  fileNamePrefix = 'upload'
): Promise<StorageUploadResult> => {
  const client = getSupabaseClient();

  // If Supabase is not configured, fallback to data URL reader
  if (!client) {
    const dataUrl = await blobToDataUrl(file);
    return {
      url: dataUrl,
      path: '',
      storage: 'local_fallback'
    };
  }

  try {
    // Generate unique sanitized file path
    const timestamp = Date.now();
    const randomHex = Math.random().toString(36).substring(2, 9);
    let extension = 'jpg';

    if (file.type === 'image/png') extension = 'png';
    else if (file.type === 'image/webp') extension = 'webp';
    else if (file.type === 'image/gif') extension = 'gif';
    else if (file.type === 'image/svg+xml') extension = 'svg';

    const cleanPrefix = fileNamePrefix.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = `media/${cleanPrefix}_${timestamp}_${randomHex}.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await client.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        contentType: file.type || 'image/jpeg',
        upsert: true,
        cacheControl: '3600'
      });

    if (error) {
      console.warn('Supabase storage upload error:', error.message);
      // Fallback to data URL
      const dataUrl = await blobToDataUrl(file);
      return {
        url: dataUrl,
        path: '',
        storage: 'local_fallback',
        error: `Supabase storage upload error: ${error.message}. Saved locally.`
      };
    }

    // Retrieve public CDN URL
    const { data: publicUrlData } = client.storage.from(BUCKET_NAME).getPublicUrl(data.path);

    if (publicUrlData && publicUrlData.publicUrl) {
      return {
        url: publicUrlData.publicUrl,
        path: data.path,
        storage: 'supabase'
      };
    }

    const dataUrl = await blobToDataUrl(file);
    return {
      url: dataUrl,
      path: data.path,
      storage: 'local_fallback'
    };
  } catch (err: any) {
    console.warn('Upload exception, falling back to data URL:', err);
    const dataUrl = await blobToDataUrl(file);
    return {
      url: dataUrl,
      path: '',
      storage: 'local_fallback',
      error: err?.message || 'Storage error'
    };
  }
};

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
