import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDatabaseUrl, getDatabaseUrlNonPooling } from "@/lib/env";
import * as schema from "@/db/schema";

export function getDatabaseConnectionTargets() {
  return {
    app: getDatabaseUrl(),
    migrations: getDatabaseUrlNonPooling(),
  };
}

export function createPostgresClient(connectionString = getDatabaseUrl()) {
  return postgres(connectionString, {
    max: 1,
    prepare: false,
  });
}

export function createDatabase(connectionString = getDatabaseUrl()) {
  const client = createPostgresClient(connectionString);
  return drizzle(client, { schema });
}
