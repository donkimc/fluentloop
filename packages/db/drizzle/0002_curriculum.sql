CREATE TABLE "curriculum_nodes" (
	"id" text PRIMARY KEY NOT NULL,
	"level" text NOT NULL,
	"skill" text NOT NULL,
	"topic" text NOT NULL,
	"title" text NOT NULL,
	"korean" text NOT NULL,
	"summary" text NOT NULL,
	"headwords" jsonb NOT NULL
);
