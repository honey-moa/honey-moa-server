-- CreateTable
CREATE TABLE "attachments" (
    "id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "path" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(30) NOT NULL,
    "capacity" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pk_attachments" PRIMARY KEY ("id")
);
