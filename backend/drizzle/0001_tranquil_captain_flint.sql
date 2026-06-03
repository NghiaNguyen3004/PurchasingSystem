ALTER TABLE "users" DROP CONSTRAINT "user_type_check";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "user_type_check" CHECK ("users"."user_type" in ('Requester', 'Approver','Admin'));