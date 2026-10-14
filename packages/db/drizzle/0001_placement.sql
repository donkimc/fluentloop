CREATE TABLE "placement_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"status" text NOT NULL,
	"state" jsonb NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "skill_estimates" (
	"user_id" text NOT NULL,
	"skill" text NOT NULL,
	"rating" double precision NOT NULL,
	"attempts" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skill_estimates_user_id_skill_pk" PRIMARY KEY("user_id","skill")
);
--> statement-breakpoint
ALTER TABLE "placement_sessions" ADD CONSTRAINT "placement_sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "skill_estimates" ADD CONSTRAINT "skill_estimates_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "placement_sessions_user_id_idx" ON "placement_sessions" USING btree ("user_id");
