/*
  Warnings:

  - The values [email] on the enum `LoginTypeEnum` will be removed. If these variants are still used in the database, this will fail.
  - The values [user,admin] on the enum `UserRoleEnum` will be removed. If these variants are still used in the database, this will fail.
  - The values [email,password change] on the enum `UserVerifyTokenTypeEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LoginTypeEnum_new" AS ENUM ('EMAIL');
ALTER TABLE "users" ALTER COLUMN "login_type" TYPE "LoginTypeEnum_new" USING ("login_type"::text::"LoginTypeEnum_new");
ALTER TYPE "LoginTypeEnum" RENAME TO "LoginTypeEnum_old";
ALTER TYPE "LoginTypeEnum_new" RENAME TO "LoginTypeEnum";
DROP TYPE "LoginTypeEnum_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRoleEnum_new" AS ENUM ('USER', 'ADMIN');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRoleEnum_new" USING ("role"::text::"UserRoleEnum_new");
ALTER TYPE "UserRoleEnum" RENAME TO "UserRoleEnum_old";
ALTER TYPE "UserRoleEnum_new" RENAME TO "UserRoleEnum";
DROP TYPE "UserRoleEnum_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserVerifyTokenTypeEnum_new" AS ENUM ('EMAIL', 'PASSWORD_CHANGE');
ALTER TABLE "user_verify_tokens" ALTER COLUMN "type" TYPE "UserVerifyTokenTypeEnum_new" USING ("type"::text::"UserVerifyTokenTypeEnum_new");
ALTER TYPE "UserVerifyTokenTypeEnum" RENAME TO "UserVerifyTokenTypeEnum_old";
ALTER TYPE "UserVerifyTokenTypeEnum_new" RENAME TO "UserVerifyTokenTypeEnum";
DROP TYPE "UserVerifyTokenTypeEnum_old";
COMMIT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
