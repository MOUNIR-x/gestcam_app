CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"company" text NOT NULL,
	"niu" text,
	"rccm" text,
	"phone" text NOT NULL,
	"email" text,
	"city" text DEFAULT 'Douala' NOT NULL,
	"total_spent" integer DEFAULT 0 NOT NULL,
	"outstanding_balance" integer DEFAULT 0 NOT NULL,
	"invoices_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"commercial_name" text NOT NULL,
	"niu" text NOT NULL,
	"rccm" text NOT NULL,
	"cdi" text NOT NULL,
	"regime" text DEFAULT 'REEL' NOT NULL,
	"address" text NOT NULL,
	"city" text DEFAULT 'Douala' NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"website" text,
	"tva_rate" double precision DEFAULT 0.1925 NOT NULL,
	"acompte_rate" double precision DEFAULT 0.022 NOT NULL,
	"enable_tva" boolean DEFAULT true NOT NULL,
	"enable_acompte" boolean DEFAULT true NOT NULL,
	"stock_low_alert_threshold" integer DEFAULT 15 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fraud_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"severity" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"amount" integer,
	"entity_id" text,
	"entity_type" text,
	"timestamp" text NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"product_id" integer,
	"description" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_ht" integer NOT NULL,
	"total_ht" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_number" text NOT NULL,
	"date" text NOT NULL,
	"due_date" text NOT NULL,
	"client_id" integer,
	"client_name" text NOT NULL,
	"client_niu" text,
	"client_phone" text,
	"client_city" text,
	"status" text DEFAULT 'EN_ATTENTE' NOT NULL,
	"total_ht" integer NOT NULL,
	"tva_rate" double precision DEFAULT 0.1925 NOT NULL,
	"tva_amount" integer NOT NULL,
	"acompte_rate" double precision DEFAULT 0.022 NOT NULL,
	"acompte_amount" integer NOT NULL,
	"total_ttc" integer NOT NULL,
	"net_a_payer" integer NOT NULL,
	"payment_method" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"unit" text DEFAULT 'Pièce' NOT NULL,
	"purchase_price" integer NOT NULL,
	"selling_price" integer NOT NULL,
	"cmup" integer NOT NULL,
	"stock_current" integer DEFAULT 0 NOT NULL,
	"stock_min" integer DEFAULT 10 NOT NULL,
	"margin_percent" double precision DEFAULT 0 NOT NULL,
	"supplier_id" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "products_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference_doc" text NOT NULL,
	"date" text NOT NULL,
	"type" text NOT NULL,
	"product_id" integer,
	"product_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_cost" integer NOT NULL,
	"total_cost" integer NOT NULL,
	"new_cmup" integer NOT NULL,
	"reason" text,
	"performed_by" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"contact_name" text,
	"phone" text,
	"city" text DEFAULT 'Douala',
	"total_purchased" integer DEFAULT 0 NOT NULL,
	"balance_owed" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "treasury_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"account_number" text,
	"balance" integer DEFAULT 0 NOT NULL,
	"today_inflow" integer DEFAULT 0 NOT NULL,
	"today_outflow" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'FCFA' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "treasury_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"time" text NOT NULL,
	"account_id" integer,
	"account_name" text NOT NULL,
	"channel" text NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"amount" integer NOT NULL,
	"description" text,
	"reference_number" text,
	"status" text DEFAULT 'COMPLETE' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"role" text DEFAULT 'Gérant PME',
	"company_name" text DEFAULT 'BatiCam Distribution Sarl',
	"city" text DEFAULT 'Douala',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "treasury_transactions" ADD CONSTRAINT "treasury_transactions_account_id_treasury_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."treasury_accounts"("id") ON DELETE no action ON UPDATE no action;