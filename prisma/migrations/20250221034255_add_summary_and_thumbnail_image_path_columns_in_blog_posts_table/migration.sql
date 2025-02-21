-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN     "summary" VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN     "thumbnail_image_path" VARCHAR(255);

ALTER TABLE "blog_posts" ALTER COLUMN "summary" DROP DEFAULT;
