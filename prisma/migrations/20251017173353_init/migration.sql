-- CreateTable
CREATE TABLE "EndUserLead" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "projectId" TEXT,
    "tenant" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EndUserLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "domain" TEXT,
    "slug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EndUserLead_tenant_idx" ON "EndUserLead"("tenant");

-- CreateIndex
CREATE INDEX "EndUserLead_createdAt_idx" ON "EndUserLead"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessUser_email_key" ON "BusinessUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessUser_slug_key" ON "BusinessUser"("slug");

-- CreateIndex
CREATE INDEX "BusinessUser_createdAt_idx" ON "BusinessUser"("createdAt");
