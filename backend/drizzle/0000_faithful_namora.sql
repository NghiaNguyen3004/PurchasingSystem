CREATE TABLE "requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"item_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"price_per_unit" integer NOT NULL,
	"budget_code" text NOT NULL,
	"reason" text NOT NULL,
	"requested_by" text NOT NULL,
	"status" text DEFAULT 'Pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "quantity_check" CHECK ("requests"."quantity" > 0),
	CONSTRAINT "price_check" CHECK ("requests"."price_per_unit" > 0),
	CONSTRAINT "status_check" CHECK ("requests"."status" in ('Pending', 'Approved', 'Rejected'))
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"user_type" text NOT NULL,
	"password" text NOT NULL,
	"department" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_type_check" CHECK ("users"."user_type" in ('Requester', 'Approver'))
);
--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;