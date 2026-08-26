CREATE TYPE "public"."assistance_source" AS ENUM('fallback', 'ollama');--> statement-breakpoint
CREATE TYPE "public"."session_type" AS ENUM('reflection', 'decision', 'practice', 'review');--> statement-breakpoint
CREATE TABLE "journal_sessions" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"protocol_variant" text NOT NULL,
	"type" "session_type" NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "assistance_source" "assistance_source";--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "feeling" text;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "follow_up_question" text;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "next_step" text;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "raw_body" text;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "root_issue" text;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "session_id" text;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "suggestions" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
UPDATE "journal_entries" SET "raw_body" = "body" WHERE "raw_body" IS NULL;--> statement-breakpoint
UPDATE "journal_entries" SET "session_id" = gen_random_uuid()::text WHERE "session_id" IS NULL;--> statement-breakpoint
INSERT INTO "journal_sessions" ("created_at", "id", "protocol_variant", "type", "updated_at", "user_id")
SELECT "created_at", "session_id", 'guided-reflection-v1', 'reflection', "updated_at", "user_id"
FROM "journal_entries";--> statement-breakpoint
ALTER TABLE "journal_entries" ALTER COLUMN "raw_body" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "journal_entries" ALTER COLUMN "session_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "journal_sessions" ADD CONSTRAINT "journal_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "journal_sessions_user_created_at_idx" ON "journal_sessions" USING btree ("user_id","created_at");--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_session_id_journal_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."journal_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "journal_entries_session_id_idx" ON "journal_entries" USING btree ("session_id");
