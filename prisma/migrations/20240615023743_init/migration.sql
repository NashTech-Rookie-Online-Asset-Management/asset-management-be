-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "Location" AS ENUM ('HCM', 'HN', 'DN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('CREATED', 'ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "AssetState" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'ASSIGNED', 'WAITING_FOR_RECYCLING', 'RECYCLED');

-- CreateEnum
CREATE TYPE "AssignmentState" AS ENUM ('WAITING_FOR_ACCEPTANCE', 'ACCEPTED', 'IS_REQUESTED');

-- CreateEnum
CREATE TYPE "RequestState" AS ENUM ('WAITING_FOR_RETURNING', 'COMPLETED');

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "staffCode" TEXT NOT NULL,
    "firstName" VARCHAR(128) NOT NULL,
    "lastName" VARCHAR(128) NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "gender" "Gender",
    "type" "AccountType" NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "location" "Location" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" SERIAL NOT NULL,
    "assetCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specification" TEXT NOT NULL,
    "installedDate" TIMESTAMP(3) NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "state" "AssetState" NOT NULL,
    "location" "Location" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "assignedToId" INTEGER NOT NULL,
    "assignedById" INTEGER NOT NULL,
    "assignedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT NOT NULL,
    "state" "AssignmentState" NOT NULL DEFAULT 'WAITING_FOR_ACCEPTANCE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturningRequest" (
    "id" SERIAL NOT NULL,
    "assignmentId" INTEGER NOT NULL,
    "requestedById" INTEGER NOT NULL,
    "acceptedById" INTEGER NOT NULL,
    "returnedDate" TIMESTAMP(3) NOT NULL,
    "state" "RequestState" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReturningRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_staffCode_key" ON "Account"("staffCode");

-- CreateIndex
CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_assetCode_key" ON "Asset"("assetCode");

-- CreateIndex
CREATE UNIQUE INDEX "Category_prefix_key" ON "Category"("prefix");

-- CreateIndex
CREATE UNIQUE INDEX "ReturningRequest_assignmentId_key" ON "ReturningRequest"("assignmentId");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturningRequest" ADD CONSTRAINT "ReturningRequest_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturningRequest" ADD CONSTRAINT "ReturningRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturningRequest" ADD CONSTRAINT "ReturningRequest_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
