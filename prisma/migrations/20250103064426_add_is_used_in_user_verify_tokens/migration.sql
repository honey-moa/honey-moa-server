-- AlterTable
ALTER TABLE "user_verify_tokens" ADD COLUMN     "is_used" BOOLEAN NOT NULL DEFAULT false;
