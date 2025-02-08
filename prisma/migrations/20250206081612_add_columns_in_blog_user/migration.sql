-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "background_image_path" VARCHAR(255),
ADD COLUMN     "d_day_start_date" VARCHAR(20) NOT NULL DEFAULT 'temp',
ADD COLUMN     "description" VARCHAR(255) NOT NULL DEFAULT 'temp';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profile_image_path" VARCHAR(255) NOT NULL DEFAULT 'temp';
