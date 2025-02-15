-- CreateTable
CREATE TABLE "blog_post_comments" (
    "id" BIGINT NOT NULL,
    "blog_post_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "content" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "pk_blog_post_comments" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "blog_post_comments" ADD CONSTRAINT "blog_post_comments_blog_post_id_fkey" FOREIGN KEY ("blog_post_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_comments" ADD CONSTRAINT "blog_post_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TRIGGER update_blog_post_comments_updated_at BEFORE UPDATE
ON "blog_post_comments" FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();