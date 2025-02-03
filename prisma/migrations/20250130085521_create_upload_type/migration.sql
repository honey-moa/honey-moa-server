/*
  Warnings:

  - Added the required column `upload_type` to the `attachments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttachmentUploadTypeEnum" AS ENUM ('IMAGE', 'FILE');

-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "upload_type" "AttachmentUploadTypeEnum" NOT NULL;
