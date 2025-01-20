/*
  Warnings:

  - You are about to drop the `posts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_user_id_fkey";

-- DropTable
DROP TABLE "posts";

-- CreateTable
CREATE TABLE "tags" (
    "id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_tags" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" BIGINT NOT NULL,
    "blog_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "contents" JSONB NOT NULL,
    "date" VARCHAR(20) NOT NULL,
    "location" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "pk_blog_posts" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_post_tags" (
    "id" BIGINT NOT NULL,
    "blog_post_id" BIGINT NOT NULL,
    "tag_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_blog_post_tags" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_blog_id_fkey" FOREIGN KEY ("blog_id") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_blog_post_id_fkey" FOREIGN KEY ("blog_post_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE
ON "blog_posts" FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();

CREATE TRIGGER update_blog_post_tags_updated_at BEFORE UPDATE
ON "blog_post_tags" FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE
ON "tags" FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();