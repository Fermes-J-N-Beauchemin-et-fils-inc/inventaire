-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockoutUntil" TIMESTAMP(3),
    "role" TEXT NOT NULL DEFAULT 'admin',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "common_name" TEXT,
    "unit_type_id" INTEGER NOT NULL,
    "storage_id" INTEGER NOT NULL,
    "current_stock" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "price_per_ms" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "price_per_tqs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ms_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "real_animal_count" INTEGER NOT NULL,
    "animals_fed" INTEGER NOT NULL,
    "notes" TEXT,
    "important_notes" TEXT,
    "performance_index" DOUBLE PRECISION NOT NULL,
    "weather" TEXT,
    "season" TEXT,

    CONSTRAINT "group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_serving" (
    "id" SERIAL NOT NULL,
    "food_id" INTEGER NOT NULL,
    "group_id" INTEGER NOT NULL,
    "daily_kg_serving_ms" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "daily_serving_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "logo" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery" (
    "id" SERIAL NOT NULL,
    "contract_id" INTEGER NOT NULL,
    "food_id" INTEGER NOT NULL,
    "quantity_received" DOUBLE PRECISION NOT NULL,
    "date_delivered" TIMESTAMP(3) NOT NULL,
    "date_expected" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "supplier_id" INTEGER NOT NULL,
    "food_id" INTEGER NOT NULL,
    "total_kg" DOUBLE PRECISION NOT NULL,
    "kg_left_to_deliver" DOUBLE PRECISION NOT NULL,
    "price_per_kg" DOUBLE PRECISION NOT NULL,
    "date_start" TIMESTAMP(3) NOT NULL,
    "date_end" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "max_capacity" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "storage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ration_to_kg" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_snapshot" (
    "id" SERIAL NOT NULL,
    "food_id" INTEGER NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ms_percentage" DOUBLE PRECISION NOT NULL,
    "price_per_ms" DOUBLE PRECISION NOT NULL,
    "price_per_tqs" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "food_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transaction" (
    "id" SERIAL NOT NULL,
    "food_id" INTEGER NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "transaction_type" TEXT NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_snapshot" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "real_animal_count" INTEGER NOT NULL,
    "animals_fed" INTEGER NOT NULL,
    "performance_index" DOUBLE PRECISION NOT NULL,
    "weather" TEXT,
    "season" TEXT,

    CONSTRAINT "group_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food" ADD CONSTRAINT "food_unit_type_id_fkey" FOREIGN KEY ("unit_type_id") REFERENCES "unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food" ADD CONSTRAINT "food_storage_id_fkey" FOREIGN KEY ("storage_id") REFERENCES "storage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_serving" ADD CONSTRAINT "daily_serving_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_serving" ADD CONSTRAINT "daily_serving_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery" ADD CONSTRAINT "delivery_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery" ADD CONSTRAINT "delivery_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract" ADD CONSTRAINT "contract_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_snapshot" ADD CONSTRAINT "food_snapshot_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "food"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transaction" ADD CONSTRAINT "stock_transaction_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "food"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_snapshot" ADD CONSTRAINT "group_snapshot_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

