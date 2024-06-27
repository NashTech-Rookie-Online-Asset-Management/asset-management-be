ALTER TABLE "Account" 
ADD COLUMN "fullName" VARCHAR(256) NULL;

UPDATE "Account"
SET "fullName" = "firstName" || ' ' || "lastName";

ALTER TABLE "Account" 
ALTER COLUMN "fullName" SET NOT NULL;