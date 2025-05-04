// src/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with your URL and ANON key
const supabase = createClient(
  'YOUR_SUPABASE_URL',  // Replace with your Supabase URL
  'YOUR_SUPABASE_ANON_KEY'  // Replace with your Supabase Anon key
);

export default supabase;
