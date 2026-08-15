CREATE TABLE "ai_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"input_cost" double precision DEFAULT 0 NOT NULL,
	"output_cost" double precision DEFAULT 0 NOT NULL,
	"context_window" integer,
	"api_base_url" text,
	"default_temperature" double precision,
	"max_output_tokens" integer,
	"supports_streaming" boolean DEFAULT false NOT NULL,
	"supports_vision" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_models_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "ai_messages" ADD COLUMN "provider" text;
--> statement-breakpoint
ALTER TABLE "ai_messages" ADD COLUMN "model_code" text;
--> statement-breakpoint
ALTER TABLE "ai_messages" ADD COLUMN "prompt_tokens" integer;
--> statement-breakpoint
ALTER TABLE "ai_messages" ADD COLUMN "completion_tokens" integer;
--> statement-breakpoint
ALTER TABLE "ai_messages" ADD COLUMN "total_tokens" integer;
--> statement-breakpoint
ALTER TABLE "ai_messages" ADD COLUMN "input_cost" double precision;
--> statement-breakpoint
ALTER TABLE "ai_messages" ADD COLUMN "output_cost" double precision;
--> statement-breakpoint
ALTER TABLE "ai_messages" ADD COLUMN "total_cost" double precision;
--> statement-breakpoint
ALTER TABLE "ai_messages" ADD COLUMN "response_time_ms" integer;
