CREATE TABLE "equipe_membres" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" text NOT NULL,
	"fonction" text NOT NULL,
	"biographie" text,
	"photo_url" text,
	"ordre" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
