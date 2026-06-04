CREATE TABLE "purchase_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"supplier_id" integer NOT NULL,
	"request_type_id" integer NOT NULL,
	"department" text NOT NULL,
	"budget_code" text NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'Pending' NOT NULL,
	"timestamp" date DEFAULT now(),
	"expected_delivery" date NOT NULL,
	CONSTRAINT "status_check" CHECK ("purchase_requests"."status" in ('Pending', 'Approved','Processing', 'Completed', 'Rejected'))
);
--> statement-breakpoint
CREATE TABLE "request_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" integer NOT NULL,
	"item_code" text NOT NULL,
	"supplier_item_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_snapshot" numeric(10, 2),
	CONSTRAINT "request_items_request_id_unique" UNIQUE("request_id"),
	CONSTRAINT "request_items_supplier_item_id_unique" UNIQUE("supplier_item_id"),
	CONSTRAINT "quantity_check" CHECK ("request_items"."quantity" > 0),
	CONSTRAINT "unit_price_check" CHECK ("request_items"."unit_price_snapshot" >= 0)
);
--> statement-breakpoint
CREATE TABLE "request_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "request_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "supplier_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_id" integer NOT NULL,
	"item_code" text NOT NULL,
	"name" text NOT NULL,
	"unit" text NOT NULL,
	"price_per_unit" numeric(10, 2),
	CONSTRAINT "supplier_items_item_code_unique" UNIQUE("item_code"),
	CONSTRAINT "price_check" CHECK ("supplier_items"."price_per_unit" >= 0)
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_type_id" integer NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "suppliers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "requests" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "requests" CASCADE;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "user_type_check";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_request_type_id_request_types_id_fk" FOREIGN KEY ("request_type_id") REFERENCES "public"."request_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_items" ADD CONSTRAINT "request_items_request_id_purchase_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."purchase_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_items" ADD CONSTRAINT "request_items_item_code_supplier_items_item_code_fk" FOREIGN KEY ("item_code") REFERENCES "public"."supplier_items"("item_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_items" ADD CONSTRAINT "request_items_supplier_item_id_supplier_items_id_fk" FOREIGN KEY ("supplier_item_id") REFERENCES "public"."supplier_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_items" ADD CONSTRAINT "supplier_items_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_request_type_id_request_types_id_fk" FOREIGN KEY ("request_type_id") REFERENCES "public"."request_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "user_type";