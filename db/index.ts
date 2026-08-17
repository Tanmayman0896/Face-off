import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Lazy initialization: neon() is only called on first actual DB use,
// not at module evaluation time. This prevents build failures when
// DATABASE_URL is not present in the build environment.
let _db: NeonHttpDatabase<typeof schema> | null = null;

function getDb(): NeonHttpDatabase<typeof schema> {
  if (!_db) {
    let connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    // Strip surrounding quotes if present (e.g. if loaded raw from .env)
    connectionString = connectionString.replace(/^['"]|['"]$/g, '');
    
    _db = drizzle(neon(connectionString), { schema });
  }
  return _db;
}

export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_, prop: string | symbol) {
    return getDb()[prop as keyof NeonHttpDatabase<typeof schema>];
  },
});
