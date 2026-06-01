import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = 'https://gfeuxcejhwqrkrrocxuw.supabase.co';
const supabaseAnonKey = 'sb_publishable_xz36R59wmmRbaOVNCCpqLQ_zxHRc9Zq';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);