import postgres from "postgres";

// This replaces the Supabase client with a shared postgres.js connection.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = postgres(connectionString);

export default sql;
