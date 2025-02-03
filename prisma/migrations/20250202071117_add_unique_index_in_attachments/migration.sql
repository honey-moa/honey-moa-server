/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `attachments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[path]` on the table `attachments` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "idx_attachments_path";

-- CreateIndex
CREATE UNIQUE INDEX "uq_attachments_url" ON "attachments"("url");

-- CreateIndex
CREATE UNIQUE INDEX "uq_attachments_path" ON "attachments"("path");
