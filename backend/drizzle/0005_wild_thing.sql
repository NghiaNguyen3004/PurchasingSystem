ALTER TABLE "request_items" DROP CONSTRAINT "request_items_supplier_item_id_unique";--> statement-breakpoint
ALTER TABLE "request_items" DROP COLUMN "item_code";--> statement-breakpoint
ALTER TABLE "request_items" ADD CONSTRAINT "request_items_request_id_supplier_item_id_unique" UNIQUE("request_id","supplier_item_id");