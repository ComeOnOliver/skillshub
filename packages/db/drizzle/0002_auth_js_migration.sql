-- Auth.js migration: add accounts, verification_tokens tables and emailVerified column

-- Add email_verified column to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" timestamp;

-- Add default for username so Auth.js adapter can create users without explicit username
ALTER TABLE "users" ALTER COLUMN "username" SET DEFAULT 'user-' || substr(gen_random_uuid()::text, 1, 8);

-- Create accounts table for OAuth provider linking
CREATE TABLE IF NOT EXISTS "accounts" (
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "provider" text NOT NULL,
  "provider_account_id" text NOT NULL,
  "refresh_token" text,
  "access_token" text,
  "expires_at" integer,
  "token_type" text,
  "scope" text,
  "id_token" text,
  "session_state" text,
  PRIMARY KEY ("provider", "provider_account_id")
);

-- Create verification_tokens table for email magic links
CREATE TABLE IF NOT EXISTS "verification_tokens" (
  "identifier" text NOT NULL,
  "token" text NOT NULL,
  "expires" timestamp NOT NULL,
  PRIMARY KEY ("identifier", "token")
);
