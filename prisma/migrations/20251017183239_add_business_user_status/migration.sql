-- AlterTable
ALTER TABLE "BusinessUser" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "BusinessUser_status_idx" ON "BusinessUser"("status");
