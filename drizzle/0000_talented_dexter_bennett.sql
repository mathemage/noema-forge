CREATE TYPE "public"."capture_source" AS ENUM('typed', 'voice', 'ocr');--> statement-breakpoint
CREATE TYPE "public"."upload_kind" AS ENUM('audio', 'image');--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"source" "capture_source" DEFAULT 'typed' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "upload_assets" (
	"byte_size" integer NOT NULL,
	"content_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"entry_id" text,
	"id" text PRIMARY KEY NOT NULL,
	"kind" "upload_kind" NOT NULL,
	"storage_key" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "upload_assets_storage_key_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"display_name" text,
	"email" text NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upload_assets" ADD CONSTRAINT "upload_assets_entry_id_journal_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."journal_entries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upload_assets" ADD CONSTRAINT "upload_assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "journal_entries_user_created_at_idx" ON "journal_entries" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "upload_assets_user_created_at_idx" ON "upload_assets" USING btree ("user_id","created_at");