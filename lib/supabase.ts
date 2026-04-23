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

import sql from "@/lib/db";

export const supabase = sql;

