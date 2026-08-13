-- CreateEnum
CREATE TYPE "ContentLocale" AS ENUM ('en', 'ar');

-- CreateTable
CREATE TABLE "translations" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "locale" "ContentLocale" NOT NULL,
    "field" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "translations_entity_locale_idx" ON "translations"("entity", "locale");

-- CreateIndex
CREATE INDEX "translations_entity_entityId_idx" ON "translations"("entity", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "translations_entity_entityId_locale_field_key" ON "translations"("entity", "entityId", "locale", "field");
