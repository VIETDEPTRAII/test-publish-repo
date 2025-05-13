import { createClient } from '@supabase/supabase-js';

// Default to empty strings to prevent Invalid URL error
// This will still show a warning but won't crash the app
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Todo = {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
};
