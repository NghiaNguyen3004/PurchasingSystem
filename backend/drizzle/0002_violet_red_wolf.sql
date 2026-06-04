ALTER TABLE "requests" ADD COLUMN "expected_date" date NOT NULL;--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "recommended_supplier" text;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "expected_date_check" CHECK ("requests"."expected_date" >= CURRENT_DATE);