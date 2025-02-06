-- AlterTable
ALTER TABLE "blogs" ALTER COLUMN "d_day_start_date" DROP DEFAULT,
ALTER COLUMN "description" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "profile_image_path" DROP DEFAULT;
