/*
  Warnings:

  - You are about to drop the `EndUserLead` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."EndUserLead";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "projectId" TEXT,
    "tenant" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "User_tenant_idx" ON "User"("tenant");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
