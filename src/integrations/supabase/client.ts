import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ilgweiztccnsmktspwzd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsZ3dlaXp0Y2Nuc21rdHNwd3pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1MjMzMjQsImV4cCI6MjA1MTA5OTMyNH0.WU9AbIknSTGXQRdaBWfTjTn8kfJp2TTMVRdDeZfQqL0";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);