import { MockDb } from "./mock-db";
import { env } from "$env/dynamic/private";

// We still check for DATABASE_URL to maintain compatibility with the original code
if (!env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set, using mock database with pre-defined test user");
  console.warn("You can log in with username: testuser and password: password123");
}

// Export our mock DB instead of Drizzle
export const db = MockDb;
