-- AlterTable
ALTER TABLE "BusinessUser" ADD COLUMN     "passwordHash" TEXT;

-- CreateIndex
CREATE INDEX "BusinessUser_email_idx" ON "BusinessUser"("email");
