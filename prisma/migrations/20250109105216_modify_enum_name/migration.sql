/*
  Warnings:

  - The values [CANCELLED] on the enum `UserConnectionStatusEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserConnectionStatusEnum_new" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'DISCONNECTED', 'CANCELED');
ALTER TABLE "user_connections" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "user_connections" ALTER COLUMN "status" TYPE "UserConnectionStatusEnum_new" USING ("status"::text::"UserConnectionStatusEnum_new");
ALTER TYPE "UserConnectionStatusEnum" RENAME TO "UserConnectionStatusEnum_old";
ALTER TYPE "UserConnectionStatusEnum_new" RENAME TO "UserConnectionStatusEnum";
DROP TYPE "UserConnectionStatusEnum_old";
ALTER TABLE "user_connections" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
