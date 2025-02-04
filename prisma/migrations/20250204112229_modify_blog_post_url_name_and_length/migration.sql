/*
  Warnings:

  - You are about to drop the column `blog_url` on the `chat_messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chat_messages" DROP COLUMN "blog_url",
ADD COLUMN     "blog_post_url" VARCHAR(255);
