import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { captureSourceValues } from "@/lib/journal/capture-source";
import { sessionTypeValues } from "@/lib/journal/session";
import { severityInstrumentValues } from "@/lib/safety/instruments";

const createdAt = timestamp("created_at", { withTimezone: true })
  .defaultNow()
  .notNull();

const updatedAt = timestamp("updated_at", { withTimezone: true })
  .defaultNow()
  .$onUpdate(() => new Date())
  .notNull();

export const assistanceSource = pgEnum("assistance_source", ["fallback", "ollama"]);
export const captureSource = pgEnum("capture_source", captureSourceValues);
export const sessionType = pgEnum("session_type", sessionTypeValues);
export const severityInstrument = pgEnum(
  "severity_instrument",
  severityInstrumentValues,
);
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

export const journalSessions = pgTable(
  "journal_sessions",
  {
    createdAt,
    id: text("id").primaryKey(),
    protocolVariant: text("protocol_variant").notNull(),
    type: sessionType("type").notNull(),
    updatedAt,
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("journal_sessions_user_created_at_idx").on(table.userId, table.createdAt),
  ],
);

export const journalEntries = pgTable(
  "journal_entries",
  {
    assistanceSource: assistanceSource("assistance_source"),
    // The rendered plain-text view of the entry, kept for reading and search.
    body: text("body").notNull(),
    createdAt,
    feeling: text("feeling"),
    followUpQuestion: text("follow_up_question"),
    id: text("id").primaryKey(),
    nextStep: text("next_step"),
    rawBody: text("raw_body").notNull(),
    rootIssue: text("root_issue"),
    sessionId: text("session_id")
      .notNull()
      .references(() => journalSessions.id, { onDelete: "cascade" }),
    source: captureSource("source").default("typed").notNull(),
    suggestions: text("suggestions").array().notNull().default([]),
    updatedAt,
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("journal_entries_user_created_at_idx").on(table.userId, table.createdAt),
    index("journal_entries_session_id_idx").on(table.sessionId),
    index("journal_entries_body_search_idx").using(
      "gin",
      sql`to_tsvector('simple', ${table.body})`,
    ),
  ],
);

export const safetyProfiles = pgTable("safety_profiles", {
  createdAt,
  // Null until the user has read the limits statement, which gates the first session.
  limitsAcknowledgedAt: timestamp("limits_acknowledged_at", { withTimezone: true }),
  // Null until the user opts in, which is what makes trauma-writing prompts reachable.
  traumaWritingOptedInAt: timestamp("trauma_writing_opted_in_at", {
    withTimezone: true,
  }),
  updatedAt,
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const safetyPlans = pgTable("safety_plans", {
  createdAt,
  distraction: text("distraction").notNull(),
  internalCoping: text("internal_coping").notNull(),
  meansSafety: text("means_safety").notNull(),
  // Step 6 may only be left blank behind an explicit acknowledgement.
  meansSafetyAcknowledged: boolean("means_safety_acknowledged")
    .notNull()
    .default(false),
  professionalContacts: text("professional_contacts").notNull(),
  supportContacts: text("support_contacts").notNull(),
  updatedAt,
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  warningSigns: text("warning_signs").notNull(),
});

export const severityCheckIns = pgTable(
  "severity_check_ins",
  {
    createdAt,
    id: text("id").primaryKey(),
    instrument: severityInstrument("instrument").notNull(),
    // The summed score only. The app stores it and never interprets it.
    score: integer("score").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("severity_check_ins_user_instrument_created_at_idx").on(
      table.userId,
      table.instrument,
      table.createdAt,
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
