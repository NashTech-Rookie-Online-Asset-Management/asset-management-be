ALTER TYPE "AssetState" RENAME TO "AssetStateOld";

CREATE TYPE "AssetState" AS ENUM ('ASSIGNED', 'AVAILABLE', 'RECYCLED', 'UNAVAILABLE', 'WAITING_FOR_RECYCLING');

ALTER TABLE "Asset" ALTER COLUMN "state" TYPE "AssetState" USING "state"::text::"AssetState";

DROP TYPE "AssetStateOld";