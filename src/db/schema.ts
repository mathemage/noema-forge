import { sql } from "drizzle-orm";
import { index, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { captureSourceValues } from "@/lib/journal/capture-source";

const createdAt = timestamp("created_at", { withTimezone: true })
  .defaultNow()
  .notNull();

const updatedAt = timestamp("updated_at", { withTimezone: true })
  .defaultNow()
  .$onUpdate(() => new Date())
  .notNull();

export const captureSource = pgEnum("capture_source", captureSourceValues);
export const uploadKind = pgEnum("upload_kind", ["audio", "image"]);

export const users = pgTable("users", {
  createdAt,
  displayName: text("display_name"),
  email: text("email").notNull().unique(),
  id: text("id").primaryKey(),
  passwordHash: text("password_hash"),
  updatedAt,
});

export const userSessions = pgTable(
  "user_sessions",
  {
    createdAt,
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    id: text("id").primaryKey(),
    tokenHash: text("token_hash").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("user_sessions_user_expires_at_idx").on(table.userId, table.expiresAt)],
);

export const journalEntries = pgTable(
  "journal_entries",
  {
    body: text("body").notNull(),
    createdAt,
    id: text("id").primaryKey(),
    source: captureSource("source").default("typed").notNull(),
    updatedAt,
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("journal_entries_user_created_at_idx").on(table.userId, table.createdAt),
    index("journal_entries_body_search_idx").using(
      "gin",
      sql`to_tsvector('simple', ${table.body})`,
    ),
  ],
);

export const uploadAssets = pgTable(
  "upload_assets",
  {
    byteSize: integer("byte_size").notNull(),
    contentType: text("content_type").notNull(),
    createdAt,
    entryId: text("entry_id").references(() => journalEntries.id, {
      onDelete: "set null",
    }),
    id: text("id").primaryKey(),
    kind: uploadKind("kind").notNull(),
    storageKey: text("storage_key").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("upload_assets_user_created_at_idx").on(table.userId, table.createdAt)],
);
