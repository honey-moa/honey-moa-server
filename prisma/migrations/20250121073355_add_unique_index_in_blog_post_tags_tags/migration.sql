/*
  Warnings:

  - You are about to alter the column `name` on the `tags` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(20)`.
  - A unique constraint covering the columns `[blog_post_id,tag_id]` on the table `blog_post_tags` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `tags` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tags" ALTER COLUMN "name" SET DATA TYPE VARCHAR(20);

-- CreateIndex
CREATE UNIQUE INDEX "blog_post_tags_blog_post_id_tag_id_key" ON "blog_post_tags"("blog_post_id", "tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_tags_name" ON "tags"("name");
