/*
  Warnings:

  - The values [UNAVAILABLE] on the enum `AssetState` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AssetState_new" AS ENUM ('AVAILABLE', 'ASSIGNED', 'NOT_AVAILABLE', 'RECYCLED', 'WAITING_FOR_RECYCLING');
ALTER TABLE "Asset" ALTER COLUMN "state" TYPE "AssetState_new" USING ("state"::text::"AssetState_new");
ALTER TYPE "AssetState" RENAME TO "AssetState_old";
ALTER TYPE "AssetState_new" RENAME TO "AssetState";
DROP TYPE "AssetState_old";
COMMIT;
