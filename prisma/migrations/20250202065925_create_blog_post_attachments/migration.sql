-- CreateTable
CREATE TABLE "blog_post_attachments" (
    "id" BIGINT NOT NULL,
    "blog_post_id" BIGINT NOT NULL,
    "attachment_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_blog_post_attachments" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "blog_post_attachments" ADD CONSTRAINT "blog_post_attachments_blog_post_id_fkey" FOREIGN KEY ("blog_post_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_attachments" ADD CONSTRAINT "blog_post_attachments_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TRIGGER update_blog_post_attachments_updated_at BEFORE UPDATE
ON "blog_post_attachments" FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();