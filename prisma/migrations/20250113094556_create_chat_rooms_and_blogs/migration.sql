-- CreateTable
CREATE TABLE "blogs" (
    "id" BIGINT NOT NULL,
    "created_by" BIGINT NOT NULL,
    "connection_id" BIGINT NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "pk_blogs" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_rooms" (
    "id" BIGINT NOT NULL,
    "created_by" BIGINT NOT NULL,
    "connection_id" BIGINT NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "pk_chat_rooms" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_blogs_connection_id" ON "blogs"("connection_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_chat_rooms_connection_id" ON "chat_rooms"("connection_id");

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "user_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "user_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE
ON "blogs" FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();

CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE
ON "chat_rooms" FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();