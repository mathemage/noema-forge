CREATE TYPE "public"."severity_instrument" AS ENUM('phq-9', 'gad-7');--> statement-breakpoint
CREATE TABLE "safety_plans" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"distraction" text NOT NULL,
	"internal_coping" text NOT NULL,
	"means_safety" text NOT NULL,
	"means_safety_acknowledged" boolean DEFAULT false NOT NULL,
	"professional_contacts" text NOT NULL,
	"support_contacts" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" text PRIMARY KEY NOT NULL,
	"warning_signs" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "safety_profiles" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"limits_acknowledged_at" timestamp with time zone,
	"trauma_writing_opted_in_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "severity_check_ins" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"instrument" "severity_instrument" NOT NULL,
	"score" integer NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "safety_plans" ADD CONSTRAINT "safety_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safety_profiles" ADD CONSTRAINT "safety_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "severity_check_ins" ADD CONSTRAINT "severity_check_ins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "severity_check_ins_user_instrument_created_at_idx" ON "severity_check_ins" USING btree ("user_id","instrument","created_at");