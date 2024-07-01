/*
  Warnings:

  - Added the required column `assignedDate` to the `ReturningRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ReturningRequest" DROP CONSTRAINT "ReturningRequest_acceptedById_fkey";

-- AlterTable
ALTER TABLE "ReturningRequest" ADD COLUMN     "assignedDate" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "acceptedById" DROP NOT NULL,
ALTER COLUMN "returnedDate" DROP NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "ReturningRequest" ADD CONSTRAINT "ReturningRequest_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
