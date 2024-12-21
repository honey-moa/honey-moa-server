/*
  Warnings:

  - Added the required column `nickname` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MbtiEnum" AS ENUM ('ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mbti" "MbtiEnum",
ADD COLUMN     "nickname" VARCHAR(20) NOT NULL;

-- CreateTable
CREATE TABLE "user_email_verify_tokens" (
    "id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "token" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pk_user_email_verify_tokens" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_email_verify_tokens_token" ON "user_email_verify_tokens"("token");

-- AddForeignKey
ALTER TABLE "user_email_verify_tokens" ADD CONSTRAINT "user_email_verify_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
