/*
  Warnings:

  - The values [TEMP] on the enum `RequestState` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RequestState_new" AS ENUM ('COMPLETED', 'WAITING_FOR_RETURNING');
ALTER TABLE "ReturningRequest" ALTER COLUMN "state" TYPE "RequestState_new" USING ("state"::text::"RequestState_new");
ALTER TYPE "RequestState" RENAME TO "RequestState_old";
ALTER TYPE "RequestState_new" RENAME TO "RequestState";
DROP TYPE "RequestState_old";
COMMIT;
