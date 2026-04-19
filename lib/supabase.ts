/*
CREATE TABLE cached_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  last_fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  profile JSONB NOT NULL,
  films JSONB NOT NULL DEFAULT '[]',
  stats JSONB NOT NULL,
  recommendations JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cached_profiles_username ON cached_profiles(username);
*/

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

