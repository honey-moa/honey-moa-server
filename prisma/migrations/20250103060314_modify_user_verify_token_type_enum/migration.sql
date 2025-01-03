/*
  Warnings:

  - The values [change password] on the enum `UserVerifyTokenTypeEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserVerifyTokenTypeEnum_new" AS ENUM ('email', 'password change');
ALTER TABLE "user_verify_tokens" ALTER COLUMN "type" TYPE "UserVerifyTokenTypeEnum_new" USING ("type"::text::"UserVerifyTokenTypeEnum_new");
ALTER TYPE "UserVerifyTokenTypeEnum" RENAME TO "UserVerifyTokenTypeEnum_old";
ALTER TYPE "UserVerifyTokenTypeEnum_new" RENAME TO "UserVerifyTokenTypeEnum";
DROP TYPE "UserVerifyTokenTypeEnum_old";
COMMIT;
