

import { Pool, neonConfig, neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import * as dotenv from "dotenv";
import ws from "ws";
import dns from "node:dns";

// Broken/slow IPv6 routes cause ETIMEDOUT AggregateErrors on the wss handshake; prefer IPv4
dns.setDefaultResultOrder("ipv4first");

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

// Node's native WebSocket has been unreliable against Neon's pooler in dev; use `ws` explicitly
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL || "";

// Plain-HTTP client for regular queries: avoids WebSocket flakiness entirely
export const db = drizzleHttp(neon(connectionString), { schema });

// Reuse the pool across Next.js dev hot-reloads to avoid exhausting Neon connections
const globalForDb = globalThis as unknown as { pool?: Pool };

const pool = globalForDb.pool ?? new Pool({ connectionString });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

// WebSocket-backed client, only needed where real multi-statement transactions are required
export const dbPool = drizzle(pool, { schema });

