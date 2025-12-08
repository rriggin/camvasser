-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "tenant" TEXT,
    "companyId" TEXT,
    "creatorId" TEXT,
    "creatorType" TEXT,
    "creatorName" TEXT,
    "status" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "public" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT,
    "address" TEXT,
    "streetAddress2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "slug" TEXT,
    "projectUrl" TEXT,
    "publicUrl" TEXT,
    "embeddedProjectUrl" TEXT,
    "coordinates" JSONB,
    "geofence" JSONB,
    "featureImage" JSONB,
    "photoCount" INTEGER NOT NULL DEFAULT 0,
    "photos" JSONB,
    "videos" JSONB,
    "documents" JSONB,
    "integrations" JSONB,
    "primaryContact" JSONB,
    "notepad" TEXT,
    "ccCreatedAt" INTEGER,
    "ccUpdatedAt" INTEGER,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectLabel" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,
    "displayValue" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "tagType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectLabel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Project_tenant_idx" ON "Project"("tenant");

-- CreateIndex
CREATE INDEX "Project_address_idx" ON "Project"("address");

-- CreateIndex
CREATE INDEX "Project_city_state_idx" ON "Project"("city", "state");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_ccUpdatedAt_idx" ON "Project"("ccUpdatedAt");

-- CreateIndex
CREATE INDEX "Project_lastSyncedAt_idx" ON "Project"("lastSyncedAt");

-- CreateIndex
CREATE INDEX "ProjectLabel_projectId_idx" ON "ProjectLabel"("projectId");

-- CreateIndex
CREATE INDEX "ProjectLabel_value_idx" ON "ProjectLabel"("value");

-- AddForeignKey
ALTER TABLE "ProjectLabel" ADD CONSTRAINT "ProjectLabel_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
