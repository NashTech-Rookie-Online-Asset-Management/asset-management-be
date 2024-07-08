/*
  Warnings:

  - The values [TEMP] on the enum `AssignmentState` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AssignmentState_new" AS ENUM ('ACCEPTED', 'DECLINED', 'IS_REQUESTED', 'WAITING_FOR_ACCEPTANCE');
ALTER TABLE "Assignment" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "Assignment" ALTER COLUMN "state" TYPE "AssignmentState_new" USING ("state"::text::"AssignmentState_new");
ALTER TYPE "AssignmentState" RENAME TO "AssignmentState_old";
ALTER TYPE "AssignmentState_new" RENAME TO "AssignmentState";
DROP TYPE "AssignmentState_old";
ALTER TABLE "Assignment" ALTER COLUMN "state" SET DEFAULT 'WAITING_FOR_ACCEPTANCE';
COMMIT;
