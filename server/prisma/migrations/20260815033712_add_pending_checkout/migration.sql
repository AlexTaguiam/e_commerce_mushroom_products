-- CreateTable
CREATE TABLE "pending_checkouts" (
    "id" SERIAL NOT NULL,
    "payment_intent_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "contact_phone" TEXT,
    "fulfillment_type" TEXT NOT NULL,
    "delivery_address" TEXT,
    "payment_method" TEXT NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "cart_items_json" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_checkouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pending_checkouts_payment_intent_id_key" ON "pending_checkouts"("payment_intent_id");

-- AddForeignKey
ALTER TABLE "pending_checkouts" ADD CONSTRAINT "pending_checkouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("firebase_uid") ON DELETE RESTRICT ON UPDATE CASCADE;
