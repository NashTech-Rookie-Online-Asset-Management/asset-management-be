/*
  Warnings:

  - You are about to alter the column `name` on the `Asset` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `specification` on the `Asset` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(256)`.
  - You are about to alter the column `note` on the `Assignment` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(256)`.
  - You are about to alter the column `name` on the `Category` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(24)`.

*/
-- AlterTable
ALTER TABLE "Asset" ALTER COLUMN "name" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "specification" SET DATA TYPE VARCHAR(256);

-- AlterTable
ALTER TABLE "Assignment" ALTER COLUMN "note" SET DATA TYPE VARCHAR(256);

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "name" SET DATA TYPE VARCHAR(24);
