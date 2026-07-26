-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS "products_product_id_seq";
CREATE SEQUENCE IF NOT EXISTS "orders_order_id_seq";
CREATE SEQUENCE IF NOT EXISTS "order_items_order_item_id_seq";
CREATE SEQUENCE IF NOT EXISTS "payments_payment_id_seq";
CREATE SEQUENCE IF NOT EXISTS "inventory_logs_log_id_seq";

-- CreateTable
CREATE TABLE "users" (
    "firebase_uid" VARCHAR(128) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20),
    "address" TEXT,
    "role" VARCHAR(20) NOT NULL DEFAULT 'customer',
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),

    CONSTRAINT "users_pkey" PRIMARY KEY ("firebase_uid")
);

-- CreateTable
CREATE TABLE "products" (
    "product_id" INTEGER NOT NULL DEFAULT nextval('products_product_id_seq'::regclass),
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(30),
    "price" NUMERIC(10,2) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),

    CONSTRAINT "products_pkey" PRIMARY KEY ("product_id"),
    CONSTRAINT "products_price_check" CHECK (price >= 0),
    CONSTRAINT "products_stock_quantity_check" CHECK (stock_quantity >= 0)
);

-- CreateTable
CREATE TABLE "orders" (
    "order_id" INTEGER NOT NULL DEFAULT nextval('orders_order_id_seq'::regclass),
    "user_id" VARCHAR(128) NOT NULL,
    "order_date" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "fulfillment_type" VARCHAR(20) NOT NULL,
    "delivery_address" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "payment_method" VARCHAR(20) NOT NULL,
    "payment_status" VARCHAR(20) NOT NULL DEFAULT 'unpaid',
    "total_amount" NUMERIC(10,2) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("order_id"),
    CONSTRAINT "orders_total_amount_check" CHECK (total_amount >= 0)
);

-- CreateTable
CREATE TABLE "order_items" (
    "order_item_id" INTEGER NOT NULL DEFAULT nextval('order_items_order_item_id_seq'::regclass),
    "order_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price_at_order" NUMERIC(10,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("order_item_id"),
    CONSTRAINT "order_items_quantity_check" CHECK (quantity > 0),
    CONSTRAINT "order_items_price_at_order_check" CHECK (price_at_order >= 0)
);

-- CreateTable
CREATE TABLE "payments" (
    "payment_id" INTEGER NOT NULL DEFAULT nextval('payments_payment_id_seq'::regclass),
    "order_id" INTEGER NOT NULL,
    "method" VARCHAR(20) NOT NULL,
    "amount" NUMERIC(10,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "transaction_ref" VARCHAR(150),
    "paid_at" TIMESTAMP WITHOUT TIME ZONE,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id"),
    CONSTRAINT "payments_amount_check" CHECK (amount >= 0)
);

-- CreateTable
CREATE TABLE "inventory_logs" (
    "log_id" INTEGER NOT NULL DEFAULT nextval('inventory_logs_log_id_seq'::regclass),
    "product_id" INTEGER NOT NULL,
    "change_type" VARCHAR(30) NOT NULL,
    "quantity_change" INTEGER NOT NULL,
    "reason" TEXT,
    "logged_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    "admin_id" VARCHAR(128),

    CONSTRAINT "inventory_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_orders_status" ON "orders"("status");

-- CreateIndex
CREATE INDEX "idx_orders_user_id" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "idx_order_items_order_id" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "idx_order_items_product_id" ON "order_items"("product_id");

-- CreateIndex
CREATE INDEX "idx_payments_order_id" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "idx_inventory_logs_product_id" ON "inventory_logs"("product_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("firebase_uid") ON DELETE RESTRICT;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE RESTRICT;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("firebase_uid") ON DELETE SET NULL;
