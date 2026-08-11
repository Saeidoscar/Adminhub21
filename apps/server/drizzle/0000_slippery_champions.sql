CREATE TYPE "public"."billing_cycle" AS ENUM('monthly', 'project', 'hourly');--> statement-breakpoint
CREATE TYPE "public"."contract_status" AS ENUM('active', 'pending', 'completed', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."package_type" AS ENUM('platform', 'bundle');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('employer', 'admin');--> statement-breakpoint
CREATE TABLE "admin_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"photo" text,
	"rating" double precision DEFAULT 0 NOT NULL,
	"reviews" integer DEFAULT 0 NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"insured" boolean DEFAULT false NOT NULL,
	"monthly_toman" integer DEFAULT 0 NOT NULL,
	"monthly_usd" integer DEFAULT 0 NOT NULL,
	"bio_en" text,
	"bio_fa" text,
	"skills_en" text[],
	"skills_fa" text[],
	"platforms" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"employer_id" uuid NOT NULL,
	"admin_id" uuid NOT NULL,
	"platform" text NOT NULL,
	"status" "contract_status" DEFAULT 'pending' NOT NULL,
	"amount_toman" integer NOT NULL,
	"amount_usd" integer NOT NULL,
	"has_insurance" boolean DEFAULT false NOT NULL,
	"has_substitute" boolean DEFAULT false NOT NULL,
	"term_clause" text,
	"substitute_clause" text,
	"start_date" text,
	"end_date" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contracts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "custom_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"package_id" uuid,
	"admin_id" uuid NOT NULL,
	"employer_id" uuid NOT NULL,
	"employer_name" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"platforms" text[] DEFAULT '{}' NOT NULL,
	"platform_configs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"proposed_price_toman" integer,
	"proposed_price_usd" integer,
	"billing_cycle" "billing_cycle" NOT NULL,
	"delivery_time" text,
	"start_date" text,
	"end_date" text,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "editors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_en" text NOT NULL,
	"name_fa" text NOT NULL,
	"photo" text NOT NULL,
	"specialty" text NOT NULL,
	"rating" double precision DEFAULT 0 NOT NULL,
	"reviews" integer DEFAULT 0 NOT NULL,
	"projects" integer DEFAULT 0 NOT NULL,
	"delivery" text NOT NULL,
	"rate_toman" integer NOT NULL,
	"rate_usd" integer NOT NULL,
	"bio_en" text NOT NULL,
	"bio_fa" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"user_id" uuid NOT NULL,
	"admin_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"type" "package_type" NOT NULL,
	"platforms" text[] DEFAULT '{}' NOT NULL,
	"platform_configs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"price_toman" integer NOT NULL,
	"price_usd" integer NOT NULL,
	"billing_cycle" "billing_cycle" NOT NULL,
	"delivery_time" text NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"icon" text NOT NULL,
	"rating" double precision DEFAULT 0 NOT NULL,
	"reviews" integer DEFAULT 0 NOT NULL,
	"popular" boolean DEFAULT false NOT NULL,
	"price_toman" integer NOT NULL,
	"price_usd" integer NOT NULL,
	"desc_en" text NOT NULL,
	"desc_fa" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" DEFAULT 'employer' NOT NULL,
	"name_en" text NOT NULL,
	"name_fa" text NOT NULL,
	"phone" text,
	"photo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vibe_coders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_en" text NOT NULL,
	"name_fa" text NOT NULL,
	"photo" text NOT NULL,
	"stack" text NOT NULL,
	"rating" double precision DEFAULT 0 NOT NULL,
	"reviews" integer DEFAULT 0 NOT NULL,
	"projects" integer DEFAULT 0 NOT NULL,
	"rate_toman" integer NOT NULL,
	"rate_usd" integer NOT NULL,
	"delivery" text NOT NULL,
	"bio_en" text NOT NULL,
	"bio_fa" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_profiles" ADD CONSTRAINT "admin_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_employer_id_users_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_admin_id_admin_profiles_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_offers" ADD CONSTRAINT "custom_offers_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_offers" ADD CONSTRAINT "custom_offers_admin_id_admin_profiles_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_offers" ADD CONSTRAINT "custom_offers_employer_id_users_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_admin_id_admin_profiles_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_admin_id_admin_profiles_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "favorites_user_admin" ON "favorites" USING btree ("user_id","admin_id");