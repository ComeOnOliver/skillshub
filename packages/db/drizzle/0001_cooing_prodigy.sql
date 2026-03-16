ALTER TABLE "skills" DROP CONSTRAINT "skills_slug_unique";--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "github_repo_url" text;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "github_owner" text;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "github_repo_name" text;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "github_stars" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "language" text;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "license" text;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "install_command" text;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "weekly_installs" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "imported_at" timestamp;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "source" text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
CREATE INDEX "skills_github_stars_idx" ON "skills" USING btree ("github_stars");--> statement-breakpoint
CREATE UNIQUE INDEX "skills_owner_slug_idx" ON "skills" USING btree ("owner_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "skills_github_owner_repo_idx" ON "skills" USING btree ("github_owner","github_repo_name");