
import { createClient } from '@supabase/supabase-js';

// Helper to safely access env vars whether in Vite, standard browser, or Node
const getEnvVar = (key: string) => {
  try {
    // Check for Vite
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[key] || '';
    }
    // Check for standard process.env (if polyfilled)
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || '';
    }
  } catch (e) {
    // Ignore errors in strict environments
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseKey;

// Fallback to avoid crashing the app if keys are missing.
// We use a dummy URL that won't work, but allows React to render the error UI.
const validUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const validKey = isSupabaseConfigured ? supabaseKey : 'placeholder-key';

if (!isSupabaseConfigured) {
    console.warn("Supabase not configured. Application running in safe mode.");
}

export const supabase = createClient(validUrl, validKey);
