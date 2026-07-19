import postgres from "postgres";

// This replaces the Supabase client with a shared postgres.js connection.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = postgres(connectionString);

// postgres.js's JSONValue type rejects typed interfaces without index
// signatures, even though they serialize fine — cast once here.
export const jsonb = (value: unknown) => sql.json(value as postgres.JSONValue);

export default sql;
