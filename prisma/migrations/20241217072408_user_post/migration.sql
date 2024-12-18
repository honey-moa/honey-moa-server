-- CreateEnum
CREATE TYPE "UserRoleEnum" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "LoginTypeEnum" AS ENUM ('email');

-- CreateTable
CREATE TABLE "users" (
    "id" BIGINT NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "login_type" "LoginTypeEnum" NOT NULL,
    "role" "UserRoleEnum" NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "pk_users" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "pk_posts" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_login_type_key" ON "users"("email", "login_type");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
