-- CreateTable
CREATE TABLE "Prospect" (
    "id" TEXT NOT NULL,
    "whitepagesId" TEXT NOT NULL,
    "projectId" TEXT,
    "name" TEXT NOT NULL,
    "aliases" JSONB,
    "isDead" BOOLEAN NOT NULL DEFAULT false,
    "dateOfBirth" TEXT,
    "phones" JSONB,
    "emails" JSONB,
    "currentAddresses" JSONB,
    "historicAddresses" JSONB,
    "ownedProperties" JSONB,
    "linkedinUrl" TEXT,
    "companyName" TEXT,
    "jobTitle" TEXT,
    "relatives" JSONB,
    "isHomeowner" BOOLEAN NOT NULL DEFAULT false,
    "isCurrentResident" BOOLEAN NOT NULL DEFAULT false,
    "lookupAddress" TEXT,
    "tenant" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prospect_whitepagesId_key" ON "Prospect"("whitepagesId");

-- CreateIndex
CREATE INDEX "Prospect_projectId_idx" ON "Prospect"("projectId");

-- CreateIndex
CREATE INDEX "Prospect_tenant_idx" ON "Prospect"("tenant");

-- CreateIndex
CREATE INDEX "Prospect_isHomeowner_idx" ON "Prospect"("isHomeowner");

-- CreateIndex
CREATE INDEX "Prospect_isCurrentResident_idx" ON "Prospect"("isCurrentResident");

-- CreateIndex
CREATE INDEX "Prospect_name_idx" ON "Prospect"("name");

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
