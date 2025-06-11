import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../shared/schema.sqlite";

const sqlite = new Database("./database.sqlite");
export const db = drizzle(sqlite, { schema });

// Enable WAL mode for better performance
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("synchronous = NORMAL");
sqlite.pragma("cache_size = 1000000");
sqlite.pragma("foreign_keys = ON");
sqlite.pragma("temp_store = MEMORY");

export { sqlite };