CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "user_type_check";--> statement-breakpoint
ALTER TABLE "requests" ALTER COLUMN "price_per_unit" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "user_type";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "user_type_check" CHECK ( in ('Requester', 'Approver'));